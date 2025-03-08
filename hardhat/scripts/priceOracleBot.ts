import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as kleur from "kleur";
import Table from "cli-table3";

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

// Track current prices and changes
let currentPrices = { ...BASE_PRICES };
let priceUpdates: {
    symbol: string;
    currentPrice: number;
    newPrice: number;
    change: number;
    deviation: number;
}[] = [];

function getRandomPriceChange(currentPrice: number): number {
    const maxChange = (currentPrice * PRICE_CHANGE_PERCENTAGE) / 100;
    const randomChange = (Math.random() * maxChange * 2) - maxChange;
    return currentPrice + randomChange;
}

function formatPrice(price: number): string {
    return `$${price.toFixed(4)}`;
}

function formatPercentage(percentage: number): string {
    const formattedValue = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
    return percentage >= 0 ? kleur.green(formattedValue) : kleur.red(formattedValue);
}

function displayPriceTable() {
    const table = new Table({
        head: [
            kleur.cyan('Token'),
            kleur.cyan('Current Price'),
            kleur.cyan('New Price'),
            kleur.cyan('Change'),
            kleur.cyan('Base Deviation')
        ],
        style: {
            head: [],
            border: []
        },
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
            'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
            'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
            'right': '║', 'right-mid': '╢', 'middle': '│'
        }
    });

    priceUpdates.forEach(update => {
        table.push([
            kleur.yellow(update.symbol),
            formatPrice(update.currentPrice),
            formatPrice(update.newPrice),
            formatPercentage(update.change),
            formatPercentage(update.deviation)
        ]);
    });

    console.log(table.toString());
    priceUpdates = []; // Clear updates for next round
}

function displayHeader() {
    console.log('\n' + '═'.repeat(60));
    console.log(kleur.blue().bold('                   AI Token Price Oracle Bot'));
    console.log('═'.repeat(60) + '\n');
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

        // Store update for table display
        priceUpdates.push({
            symbol: tokenSymbol,
            currentPrice,
            newPrice,
            change: priceChange,
            deviation
        });

    } catch (error) {
        console.error(kleur.red(`Error updating ${tokenSymbol} price:`), error);
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

        // Display welcome message
        displayHeader();
        console.log(kleur.cyan(`Updating prices every ${UPDATE_INTERVAL / 1000} seconds`));
        console.log(kleur.cyan(`Maximum price change: ${PRICE_CHANGE_PERCENTAGE}%\n`));

        // Initial price update
        console.log(kleur.blue('Updating initial prices...'));
        await updatePrice(oracle, await aliAI.getAddress(), "aliAI", 18);
        await updatePrice(oracle, await ozAI.getAddress(), "ozAI", 18);
        await updatePrice(oracle, await ggAI.getAddress(), "ggAI", 18);
        await updatePrice(oracle, await hiAI.getAddress(), "hiAI", 18);
        console.log(kleur.green('Initial prices updated successfully\n'));

        console.log(kleur.yellow('=== Initial Price Update ==='));
        displayPriceTable();

        // Update prices periodically
        let updateCount = 1;
        setInterval(async () => {
            console.log(kleur.blue('\nUpdating prices...'));
            await updatePrice(oracle, await aliAI.getAddress(), "aliAI", 18);
            await updatePrice(oracle, await ozAI.getAddress(), "ozAI", 18);
            await updatePrice(oracle, await ggAI.getAddress(), "ggAI", 18);
            await updatePrice(oracle, await hiAI.getAddress(), "hiAI", 18);
            console.log(kleur.green('Price update completed\n'));

            console.log(kleur.yellow(`=== Price Update #${updateCount} ===`));
            displayPriceTable();
            updateCount++;
        }, UPDATE_INTERVAL);

    } catch (error) {
        console.error(kleur.red("\nError in price oracle bot:"), error);
        process.exit(1);
    }
}

main(); 