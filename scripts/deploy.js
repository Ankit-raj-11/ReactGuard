// scripts/deploy.js
const { ethers } = require("hardhat");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { resolve } = require("path");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying Stasis system...");
  console.log("   Deployer:", deployer.address);
  console.log(
    "   Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // Step 1: MockOracle
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const initialPrice = ethers.parseEther("1000");
  const oracle = await MockOracle.deploy(initialPrice);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("✅ MockOracle deployed at:", oracleAddress);

  // Step 2: Stasis (pool = address(0) for now)
  const Stasis = await ethers.getContractFactory("Stasis");
  const stasis = await Stasis.deploy(await oracle.getAddress(), ethers.ZeroAddress);
  await stasis.waitForDeployment();
  const stasisAddr = await stasis.getAddress();
  console.log("Stasis deployed to:", stasisAddr);

  // Step 3: MockLendingPool (guardian = Stasis)
  const MockLendingPool = await ethers.getContractFactory("MockLendingPool");
  const lendingPool = await MockLendingPool.deploy(stasisAddr);
  await lendingPool.waitForDeployment();
  const poolAddr = await lendingPool.getAddress();
  console.log("MockLendingPool deployed to:", poolAddr);

  // Step 4: Link back
  await stasis.setLendingPool(poolAddr);
  await tx.wait();
  console.log("✅ Stasis linked to MockLendingPool\n");

  // Verify
  const guardian = await lendingPool.guardian();
  console.log("🔍 Verification:");
  console.log("   Pool guardian is Stasis:", guardian.toLowerCase() === stasisAddress.toLowerCase());
  console.log("   ⚡ Next: run setup-subscription.js to activate Somnia Reactivity");

  // Save addresses to .env
  const envPath = resolve(__dirname, "..", ".env");
  let envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

  const updates = {
    ORACLE_ADDRESS: oracleAddress,
    STASIS_ADDRESS: stasisAddress,
    POOL_ADDRESS: poolAddress,
    VITE_ORACLE_ADDRESS: oracleAddress,
    VITE_STASIS_ADDRESS: stasisAddress,
    VITE_POOL_ADDRESS: poolAddress,
  };

  for (const [key, val] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${val}`);
    } else {
      envContent += `\n${key}=${val}`;
    }
  }

  writeFileSync(envPath, envContent.trim() + "\n");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Stasis system deployed and configured!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   ORACLE_ADDRESS    =", oracleAddress);
  console.log("   STASIS_ADDRESS=", stasisAddress);
  console.log("   POOL_ADDRESS      =", poolAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📝 Addresses saved to .env");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
