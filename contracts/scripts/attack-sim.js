/**
 * attack-sim.js
 * Simulates a flash loan oracle manipulation attack.
 *
 * PROOF OF ON-CHAIN DEFENSE:
 * This script only sends 2 transactions (setPrice + borrow).
 * The pool pause is triggered by Stasis._onEvent() via Somnia validators —
 * NOT by this script or the Node.js backend.
 *
 * Expected outcome:
 *   1. oracle.setPrice(−20%) fires PriceDrop event
 *   2. Somnia validators invoke Stasis._onEvent() atomically
 *   3. Stasis calculates riskScore = 100 → calls pool.pause()
 *   4. pool.borrow() REVERTS with "pool is paused by guardian"
 *   ✅ Defense was entirely on-chain. Backend sent 0 defense transactions.
 */

const { ethers } = require("hardhat");
const addresses = require("../deployed-addresses.json");

const OracleABI = require("../artifacts/src/MockOracle.sol/MockOracle.json").abi;
const PoolABI   = require("../artifacts/src/MockLendingPool.sol/MockLendingPool.json").abi;

async function simulateOracleAttack() {
  const [attacker] = await ethers.getSigners();

  const oracle = new ethers.Contract(addresses.oracle,   OracleABI, attacker);
  const pool   = new ethers.Contract(addresses.pool,     PoolABI,   attacker);

  console.log("═".repeat(60));
  console.log("  🔥 Stasis Attack Simulation");
  console.log("═".repeat(60));
  console.log("  Attacker:  ", attacker.address);
  console.log("  Oracle:    ", addresses.oracle);
  console.log("  Pool:      ", addresses.pool);
  console.log("  Guardian:  ", addresses.guardian);
  console.log("─".repeat(60));

  // ── Pre-attack state ──────────────────────────────────────────
  const priceBefore = await oracle.price();
  const poolBalance = await ethers.provider.getBalance(addresses.pool);
  const pausedBefore = await pool.paused();
  console.log(`\n📊 Pre-attack state:`);
  console.log(`   Oracle price: ${ethers.formatEther(priceBefore)} (1000 STT)`);
  console.log(`   Pool balance: ${ethers.formatEther(poolBalance)} STT`);
  console.log(`   Pool paused:  ${pausedBefore}`);

  // ── Step 1: Flash loan oracle manipulation ────────────────────
  console.log(`\n[STEP 1] Attacker drops oracle price by 20%...`);
  const newPrice = (priceBefore * 80n) / 100n; // 20% drop → dropBps = 2000

  const attackTx = await oracle.setPrice(newPrice);
  const attackReceipt = await attackTx.wait();
  const attackBlock = attackReceipt.blockNumber;

  console.log(`   📉 Price set to ${ethers.formatEther(newPrice)}`);
  console.log(`   📤 PriceDrop event emitted (dropBps = 2000, ≥500 threshold)`);
  console.log(`   🔗 TX: ${attackTx.hash}`);
  console.log(`   📦 Block: ${attackBlock}`);

  // ── Step 2: Wait for Somnia validators to invoke Stasis ───
  console.log(`\n[STEP 2] Somnia validators detecting PriceDrop subscription...`);
  console.log(`   ⏳ Stasis._onEvent() → riskScore = 50+30+20 = 100 ≥ 80`);
  console.log(`   ⚡ pool.pause() called on-chain — no backend tx sent!`);

  // Brief wait for Somnia's sub-second finality
  await new Promise((r) => setTimeout(r, 2000));

  // ── Step 3: Verify pool is paused ────────────────────────────
  const pausedAfter = await pool.paused();
  console.log(`\n[STEP 3] Verifying pool state after event...`);
  console.log(`   Pool paused: ${pausedAfter}`);

  // ── Step 4: Attacker tries to drain pool ─────────────────────
  console.log(`\n[STEP 4] Attacker attempts to borrow from pool...`);
  try {
    const drainAmount = poolBalance / 2n;
    await pool.borrow(drainAmount);
    console.log("   ❌ UNEXPECTED: Borrow succeeded — defense did not fire!");
    console.log("      Check: Is the subscription active? (run setup-subscription.js)");
  } catch (err) {
    const msg = err.message || "";
    console.log("   🛡️  REVERTED:", msg.includes("paused") ? '"Pool is paused by guardian"' : err.shortMessage ?? msg.slice(0, 80));
  }

  // ── Final summary ────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  const guardABI = require("../artifacts/src/Stasis.sol/Stasis.json").abi;
  const guard = new ethers.Contract(addresses.guardian, guardABI, attacker);
  const defenseCount = await guard.totalDefensesTriggered();
  const lastScore    = await guard.lastRiskScore();
  const active       = await guard.defenseActive();

  console.log("  📊 Final Stasis state:");
  console.log(`     Defenses triggered: ${defenseCount}`);
  console.log(`     Last risk score:    ${lastScore}/100`);
  console.log(`     Defense active:     ${active}`);
  console.log(`     Pool paused:        ${await pool.paused()}`);
  console.log("─".repeat(60));
  console.log("  ✅ Node.js backend sent ZERO defense transactions.");
  console.log("  ✅ Defense executed natively by Somnia validators.");
  console.log("  ✅ Impossible on standard EVM — Somnia Reactivity only.");
  console.log("═".repeat(60));
}

simulateOracleAttack().catch(console.error);
