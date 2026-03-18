const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stasis Protocol", function () {
  let oracle, pool, guard;
  let owner, attacker, guardian;

  beforeEach(async () => {
    [owner, attacker, guardian] = await ethers.getSigners();

    oracle = await ethers.deployContract("MockOracle");
    pool   = await ethers.deployContract("MockLendingPool");
    guard  = await ethers.deployContract("Stasis", [oracle.target, pool.target]);

    // Wire up guardian
    await pool.setGuardian(guard.target);

    // Seed pool with 1 ETH for borrow tests
    await owner.sendTransaction({ to: pool.target, value: ethers.parseEther("1") });
  });

  // ── MockOracle ─────────────────────────────────────────────────────────────

  describe("MockOracle", function () {
    it("initialises with price = 1000e18", async () => {
      expect(await oracle.getPrice()).to.equal(ethers.parseEther("1000"));
    });

    it("does NOT emit PriceDrop for drops < 5%", async () => {
      const current = await oracle.getPrice();
      const newP = (current * 96n) / 100n; // 4% drop
      await expect(oracle.setPrice(newP)).to.not.emit(oracle, "PriceDrop");
    });

    it("emits PriceDrop with correct dropBps for ≥5% drop", async () => {
      const current = await oracle.getPrice();
      const newP = (current * 90n) / 100n; // 10% drop → dropBps = 1000
      await expect(oracle.setPrice(newP))
        .to.emit(oracle, "PriceDrop")
        .withArgs(current, newP, 1000n);
    });

    it("emits PriceDrop for 20% drop with dropBps = 2000", async () => {
      const current = await oracle.getPrice();
      const newP = (current * 80n) / 100n; // 20% drop
      await expect(oracle.setPrice(newP))
        .to.emit(oracle, "PriceDrop")
        .withArgs(current, newP, 2000n);
    });
  });

  // ── MockLendingPool ────────────────────────────────────────────────────────

  describe("MockLendingPool", function () {
    it("allows borrowing when not paused", async () => {
      await expect(
        pool.connect(attacker).borrow(ethers.parseEther("0.1"))
      ).to.emit(pool, "Borrowed");
    });

    it("only guardian can pause", async () => {
      await expect(pool.connect(attacker).pause()).to.be.revertedWith(
        "MockLendingPool: Only Guardian can pause"
      );
    });
  });

  // ── Stasis on-chain risk scoring ──────────────────────────────────────

  describe("Stasis._onEvent (simulated)", function () {
    it("lendingPool is set correctly", async () => {
      expect(await guard.lendingPool()).to.equal(pool.target);
    });

    it("oracle is set correctly", async () => {
      expect(await guard.oracle()).to.equal(oracle.target);
    });

    it("initialises with 0 interventions", async () => {
      expect((await guard.getStatus()).interventions).to.equal(0n);
    });

    it("pool starts unpaused", async () => {
      expect(await pool.paused()).to.equal(false);
    });
  });

  // ── End-to-end scenario (simulated with manual trigger) ──────────────

  describe("End-to-end: Attack simulation flow", function () {
    it("pool can be paused by Stasis manualTrigger for demo", async () => {
      const oldPrice = ethers.parseEther("1000");
      const newPrice = ethers.parseEther("800"); // 20% drop
      const dropBps = 2000;

      expect(await pool.paused()).to.equal(false);
      await guard.connect(owner).manualTrigger(oldPrice, newPrice, dropBps);
      expect(await pool.paused()).to.equal(true);
    });

    it("borrow reverts after pool paused", async () => {
      const oldPrice = ethers.parseEther("1000");
      const newPrice = ethers.parseEther("800");
      const dropBps = 2000;
      await guard.connect(owner).manualTrigger(oldPrice, newPrice, dropBps);

      await expect(
        pool.connect(attacker).borrow(ethers.parseEther("0.1"))
      ).to.be.revertedWith("MockLendingPool: Pool is paused");
    });
  });
});
