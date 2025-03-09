import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as kleur from "kleur";
import Table from "cli-table3";

// Configuration
const UPDATE_INTERVAL = 15000; // 15 seconds in milliseconds
const PRICE_CHANGE_PERCENTAGE = 20; // 20% maximum price change

interface Agent {
    name: string;
    symbol: string;
    contractAddress: string;
    basePrice: number;
    deploymentDate: string;
}

interface AgentRegistry {
    agents: Agent[];
}

// Track current prices and changes
let currentPrices: { [key: string]: number } = {};
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
    const color = percentage >= 0 ? kleur.green : kleur.red;
    return color(`${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`);
}


function displayHeader() {
    console.log('\n' + '═'.repeat(60));
    console.log(kleur.blue().bold('                   AI Token Price Oracle Bot'));
    console.log('═'.repeat(60) + '\n');
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

async function updatePrice(
    oracle: any,
    agent: Agent
) {
    try {
        const currentPrice = currentPrices[agent.symbol] || agent.basePrice;
        const newPrice = getRandomPriceChange(currentPrice);
        const priceChange = ((newPrice - currentPrice) / currentPrice) * 100;
        const deviation = ((newPrice - agent.basePrice) / agent.basePrice) * 100;

        // Update price in oracle
        const scaledPrice = ethers.parseUnits(newPrice.toString(), 18);
        await oracle.updatePrice(agent.contractAddress, scaledPrice);

        // Update current price for next iteration
        currentPrices[agent.symbol] = newPrice;

        // Store update for table display
        priceUpdates.push({
            symbol: agent.symbol,
            currentPrice,
            newPrice,
            change: priceChange,
            deviation
        });

    } catch (error) {
        console.error(kleur.red(`Error updating ${agent.symbol} price:`), error);
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

        // Load agent registry
        const registryPath = path.join(__dirname, "agents/agent-registry.json");
        if (!fs.existsSync(registryPath)) {
            throw new Error("Agent registry not found. Please create agents first.");
        }

        const registry: AgentRegistry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
        if (registry.agents.length === 0) {
            throw new Error("No agents found in registry.");
        }

        // Initialize current prices from base prices
        registry.agents.forEach(agent => {
            currentPrices[agent.symbol] = agent.basePrice;
        });

        // Get contract instance
        const oracle = await ethers.getContractAt("PriceOracle", deployment.priceOracle);

        // Display welcome message
        displayHeader();
        console.log(kleur.cyan(`Updating prices every ${UPDATE_INTERVAL / 1000} seconds`));
        console.log(kleur.cyan(`Maximum price change: ${PRICE_CHANGE_PERCENTAGE}%\n`));

        // Initial price update
        console.log(kleur.blue('Updating initial prices...'));
        for (const agent of registry.agents) {
            await updatePrice(oracle, agent);
        }
        console.log(kleur.green('Initial prices updated successfully\n'));

        console.log(kleur.yellow('=== Initial Price Update ==='));
        displayPriceTable();

        // Update prices periodically
        let updateCount = 1;
        setInterval(async () => {
            console.log(kleur.blue('\nUpdating prices...'));
            for (const agent of registry.agents) {
                await updatePrice(oracle, agent);
            }
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