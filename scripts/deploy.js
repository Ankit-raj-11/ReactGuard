// scripts/deploy.js
const { ethers } = require("hardhat");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { resolve } = require("path");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying ReactGuard system...");
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

  // Step 2: ReactGuard (pool = address(0) for now)
  const ReactGuard = await ethers.getContractFactory("ReactGuard");
  const reactGuard = await ReactGuard.deploy(oracleAddress, ethers.ZeroAddress);
  await reactGuard.waitForDeployment();
  const reactGuardAddress = await reactGuard.getAddress();
  console.log("✅ ReactGuard deployed at:", reactGuardAddress);

  // Step 3: MockLendingPool (guardian = ReactGuard)
  const MockLendingPool = await ethers.getContractFactory("MockLendingPool");
  const lendingPool = await MockLendingPool.deploy(reactGuardAddress);
  await lendingPool.waitForDeployment();
  const poolAddress = await lendingPool.getAddress();
  console.log("✅ MockLendingPool deployed at:", poolAddress);

  // Step 4: Link pool into ReactGuard
  const tx = await reactGuard.setLendingPool(poolAddress);
  await tx.wait();
  console.log("✅ ReactGuard linked to MockLendingPool\n");

  // Verify
  const guardian = await lendingPool.guardian();
  console.log("🔍 Verification:");
  console.log("   Pool guardian is ReactGuard:", guardian.toLowerCase() === reactGuardAddress.toLowerCase());
  console.log("   ⚡ Next: run setup-subscription.js to activate Somnia Reactivity");

  // Save addresses to .env
  const envPath = resolve(__dirname, "..", ".env");
  let envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

  const updates = {
    ORACLE_ADDRESS: oracleAddress,
    REACTGUARD_ADDRESS: reactGuardAddress,
    POOL_ADDRESS: poolAddress,
    VITE_ORACLE_ADDRESS: oracleAddress,
    VITE_REACTGUARD_ADDRESS: reactGuardAddress,
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
  console.log("🎉 ReactGuard system deployed and configured!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   ORACLE_ADDRESS    =", oracleAddress);
  console.log("   REACTGUARD_ADDRESS=", reactGuardAddress);
  console.log("   POOL_ADDRESS      =", poolAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📝 Addresses saved to .env");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
