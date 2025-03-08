import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PerpDEX System", function () {
  let owner: HardhatEthersSigner;
  let trader1: HardhatEthersSigner;
  let trader2: HardhatEthersSigner;
  let testUSDC: Contract;
  let aliAI: Contract;
  let ozAI: Contract;
  let priceOracle: Contract;
  let perpDex: Contract;

  const INITIAL_BALANCE = ethers.parseUnits("10000", 6); // 10,000 USDC
  const ALIAI_PRICE = ethers.parseUnits("5.5", 18); // $5.50
  const OZAI_PRICE = ethers.parseUnits("3.75", 18); // $3.75

  beforeEach(async function () {
    [owner, trader1, trader2] = await ethers.getSigners();

    // Deploy test tokens
    const TestUSDC = await ethers.getContractFactory("TestUSDC");
    testUSDC = await TestUSDC.deploy();

    const AliAIToken = await ethers.getContractFactory("AliAIToken");
    aliAI = await AliAIToken.deploy();

    const OzAIToken = await ethers.getContractFactory("OzAIToken");
    ozAI = await OzAIToken.deploy();

    // Deploy Oracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();

    // Deploy PerpDEX
    const PerpDEX = await ethers.getContractFactory("PerpDEX");
    perpDex = await PerpDEX.deploy(
      await priceOracle.getAddress(),
      await testUSDC.getAddress()
    );

    // Setup initial state
    await testUSDC.mint(trader1.address, INITIAL_BALANCE);
    await testUSDC.mint(trader2.address, INITIAL_BALANCE);

    // Setup markets
    await priceOracle.addSupportedToken(await aliAI.getAddress(), ALIAI_PRICE, 18);
    await priceOracle.addSupportedToken(await ozAI.getAddress(), OZAI_PRICE, 18);

    await perpDex.createMarket(await aliAI.getAddress(), 100, 80, 50000);
    await perpDex.createMarket(await ozAI.getAddress(), 100, 80, 50000);

    // Approve USDC spending
    await testUSDC.connect(trader1).approve(await perpDex.getAddress(), ethers.MaxUint256);
    await testUSDC.connect(trader2).approve(await perpDex.getAddress(), ethers.MaxUint256);
  });

  describe("Market Setup", function () {
    it("Should correctly set up markets", async function () {
      const aliAIMarket = await perpDex.getMarket(await aliAI.getAddress());
      expect(aliAIMarket.isActive).to.be.true;
      expect(aliAIMarket.maxLeverage).to.equal(100);
      expect(aliAIMarket.liquidationThreshold).to.equal(80);
      expect(aliAIMarket.maintenanceMargin).to.equal(50000);
    });

    it("Should have correct initial prices", async function () {
      const aliAIPrice = await priceOracle.getPrice(await aliAI.getAddress());
      const ozAIPrice = await priceOracle.getPrice(await ozAI.getAddress());
      expect(aliAIPrice).to.equal(ALIAI_PRICE);
      expect(ozAIPrice).to.equal(OZAI_PRICE);
    });
  });

  describe("Position Management", function () {
    it("Should open a long position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        true, // long
        margin,
        leverage
      );

      const position = await perpDex.getPosition(trader1.address, await aliAI.getAddress());
      expect(position.isLong).to.be.true;
      expect(position.margin).to.equal(margin);
      expect(position.leverage).to.equal(leverage);
      expect(position.size).to.equal(margin * leverage);
    });

    it("Should open a short position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        false, // short
        margin,
        leverage
      );

      const position = await perpDex.getPosition(trader1.address, await aliAI.getAddress());
      expect(position.isLong).to.be.false;
      expect(position.margin).to.equal(margin);
      expect(position.leverage).to.equal(leverage);
      expect(position.size).to.equal(margin * leverage);
    });

    it("Should calculate PnL correctly for long position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        true,
        margin,
        leverage
      );

      // Increase price by 10%
      const newPrice = ALIAI_PRICE * BigInt(110) / BigInt(100);
      await priceOracle.updatePrice(await aliAI.getAddress(), newPrice);

      const pnl = await perpDex.getUnrealizedPnL(trader1.address, await aliAI.getAddress());
      expect(pnl).to.be.gt(0);
    });

    it("Should calculate PnL correctly for short position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        false,
        margin,
        leverage
      );

      // Decrease price by 10%
      const newPrice = ALIAI_PRICE * BigInt(90) / BigInt(100);
      await priceOracle.updatePrice(await aliAI.getAddress(), newPrice);

      const pnl = await perpDex.getUnrealizedPnL(trader1.address, await aliAI.getAddress());
      expect(pnl).to.be.gt(0);
    });

    it("Should close a position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        true,
        margin,
        leverage
      );

      const initialBalance = await testUSDC.balanceOf(trader1.address);
      await perpDex.connect(trader1).closePosition(await aliAI.getAddress());

      const position = await perpDex.getPosition(trader1.address, await aliAI.getAddress());
      expect(position.size).to.equal(0n);

      const finalBalance = await testUSDC.balanceOf(trader1.address);
      expect(finalBalance).to.be.gte(initialBalance - margin);
    });

    it("Should fail to open position with excessive leverage", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 101n; // 101x

      await expect(
        perpDex.connect(trader1).openPosition(
          await aliAI.getAddress(),
          true,
          margin,
          leverage
        )
      ).to.be.revertedWith("Invalid leverage");
    });
  });

  describe("Liquidation", function () {
    it("Should liquidate underwater long position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        true,
        margin,
        leverage
      );

      // Drop price by 50%
      const newPrice = ALIAI_PRICE * BigInt(50) / BigInt(100);
      await priceOracle.updatePrice(await aliAI.getAddress(), newPrice);

      await perpDex.connect(trader2).liquidatePosition(trader1.address, await aliAI.getAddress());

      const position = await perpDex.getPosition(trader1.address, await aliAI.getAddress());
      expect(position.size).to.equal(0n);
    });

    it("Should liquidate underwater short position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        false,
        margin,
        leverage
      );

      // Increase price by 50%
      const newPrice = ALIAI_PRICE * BigInt(150) / BigInt(100);
      await priceOracle.updatePrice(await aliAI.getAddress(), newPrice);

      await perpDex.connect(trader2).liquidatePosition(trader1.address, await aliAI.getAddress());

      const position = await perpDex.getPosition(trader1.address, await aliAI.getAddress());
      expect(position.size).to.equal(0n);
    });

    it("Should fail to liquidate healthy position", async function () {
      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 10n; // 10x

      await perpDex.connect(trader1).openPosition(
        await aliAI.getAddress(),
        true,
        margin,
        leverage
      );

      // Small price change
      const newPrice = ALIAI_PRICE * BigInt(95) / BigInt(100);
      await priceOracle.updatePrice(await aliAI.getAddress(), newPrice);

      await expect(
        perpDex.connect(trader2).liquidatePosition(trader1.address, await aliAI.getAddress())
      ).to.be.revertedWith("Cannot liquidate");
    });
  });
}); 