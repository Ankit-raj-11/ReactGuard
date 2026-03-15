import { createPublicClient, createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { SDK } from "@somnia-chain/reactivity";
import { broadcast } from "./wsServer.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load deployed addresses ───────────────────────────────────────────────
const addressFile = join(__dirname, "../../contracts/deployed-addresses.json");
if (!existsSync(addressFile)) {
  console.error("❌ deployed-addresses.json not found. Run contracts/scripts/deploy.js first.");
  process.exit(1);
}
const addresses = JSON.parse(readFileSync(addressFile, "utf8"));

// ── Somnia testnet definition ─────────────────────────────────────────────
const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Devnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.SOMNIA_RPC_URL] },
  },
});

// ── Minimal ABIs for state reading ────────────────────────────────────────
const OracleABI = [
  { name: "price",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "int256" }] },
  { name: "PriceDrop", type: "event", inputs: [
    { name: "oldPrice", type: "int256", indexed: false },
    { name: "newPrice", type: "int256", indexed: false },
    { name: "dropBps",  type: "uint256", indexed: false },
  ]},
];

const PoolABI = [
  { name: "paused",       type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "totalBorrowed",type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "getPoolBalance",type:"function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
];

const GuardABI = [
  { name: "totalDefensesTriggered", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "lastRiskScore",          type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "defenseActive",          type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "DefenseTriggered", type: "event", inputs: [
    { name: "defenseType", type: "string",  indexed: false },
    { name: "riskScore",   type: "uint256", indexed: false },
    { name: "emitter",     type: "address", indexed: true  },
    { name: "timestamp",   type: "uint256", indexed: false },
  ]},
];

// ── SDK initialisation ────────────────────────────────────────────────────
const account     = privateKeyToAccount(process.env.PRIVATE_KEY);
const publicClient = createPublicClient({ chain: somniaTestnet, transport: http() });
const walletClient = createWalletClient({ account, chain: somniaTestnet, transport: http() });
const sdk          = new SDK({ public: publicClient, wallet: walletClient });

// ── Subscribe: read-only stream of oracle price + pool state ──────────────
export async function startReactivityStream() {
  console.log("📡 Starting Somnia Reactivity read-only stream...");
  console.log("   Oracle:   ", addresses.oracle);
  console.log("   Pool:     ", addresses.pool);
  console.log("   Guardian: ", addresses.guardian);

  await sdk.subscribe({
    // Multicall: fetch oracle price AND pool paused state on every event push
    ethCalls: [
      {
        address:      addresses.oracle,
        abi:          OracleABI,
        functionName: "price",
      },
      {
        address:      addresses.pool,
        abi:          PoolABI,
        functionName: "paused",
      },
      {
        address:      addresses.pool,
        abi:          PoolABI,
        functionName: "getPoolBalance",
      },
      {
        address:      addresses.guardian,
        abi:          GuardABI,
        functionName: "totalDefensesTriggered",
      },
      {
        address:      addresses.guardian,
        abi:          GuardABI,
        functionName: "lastRiskScore",
      },
    ],
    onData: (data) => {
      // Parse the returned state values
      const [price, paused, poolBalance, totalDefenses, lastScore] =
        data.results ?? [];

      const payload = {
        type:            "CHAIN_STATE",
        timestamp:       Date.now(),
        oraclePrice:     price?.toString()        ?? "0",
        poolPaused:      paused                   ?? false,
        poolBalance:     poolBalance?.toString()  ?? "0",
        totalDefenses:   totalDefenses?.toString() ?? "0",
        lastRiskScore:   lastScore?.toString()    ?? "0",
        blockNumber:     data.blockNumber,
        // Raw event data if present
        events:          data.events              ?? [],
      };

      broadcast(payload);
      console.log(
        `[STREAM] Block ${payload.blockNumber} | Price: ${price} | Paused: ${paused} | Defenses: ${totalDefenses}`
      );
    },
    onlyPushChanges: true, // only push when state actually changes
  });

  console.log("✅ Reactivity stream active — broadcasting to dashboard WebSocket.");
}
