import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying contracts...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy USDC
  const TestUSDC = await ethers.getContractFactory("TestUSDC");
  const testUSDC = await TestUSDC.deploy();
  console.log("TestUSDC deployed to:", await testUSDC.getAddress());

  // Deploy AI Tokens
  const AliAIToken = await ethers.getContractFactory("AliAIToken");
  const aliAI = await AliAIToken.deploy();
  console.log("AliAI Token deployed to:", await aliAI.getAddress());

  const OzAIToken = await ethers.getContractFactory("OzAIToken");
  const ozAI = await OzAIToken.deploy();
  console.log("OzAI Token deployed to:", await ozAI.getAddress());

  const GGAIToken = await ethers.getContractFactory("GGAIToken");
  const ggAI = await GGAIToken.deploy();
  console.log("GGAI Token deployed to:", await ggAI.getAddress());

  const HiAIToken = await ethers.getContractFactory("HiAIToken");
  const hiAI = await HiAIToken.deploy();
  console.log("HiAI Token deployed to:", await hiAI.getAddress());

  // Deploy Oracle
  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  console.log("PriceOracle deployed to:", await priceOracle.getAddress());

  // Deploy PerpDEX
  const PerpDEX = await ethers.getContractFactory("PerpDEX");
  const perpDex = await PerpDEX.deploy(
    await priceOracle.getAddress(),
    await testUSDC.getAddress()
  );
  console.log("PerpDEX deployed to:", await perpDex.getAddress());

  // Mint initial USDC for testing
  const INITIAL_MINT = ethers.parseUnits("1000000", 6); // 1M USDC
  await testUSDC.mint(deployer.address, INITIAL_MINT);
  console.log("\nMinting initial USDC...");
  console.log(`Minted ${ethers.formatUnits(INITIAL_MINT, 6)} USDC to ${deployer.address}`);

  // Setup markets and prices
  console.log("\nSetting up markets...");

  // AliAI Token
  const aliAIPrice = ethers.parseUnits("5.50", 18);
  await priceOracle.addSupportedToken(await aliAI.getAddress(), aliAIPrice, 18);
  console.log(`Added aliAI to oracle with price ${ethers.formatUnits(aliAIPrice, 18)}`);
  await perpDex.createMarket(await aliAI.getAddress(), 100, 80, 50000);
  console.log("Created market for aliAI");

  // OzAI Token
  const ozAIPrice = ethers.parseUnits("3.75", 18);
  await priceOracle.addSupportedToken(await ozAI.getAddress(), ozAIPrice, 18);
  console.log(`Added ozAI to oracle with price ${ethers.formatUnits(ozAIPrice, 18)}`);
  await perpDex.createMarket(await ozAI.getAddress(), 100, 80, 50000);
  console.log("Created market for ozAI");

  // GGAI Token
  const ggAIPrice = ethers.parseUnits("2.25", 18);
  await priceOracle.addSupportedToken(await ggAI.getAddress(), ggAIPrice, 18);
  console.log(`Added ggAI to oracle with price ${ethers.formatUnits(ggAIPrice, 18)}`);
  await perpDex.createMarket(await ggAI.getAddress(), 100, 80, 50000);
  console.log("Created market for ggAI");

  // HiAI Token
  const hiAIPrice = ethers.parseUnits("1.50", 18);
  await priceOracle.addSupportedToken(await hiAI.getAddress(), hiAIPrice, 18);
  console.log(`Added hiAI to oracle with price ${ethers.formatUnits(hiAIPrice, 18)}`);
  await perpDex.createMarket(await hiAI.getAddress(), 100, 80, 50000);
  console.log("Created market for hiAI");

  // Save deployment information
  const deployment = {
    network: process.env.HARDHAT_NETWORK || 'localhost',
    timestamp: new Date().toISOString(),
    testUSDC: await testUSDC.getAddress(),
    aliAI: await aliAI.getAddress(),
    ozAI: await ozAI.getAddress(),
    ggAI: await ggAI.getAddress(),
    hiAI: await hiAI.getAddress(),
    priceOracle: await priceOracle.getAddress(),
    perpDex: await perpDex.getAddress(),
  };

  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentDir, `${deployment.network}.json`);
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deployment, null, 2)
  );
  console.log(`\nDeployment addresses saved to: ${deploymentFile}`);
  console.log("\nDeployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 