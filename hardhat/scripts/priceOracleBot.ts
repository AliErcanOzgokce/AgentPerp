import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Configuration
const UPDATE_INTERVAL = 15000; // 15 seconds in milliseconds
const PRICE_CHANGE_PERCENTAGE = 20; // 20% maximum price change

// Base prices for AI tokens (in USD)
const BASE_PRICES = {
    aliAI: 5.50,  // $5.50
    ozAI: 3.75,   // $3.75
    ggAI: 2.25,   // $2.25
    hiAI: 1.50    // $1.50
};

// Track current prices
let currentPrices = { ...BASE_PRICES };

function getRandomPriceChange(currentPrice: number): number {
    const maxChange = (currentPrice * PRICE_CHANGE_PERCENTAGE) / 100;
    const randomChange = (Math.random() * maxChange * 2) - maxChange; // Random value between -maxChange and +maxChange
    return currentPrice + randomChange;
}

async function updatePrice(
    oracle: any,
    tokenAddress: string,
    tokenSymbol: string,
    decimals: number
) {
    try {
        const currentPrice = currentPrices[tokenSymbol as keyof typeof currentPrices];
        const newPrice = getRandomPriceChange(currentPrice);
        const priceChange = ((newPrice - currentPrice) / currentPrice) * 100;
        const deviation = ((newPrice - BASE_PRICES[tokenSymbol as keyof typeof BASE_PRICES]) / BASE_PRICES[tokenSymbol as keyof typeof BASE_PRICES]) * 100;

        // Update price in oracle
        const scaledPrice = ethers.parseUnits(newPrice.toFixed(decimals), decimals);
        await oracle.updatePrice(tokenAddress, scaledPrice);

        // Update current price for next iteration
        currentPrices[tokenSymbol as keyof typeof currentPrices] = newPrice;

        console.log(`\n${tokenSymbol} Price Update:`);
        console.log(`Current Price: $${currentPrice.toFixed(4)}`);
        console.log(`New Price: $${newPrice.toFixed(4)}`);
        console.log(`Change: ${priceChange.toFixed(2)}%`);
        console.log(`Deviation from Base: ${deviation.toFixed(2)}%`);
    } catch (error) {
        console.error(`Error updating ${tokenSymbol} price:`, error);
    }
}

async function main() {
    try {
        // Load deployment information
        const deploymentPath = path.join(__dirname, "../deployments/monadTestnet.json");
        if (!fs.existsSync(deploymentPath)) {
            throw new Error("Deployment file not found. Please deploy contracts first.");
        }

        const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

        // Get contract instances
        const oracle = await ethers.getContractAt("PriceOracle", deployment.priceOracle);
        const aliAI = await ethers.getContractAt("AliAIToken", deployment.aliAI);
        const ozAI = await ethers.getContractAt("OzAIToken", deployment.ozAI);
        const ggAI = await ethers.getContractAt("GGAIToken", deployment.ggAI);
        const hiAI = await ethers.getContractAt("HiAIToken", deployment.hiAI);

        console.log("Price Oracle Bot Started");
        console.log("Updating prices every", UPDATE_INTERVAL / 1000, "seconds");
        console.log("Maximum price change:", PRICE_CHANGE_PERCENTAGE, "%\n");

        // Initial price update
        console.log("=== Initial Price Update ===");
        await updatePrice(oracle, await aliAI.getAddress(), "aliAI", 18);
        await updatePrice(oracle, await ozAI.getAddress(), "ozAI", 18);
        await updatePrice(oracle, await ggAI.getAddress(), "ggAI", 18);
        await updatePrice(oracle, await hiAI.getAddress(), "hiAI", 18);

        // Update prices periodically
        setInterval(async () => {
            console.log("\n=== Price Update ===");
            await updatePrice(oracle, await aliAI.getAddress(), "aliAI", 18);
            await updatePrice(oracle, await ozAI.getAddress(), "ozAI", 18);
            await updatePrice(oracle, await ggAI.getAddress(), "ggAI", 18);
            await updatePrice(oracle, await hiAI.getAddress(), "hiAI", 18);
        }, UPDATE_INTERVAL);

    } catch (error) {
        console.error("Error in price oracle bot:", error);
        process.exit(1);
    }
}

main(); 