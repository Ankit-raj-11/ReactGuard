const { ethers } = require('hardhat');

async function main() {
  const [owner] = await ethers.getSigners();
  const reactGuard = await ethers.getContractAt('ReactGuard', process.env.REACTGUARD_ADDRESS);
  const pool = await ethers.getContractAt('MockLendingPool', process.env.POOL_ADDRESS);
  
  console.log('Testing manual trigger...');
  console.log('Before - Pool paused:', await pool.paused());
  
  const tx = await reactGuard.manualTrigger(
    ethers.parseEther('1000'),
    ethers.parseEther('800'), 
    2000 // 20% drop
  );
  await tx.wait();
  console.log('Manual trigger sent:', tx.hash);
  
  // Check status
  const status = await reactGuard.getStatus();
  console.log('After - Pool paused:', status.poolPaused);
  console.log('Interventions:', status.interventions.toString());
  console.log('Last drop:', status.lastDrop.toString(), 'bps');
}

main().catch(console.error);