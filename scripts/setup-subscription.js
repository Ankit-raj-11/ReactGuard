/**
 * setup-subscription.js
 *
 * Creates the real Somnia Reactivity subscription by calling the precompile
 * DIRECTLY from the EOA wallet (not through a smart contract).
 *
 * The subscription links:
 *   MockOracle.PriceDrop  →  Stasis.onEvent()
 *
 * After this runs, every oracle price drop ≥ 5% will trigger Stasis.
 * automatically via Somnia validator network — no manual trigger needed.
 */
const { ethers } = require("hardhat");

// Somnia Reactivity Precompile ABI (calling directly from EOA)
const PRECOMPILE_ABI = [
  "function subscribe((bytes32[4] eventTopics, address origin, address caller, address emitter, address handlerContractAddress, bytes4 handlerFunctionSelector, uint64 priorityFeePerGas, uint64 maxFeePerGas, uint64 gasLimit, bool isGuaranteed, bool isCoalesced) subscriptionData) external returns (uint256 subscriptionId)",
  "function getSubscriptionInfo(uint256 subscriptionId) external view returns ((bytes32[4] eventTopics, address origin, address caller, address emitter, address handlerContractAddress, bytes4 handlerFunctionSelector, uint64 priorityFeePerGas, uint64 maxFeePerGas, uint64 gasLimit, bool isGuaranteed, bool isCoalesced) subscriptionData, address owner)",
  "event SubscriptionCreated(uint256 indexed subscriptionId, address indexed owner, (bytes32[4] eventTopics, address origin, address caller, address emitter, address handlerContractAddress, bytes4 handlerFunctionSelector, uint64 priorityFeePerGas, uint64 maxFeePerGas, uint64 gasLimit, bool isGuaranteed, bool isCoalesced) subscriptionData)",
];

const PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000000100";

async function main() {
  const [owner] = await ethers.getSigners();

  const oracleAddress    = process.env.ORACLE_ADDRESS;
  const stasisAddress = process.env.STASIS_ADDRESS;

  if (!oracleAddress || !stasisAddress) {
    throw new Error("Missing ORACLE_ADDRESS or STASIS_ADDRESS in .env.");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚡  Stasis — Setting Up Somnia Reactivity Subscription");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── 1. Balance check ───────────────────────────────────────────────────────
  const balance = await ethers.provider.getBalance(owner.address);
  const balanceSTT = parseFloat(ethers.formatEther(balance));
  console.log(`💰 Wallet: ${owner.address}`);
  console.log(`   Balance: ${balanceSTT.toFixed(4)} STT`);

  if (balanceSTT < 32) {
    console.error(`\n❌ Need ≥32 STT, have ${balanceSTT.toFixed(4)}.`);
    process.exit(1);
  }
  console.log("   ✅ Sufficient balance.\n");

  // ── 2. Build onEvent() selector ────────────────────────────────────────────
  // onEvent(address,bytes32[],bytes) — the public handler from SomniaEventHandler
  const onEventSelector = ethers.dataSlice(
    ethers.keccak256(ethers.toUtf8Bytes("onEvent(address,bytes32[],bytes)")),
    0, 4
  );
  console.log(`   onEvent() selector: ${onEventSelector}`);

  // ── 3. PriceDrop event topic ───────────────────────────────────────────────
  const PRICE_DROP_TOPIC = ethers.keccak256(
    ethers.toUtf8Bytes("PriceDrop(int256,int256,uint256)")
  );

  // ── 4. Call subscribe() directly from EOA ─────────────────────────────────
  const precompile = new ethers.Contract(PRECOMPILE_ADDRESS, PRECOMPILE_ABI, owner);

  const subscriptionData = {
    eventTopics: [
      PRICE_DROP_TOPIC,
      ethers.ZeroHash,
      ethers.ZeroHash,
      ethers.ZeroHash,
    ],
    origin:                  ethers.ZeroAddress, // any tx.origin
    caller:                  ethers.ZeroAddress, // any msg.sender
    emitter:                 oracleAddress,        // only MockOracle events
    handlerContractAddress:  stasisAddress,    // Stasis handles it
    handlerFunctionSelector: onEventSelector,       // onEvent() public handler
    priorityFeePerGas:       1_000_000_000n,       // 1 gwei in nanoSTT
    maxFeePerGas:            100_000_000_000n,      // 100 gwei
    gasLimit:                200_000n,
    isGuaranteed:            true,
    isCoalesced:             false,
  };

  console.log("📡 Creating subscription via Precompile (0x0100)...");
  console.log(`   Oracle (emitter):  ${oracleAddress}`);
  console.log(`   Handler contract:  ${stasisAddress}`);
  console.log(`   Handler function:  onEvent() [${onEventSelector}]`);
  console.log(`   Event filter:      PriceDrop (${PRICE_DROP_TOPIC.slice(0,10)}...)\n`);

  const tx = await precompile.subscribe(subscriptionData, { gasLimit: 500_000 });
  console.log(`   ⛓  Tx sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);

  // ── 5. Parse the SubscriptionCreated event ────────────────────────────────
  const iface = new ethers.Interface(PRECOMPILE_ABI);
  let subId = null;

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() === PRECOMPILE_ADDRESS.toLowerCase()) {
      // Topic 0 is event signature, Topic 1 is subscriptionId (indexed)
      if (log.topics.length >= 2) {
        subId = BigInt(log.topics[1]);
        break;
      }
    }
  }

  if (subId !== null) {
    console.log(`✅ Subscription ID: ${subId.toString()}`);
    
    console.log("\n🔄 Syncing Subscription ID to Stasis contract...");
    const stasis = await ethers.getContractAt("Stasis", stasisAddress);
    const syncTx = await stasis.setSubscriptionId(subId);
    await syncTx.wait();
    console.log("   ✅ Synced!");
  } else {
    console.log("⚠️ Transaction confirmed but could not extract Subscription ID.");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 SUBSCRIPTION ACTIVE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nFrom now on, the flow is 100% automatic:");
  console.log("  1. oracle.setPrice(−20%)  →  PriceDrop emitted on-chain");
  console.log("  2. Somnia validators detect PriceDrop subscription match");
  console.log("  3. Validators invoke Stasis.onEvent() IN THE SAME BLOCK");
  console.log("  4. _onEvent() risk engine runs → pool.pause() if ≥20% drop");
  console.log("\n  ⚡ ZERO off-chain bots. ZERO manual triggers. Pure Somnia Reactivity.");
  console.log("\nRun the attack demo:");
  console.log("  npx hardhat run scripts/simulate-attack.js --network somnia\n");
}

main().catch(err => { console.error(err); process.exit(1); });
