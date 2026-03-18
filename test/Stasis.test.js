/**
 * Stasis.test.js
 *
 * Tests for the real Somnia Reactivity architecture:
 * - Stasis.onEvent() is called by the Somnia precompile (0x0100)
 * - Tests impersonate 0x0100 to call _onEvent() — exactly what validators do
 */
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const PRECOMPILE = "0x0000000000000000000000000000000000000100"; // 0x0100

describe("Stasis System", function () {
  let oracle, stasis, lendingPool;
  let owner, attacker, randomUser;
  let precompileSigner;

  const INITIAL_PRICE  = ethers.parseEther("1000");
  const PRICE_DROP_TOPIC = ethers.keccak256(
    ethers.toUtf8Bytes("PriceDrop(int256,int256,uint256)")
  );

  beforeEach(async function () {
    [owner, attacker, randomUser] = await ethers.getSigners();

    // Deploy contracts (no subscription setup needed for unit tests)
    const MockOracle = await ethers.getContractFactory("MockOracle");
    oracle = await MockOracle.deploy(INITIAL_PRICE);
    await oracle.waitForDeployment();

    const Stasis = await ethers.getContractFactory("Stasis");
    stasis = await Stasis.deploy(await oracle.getAddress(), ethers.ZeroAddress);
    await stasis.waitForDeployment();

    const MockLendingPool = await ethers.getContractFactory("MockLendingPool");
    lendingPool = await MockLendingPool.deploy(await stasis.getAddress());
    await lendingPool.waitForDeployment();

    await stasis.setLendingPool(await lendingPool.getAddress());

    // ── Impersonate the Somnia Reactivity Precompile (0x0100) ──────────────
    // This is exactly what Somnia validators do when they invoke _onEvent().
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [PRECOMPILE],
    });
    await network.provider.send("hardhat_setBalance", [
      PRECOMPILE,
      "0x56BC75E2D63100000", // 100 ETH for gas
    ]);
    precompileSigner = await ethers.getSigner(PRECOMPILE);
  });

  afterEach(async function () {
    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [PRECOMPILE],
    });
  });

  /**
   * Helper: call _onEvent() from 0x0100 (as Somnia validators would)
   */
  async function triggerEvent(dropBps, oracleAddr) {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const newPrice = INITIAL_PRICE - (INITIAL_PRICE * BigInt(dropBps)) / 10000n;
    const data = abiCoder.encode(
      ["int256", "int256", "uint256"],
      [INITIAL_PRICE, newPrice, BigInt(dropBps)]
    );
    const topics = [PRICE_DROP_TOPIC, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash];
    return stasis.connect(precompileSigner)
      .onEvent(oracleAddr ?? await oracle.getAddress(), topics, data);
  }

  // ── MockOracle ──────────────────────────────────────────────────────────────
  describe("MockOracle", function () {
    it("deploys with correct initial price", async function () {
      expect(await oracle.getPrice()).to.equal(INITIAL_PRICE);
    });

    it("emits PriceDrop when price drops >= 5%", async function () {
      const newPrice = (INITIAL_PRICE * 79n) / 100n; // 21% drop
      await expect(oracle.setPrice(newPrice)).to.emit(oracle, "PriceDrop");
    });

    it("does NOT emit PriceDrop when drop < 5%", async function () {
      const newPrice = (INITIAL_PRICE * 97n) / 100n; // 3% drop
      await expect(oracle.setPrice(newPrice)).to.not.emit(oracle, "PriceDrop");
    });

    it("rejects non-owner price updates", async function () {
      await expect(oracle.connect(attacker).setPrice(500n))
        .to.be.revertedWith("Only owner");
    });
  });

  // ── MockLendingPool Security ──────────────────────────────────────────────
  describe("MockLendingPool — Security", function () {
    it("guardian is the Stasis address", async function () {
      expect(await lendingPool.guardian()).to.equal(await stasis.getAddress());
    });

    it("rejects pause() from random user", async function () {
      await expect(lendingPool.connect(randomUser).pause())
        .to.be.revertedWith("MockLendingPool: Only Guardian can pause");
    });

    it("rejects pause() from deployer/owner", async function () {
      await expect(lendingPool.connect(owner).pause())
        .to.be.revertedWith("MockLendingPool: Only Guardian can pause");
    });

    it("rejects pause() from attacker", async function () {
      await expect(lendingPool.connect(attacker).pause())
        .to.be.revertedWith("MockLendingPool: Only Guardian can pause");
    });

    it("only owner can unpause; random user cannot", async function () {
      // Pause pool via precompile-authenticated _onEvent
      await triggerEvent(2500);
      expect(await lendingPool.paused()).to.equal(true);

      await expect(lendingPool.connect(randomUser).unpause())
        .to.be.revertedWith("MockLendingPool: Only owner");

      await lendingPool.connect(owner).unpause();
      expect(await lendingPool.paused()).to.equal(false);
    });

    it("reverts borrows when paused", async function () {
      await triggerEvent(2500);
      await owner.sendTransaction({
        to: await lendingPool.getAddress(),
        value: ethers.parseEther("1")
      });
      await expect(lendingPool.connect(attacker).borrow(ethers.parseEther("0.5")))
        .to.be.revertedWith("MockLendingPool: Pool is paused");
    });
  });

  // ── Stasis Risk Engine ────────────────────────────────────────────────
  describe("Stasis — Risk Engine", function () {
    it("pauses pool when drop = 20% (threshold)", async function () {
      await triggerEvent(2000);
      expect(await lendingPool.paused()).to.equal(true);
    });

    it("pauses pool when drop > 20%", async function () {
      await triggerEvent(5000);
      expect(await lendingPool.paused()).to.equal(true);
    });

    it("does NOT pause when drop < 20%", async function () {
      await triggerEvent(1000);
      expect(await lendingPool.paused()).to.equal(false);
    });

    it("emits ProtocolPaused on intervention", async function () {
      await expect(triggerEvent(2500)).to.emit(stasis, "ProtocolPaused");
    });

    it("increments totalInterventions", async function () {
      await triggerEvent(2000);
      expect((await stasis.getStatus()).interventions).to.equal(1n);
    });

    it("rejects _onEvent from non-precompile callers", async function () {
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const data = abiCoder.encode(
        ["int256", "int256", "uint256"],
        [INITIAL_PRICE, INITIAL_PRICE / 2n, 5000n]
      );
      const topics = [PRICE_DROP_TOPIC, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash];

      // Official SomniaEventHandler uses custom error OnlyReactivityPrecompile()
      await expect(
        stasis.connect(attacker).onEvent(await oracle.getAddress(), topics, data)
      ).to.be.revertedWithCustomError(stasis, "OnlyReactivityPrecompile");

      await expect(
        stasis.connect(owner).onEvent(await oracle.getAddress(), topics, data)
      ).to.be.revertedWithCustomError(stasis, "OnlyReactivityPrecompile");
    });

    it("rejects events from wrong oracle address", async function () {
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const data = abiCoder.encode(
        ["int256", "int256", "uint256"],
        [INITIAL_PRICE, INITIAL_PRICE / 2n, 5000n]
      );
      const topics = [PRICE_DROP_TOPIC, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash];

      await expect(
        stasis.connect(precompileSigner)
          .onEvent(attacker.address, topics, data) // wrong emitter
      ).to.be.revertedWith("Stasis: Wrong oracle");
    });

    it("setLendingPool restricted to owner", async function () {
      await expect(
        stasis.connect(attacker).setLendingPool(ethers.ZeroAddress)
      ).to.be.revertedWith("Stasis: Only owner");
    });
  });

  // ── Full End-to-End Attack Scenario ──────────────────────────────────────
  describe("Full Attack Scenario", function () {
    it("oracle price drop → precompile invokes _onEvent → pool paused → borrow reverts", async function () {
      await owner.sendTransaction({
        to: await lendingPool.getAddress(),
        value: ethers.parseEther("5")
      });
      expect(await lendingPool.paused()).to.equal(false);

      // Step 1: Attacker drops oracle price 20% (1 tx from attacker)
      const newPrice = (INITIAL_PRICE * 80n) / 100n;
      await (await oracle.setPrice(newPrice)).wait();

      // Step 2: Somnia validators invoke _onEvent() from 0x0100 (automatic on testnet)
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const data = abiCoder.encode(
        ["int256", "int256", "uint256"],
        [INITIAL_PRICE, newPrice, 2000n]
      );
      const topics = [PRICE_DROP_TOPIC, ethers.ZeroHash, ethers.ZeroHash, ethers.ZeroHash];
      await stasis.connect(precompileSigner)
        .onEvent(await oracle.getAddress(), topics, data);

      // Pool is now paused — Stasis sent 0 defense transactions
      expect(await lendingPool.paused()).to.equal(true);

      // Step 3: Attacker tries to drain pool — REVERTS
      await expect(
        lendingPool.connect(attacker).borrow(ethers.parseEther("1"))
      ).to.be.revertedWith("MockLendingPool: Pool is paused");
    });
  });
});
