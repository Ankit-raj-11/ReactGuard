/**
 * setup-subscription.js
 * Registers a Somnia Reactivity on-chain subscription so validators
 * invoke ReactGuard._onEvent() whenever MockOracle emits PriceDrop.
 *
 * Requirements:
 *   - All contracts deployed (run deploy.js first)
 *   - Wallet holds ≥ 32 SOM (test tokens from Telegram)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { SDK } from "@somnia-chain/reactivity";
import addresses from "../deployed-addresses.json" assert { type: "json" };
import * as dotenv from "dotenv";
dotenv.config();

const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Devnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: { default: { http: [process.env.SOMNIA_RPC_URL] } },
});

const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});
const walletClient = createWalletClient({
  account,
  chain: somniaTestnet,
  transport: http(),
});

const sdk = new SDK({ public: publicClient, wallet: walletClient });

// PriceDrop(int256,int256,uint256) topic
const PRICE_DROP_TOPIC = "0x" +
  Buffer.from(
    require("crypto")
      .createHash("keccak256")
      .update("PriceDrop(int256,int256,uint256)")
      .digest()
  ).toString("hex");

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(
    "Wallet balance:",
    parseFloat(balance.toString()) / 1e18,
    "STT"
  );
  if (balance < parseEther("32")) {
    console.error(
      "❌ Insufficient balance. Need ≥ 32 SOM/STT to fund on-chain subscription."
    );
    console.error(
      "   Request test tokens: https://t.me/+XHq0F0JXMyhmMzM0"
    );
    process.exit(1);
  }

  console.log("\n📡 Creating Somnia Reactivity on-chain subscription...");
  console.log("   Emitter (Oracle):  ", addresses.oracle);
  console.log("   Handler (ReactGuard):", addresses.guardian);
  console.log("   Topic (PriceDrop): ", PRICE_DROP_TOPIC);

  // On-chain subscription: validators invoke ReactGuard._onEvent on PriceDrop
  const subscription = await sdk.createOnChainSubscription({
    emitter:      addresses.oracle,           // watch MockOracle
    handlerAddress: addresses.guardian,       // call ReactGuard._onEvent
    topics:       [PRICE_DROP_TOPIC],         // filter: PriceDrop events only
    isGuaranteed: true,                       // eventual delivery guaranteed
    isCoalesced:  false,                      // fire immediately, don't batch
    gasConfig: {
      gasLimit:        300_000n,
      maxFeePerGas:    1_000_000_000n,        // 1 gwei
      priorityFeePerGas: 100_000_000n,        // 0.1 gwei
    },
  });

  console.log("\n✅ On-chain Reactivity subscription created!");
  console.log("   Subscription ID:", subscription.id ?? "(see tx)");
  console.log(
    "\n🛡️  ReactGuard is now ACTIVE. Any PriceDrop ≥500 bps on MockOracle"
  );
  console.log("   will trigger on-chain risk scoring and defense automatically.");
  console.log("\nNext: cd .. && npm run dev (backend), then simulate an attack.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
