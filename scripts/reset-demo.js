// scripts/reset-demo.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const oracleAddress = process.env.ORACLE_ADDRESS;
  const poolAddress = process.env.POOL_ADDRESS;

  if (!oracleAddress || !poolAddress) {
    throw new Error("Missing ORACLE_ADDRESS or POOL_ADDRESS in .env. Run deploy.js first.");
  }

  const [deployer] = await ethers.getSigners();
  console.log("🔄 Resetting Stasis demo state...");

  const oracle = await ethers.getContractAt("MockOracle", oracleAddress);
  const pool = await ethers.getContractAt("MockLendingPool", poolAddress);

  // Reset oracle price to 1000 ETH
  const normalPrice = ethers.parseEther("1000");
  const currentPrice = await oracle.getPrice();
  console.log(`\n📈 Oracle: ${ethers.formatEther(currentPrice)} → 1000 ETH`);
  await (await oracle.setPrice(normalPrice)).wait();
  console.log("   ✅ Oracle price reset");

  // Unpause pool (owner only)
  const isPaused = await pool.paused();
  if (isPaused) {
    await (await pool.unpause()).wait();
    console.log("   ✅ Pool unpaused");
  } else {
    console.log("   ℹ️  Pool already active");
  }

  console.log("\n✅ Reset complete!");
  console.log("   Oracle price:", ethers.formatEther(await oracle.getPrice()), "ETH");
  console.log("   Pool paused:", await pool.paused());
  console.log("\n🎬 Ready for next demo take.");
}

main().catch((err) => { console.error(err); process.exit(1); });
