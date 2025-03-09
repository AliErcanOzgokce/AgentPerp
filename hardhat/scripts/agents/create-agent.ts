import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import fs from "fs";
import path from "path";

interface AgentRegistry {
    agents: {
        name: string;
        symbol: string;
        contractAddress: string;
        basePrice: number;
        deploymentDate: string;
    }[];
}

task("create-agent", "Creates a new agent token and registers it with Oracle and PerpDEX")
    .addParam("name", "The name of the agent token")
    .addParam("symbol", "The symbol of the agent token")
    .setAction(async (taskArgs, hre) => {
        const { name, symbol } = taskArgs;

        try {
            // Get deployer
            const [deployer] = await hre.ethers.getSigners();

            // Load deployment info
            const deploymentPath = path.join(__dirname, "../../deployments/monadTestnet.json");
            if (!fs.existsSync(deploymentPath)) {
                throw new Error("Deployment file not found. Please deploy core contracts first.");
            }
            const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

            // Deploy token
            const AgentToken = await hre.ethers.getContractFactory("MockToken");
            const token = await AgentToken.deploy(name, symbol, 18);
            await token.waitForDeployment();
            const tokenAddress = await token.getAddress();

            // Mint total supply to deployer
            const TOTAL_SUPPLY = hre.ethers.parseUnits("21000000", 18); // 21M tokens
            await token.mint(deployer.address, TOTAL_SUPPLY);

            // Get contract instances
            const oracle = await hre.ethers.getContractAt("PriceOracle", deployment.priceOracle);
            const perpDex = await hre.ethers.getContractAt("PerpDEX", deployment.perpDex);

            // Register with Oracle
            const INITIAL_PRICE = 2; // $2 per token
            const scaledPrice = hre.ethers.parseUnits(INITIAL_PRICE.toString(), 18);
            await oracle.addSupportedToken(tokenAddress, scaledPrice, 18);

            // Create market in PerpDEX
            await perpDex.createMarket(
                tokenAddress,
                100, // maxLeverage (100x)
                80,  // liquidationThreshold (80%)
                50000 // maintenanceMargin (5%)
            );

            // Update registry
            const registryPath = path.join(__dirname, "agent-registry.json");
            const registry: AgentRegistry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

            registry.agents.push({
                name,
                symbol,
                contractAddress: tokenAddress,
                basePrice: INITIAL_PRICE,
                deploymentDate: new Date().toISOString()
            });

            fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

            // Return deployment info
            const deploymentInfo = {
                name,
                symbol,
                tokenAddress,
                basePrice: INITIAL_PRICE,
                oracleAddress: deployment.priceOracle,
                perpDexAddress: deployment.perpDex
            };

            console.log(JSON.stringify(deploymentInfo));
            return deploymentInfo;
        } catch (error) {
            console.error(JSON.stringify({
                error: "Failed to create agent",
                details: error instanceof Error ? error.message : String(error)
            }));
            throw error;
        }
    });