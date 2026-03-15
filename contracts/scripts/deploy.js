const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ReactGuard Protocol...");
  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "STT"
  );
  console.log("─".repeat(50));

  // 1. Deploy MockOracle
  console.log("\n[1/3] Deploying MockOracle...");
  const Oracle = await ethers.deployContract("MockOracle");
  await Oracle.waitForDeployment();
  console.log("  ✅ MockOracle:", Oracle.target);

  // 2. Deploy MockLendingPool
  console.log("\n[2/3] Deploying MockLendingPool...");
  const Pool = await ethers.deployContract("MockLendingPool");
  await Pool.waitForDeployment();
  console.log("  ✅ MockLendingPool:", Pool.target);

  // 3. Deploy ReactGuard (the on-chain risk engine)
  console.log("\n[3/3] Deploying ReactGuard (SomniaEventHandler)...");
  const Guard = await ethers.deployContract("ReactGuard", [
    Pool.target,
    Oracle.target,
  ]);
  await Guard.waitForDeployment();
  console.log("  ✅ ReactGuard:", Guard.target);

  // 4. Set ReactGuard as the pool's guardian
  console.log("\n[4/4] Configuring: Setting ReactGuard as pool guardian...");
  const tx = await Pool.setGuardian(Guard.target);
  await tx.wait();
  console.log("  ✅ Guardian set — ReactGuard can now pause the pool");

  // 5. Seed the pool with some STT for borrow demo
  console.log("\n[5/5] Seeding pool with 1 STT for demo borrowing...");
  const seedTx = await deployer.sendTransaction({
    to: Pool.target,
    value: ethers.parseEther("1"),
  });
  await seedTx.wait();
  console.log("  ✅ Pool seeded with 1 STT");

  // 6. Print .env values
  console.log("\n" + "─".repeat(50));
  console.log("📋 Add these to your .env files:\n");
  const envOutput = [
    `ORACLE_ADDRESS=${Oracle.target}`,
    `POOL_ADDRESS=${Pool.target}`,
    `GUARD_ADDRESS=${Guard.target}`,
  ].join("\n");
  console.log(envOutput);

  // 7. Write deployed-addresses.json for the frontend & backend to import
  const addresses = {
    oracle:     Oracle.target,
    pool:       Pool.target,
    guardian:   Guard.target,
    network:    "somnia-testnet",
    chainId:    50312,
    deployedAt: new Date().toISOString(),
  };
  const outPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log(`\n✅ Addresses saved to deployed-addresses.json`);
  console.log("─".repeat(50));
  console.log("\n🚀 ReactGuard Protocol deployed successfully!");
  console.log(
    "   Next: run `npm run subscribe` to activate Reactivity subscription."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
