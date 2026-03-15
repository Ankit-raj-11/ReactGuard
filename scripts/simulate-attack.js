/**
 * simulate-attack.js
 *
 * Demonstrates the full ReactGuard defense by triggering a real oracle price drop.
 *
 * IMPORTANT: Run setup-subscription.js FIRST so the Somnia Reactivity subscription
 * is active. After that, this script only needs to send ONE transaction:
 *   oracle.setPrice(newPrice)
 *
 * From that single tx, the Somnia validator network will:
 *   1. Detect the PriceDrop event
 *   2. Invoke ReactGuard._onEvent() in the same block — automatically
 *   3. ReactGuard's risk engine checks threshold → pool.pause() if ≥20%
 *
 * The pool is paused with ZERO transactions from us. Pure Somnia Reactivity.
 */
const { ethers } = require("hardhat");

async function main() {
  const [deployer, attacker] = await ethers.getSigners();

  const oracleAddress    = process.env.ORACLE_ADDRESS;
  const reactGuardAddress = process.env.REACTGUARD_ADDRESS;
  const poolAddress      = process.env.POOL_ADDRESS;

  if (!oracleAddress || !reactGuardAddress || !poolAddress) {
    throw new Error("Missing contract addresses in .env. Run deploy.js first.");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚔️  ReactGuard — Flash Loan Attack Simulation");
  console.log("   Somnia Reactivity: 1 attack tx → validators auto-defend");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const oracle    = await ethers.getContractAt("MockOracle",     oracleAddress);
  const reactGuard = await ethers.getContractAt("ReactGuard",    reactGuardAddress);
  const pool      = await ethers.getContractAt("MockLendingPool", poolAddress);

  // ── Pre-attack state ──────────────────────────────────────────────────────
  const currentPrice = await oracle.getPrice();
  console.log("📊 Pre-Attack State:");
  console.log("   Oracle price:", ethers.formatEther(currentPrice), "ETH");
  console.log("   Pool paused:", await pool.paused());
  const status = await reactGuard.getStatus();
  console.log("   Subscription ID:", reactGuard.subscriptionId ? await reactGuard.subscriptionId() : "check contract");
  console.log();

  // ── Seed pool with ETH (simulates TVL) ───────────────────────────────────
  if ((await ethers.provider.getBalance(poolAddress)) === 0n) {
    const seedTx = await deployer.sendTransaction({
      to: poolAddress,
      value: ethers.parseEther("1.0")
    });
    await seedTx.wait();
    console.log("💰 Pool seeded with 1 ETH (simulating TVL)\n");
  }

  // ── THE ATTACK: Only 1 transaction ───────────────────────────────────────
  const newPrice = (currentPrice * 80n) / 100n;
  console.log("🔴 ATTACK: Submitting oracle price manipulation...");
  console.log(`   ${ethers.formatEther(currentPrice)} → ${ethers.formatEther(newPrice)} ETH (−20%)`);
  console.log("   This emits PriceDrop on-chain.\n");

  const t0 = Date.now();
  const attackTx = await oracle.setPrice(newPrice);
  const attackReceipt = await attackTx.wait();
  console.log(`   ⛓  PriceDrop tx confirmed: ${attackTx.hash}`);
  console.log(`   Block: ${attackReceipt.blockNumber}\n`);

  // ── Wait for Somnia validators to invoke _onEvent() ───────────────────────
  console.log("⏳ Waiting for Somnia validators to auto-invoke ReactGuard._onEvent()...");
  console.log("   (Happens in the same block or next block, no action from us)\n");

  // Poll for pool pause — validators should respond within 1-3 blocks
  let defended = false;
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1500)); // wait ~1.5s per poll
    const paused = await pool.paused();
    if (paused) {
      defended = true;
      break;
    }
    process.stdout.write(`   Polling... (attempt ${i + 1}/10)\r`);
  }

  const latencyMs = Date.now() - t0;
  console.log();

  if (!defended) {
    console.log("⚠️  Pool not yet paused after 15s.");
    console.log("   Check if setup-subscription.js was run first.");
    console.log("   The subscription must be active for validators to auto-invoke.\n");
  } else {
    console.log(`⚡ SOMNIA REACTIVITY CONFIRMED — Pool paused in ${latencyMs}ms!`);
    console.log("   ReactGuard._onEvent() was invoked by Somnia validators");
    console.log("   This contract sent ZERO defense transactions. 100% on-chain.\n");
  }

  // ── Post-attack state ─────────────────────────────────────────────────────
  const poolPaused = await pool.paused();
  const postStatus = await reactGuard.getStatus();
  console.log("🛡️  Post-Reactivity State:");
  console.log("   Pool paused:", poolPaused, poolPaused ? "✅ DEFENDED!" : "⏳ Still waiting");
  console.log("   Interventions:", postStatus.interventions.toString());
  if (postStatus.lastDrop > 0n) {
    console.log("   Last drop:", `${Number(postStatus.lastDrop) / 100}%`);
  }
  console.log();

  // ── Attacker tries to borrow from paused pool ─────────────────────────────
  if (poolPaused) {
    console.log("💀 Attacker attempting to borrow from paused pool...");
    try {
      await pool.connect(attacker).borrow(ethers.parseEther("0.5"));
      console.log("❌ FAILED: Borrow succeeded — NOT defended!");
      process.exit(1);
    } catch (err) {
      if (err.message.includes("Pool is paused")) {
        console.log('   ✅ REVERTED: "MockLendingPool: Pool is paused"');
        console.log("   ✅ Attack neutralized — attacker got NOTHING!\n");
      } else {
        console.log("   ⚠️  Unexpected error:", err.message);
      }
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (defended) {
    console.log(`🎉 DEMO COMPLETE: Defended in ${latencyMs}ms.`);
    console.log(`   Attacker txs: 1 (price drop)`);
    console.log(`   Defender txs: 0 (Somnia validators handled it)`);
    console.log("   Fully on-chain. No bots. Pure Somnia Reactivity.");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log('🔄 Reset: npx hardhat run scripts/reset-demo.js --network somnia');
}

main().catch(err => { console.error(err); process.exit(1); });
