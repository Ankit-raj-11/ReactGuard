/**
 * check-status.js
 * 
 * Directly queries the Somnia Testnet to verify the current state 
 * of all Stasis components.
 */
const { ethers } = require("hardhat");

async function main() {
  const oracleAddress = process.env.ORACLE_ADDRESS;
  const stasisAddress = process.env.STASIS_ADDRESS;
  const poolAddress = process.env.POOL_ADDRESS;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔍 Stasis — On-Chain Status Check");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [oracle, guard, pool] = await Promise.all([
    ethers.getContractAt("MockOracle", oracleAddress),
    ethers.getContractAt("Stasis", stasisAddress),
    ethers.getContractAt("MockLendingPool", poolAddress)
  ]);

  const [price, status, poolPaused] = await Promise.all([
    oracle.getPrice(),
    guard.getStatus(),
    pool.paused()
  ]);

  console.log(`📈 MockOracle Price:    $${ethers.formatEther(price)}`);
  console.log(`🛡️ Stasis Status:`);
  console.log(`   - Pool Paused:       ${status.poolPaused}`);
  console.log(`   - Interventions:     ${status.interventions}`);
  console.log(`   - Last Drop:         ${Number(status.lastDrop) / 100}%`);
  console.log(`   - Last Defended:     ${status.lastDefended > 0 ? new Date(Number(status.lastDefended) * 1000).toLocaleString() : 'Never'}`);
  
  const subId = await guard.subscriptionId();
  console.log(`   - Subscription ID:   ${subId}`);

  console.log(`\n🏦 MockLendingPool:`);
  console.log(`   - Paused:            ${poolPaused}`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (poolPaused) {
    console.log("✅ PROTOCOL SECURED: Pool is currently paused.");
  } else {
    console.log("🟢 SYSTEM ACTIVE: Pool is operational.");
  }
}

main().catch(err => { console.error(err); process.exit(1); });
