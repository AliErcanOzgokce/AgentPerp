import { NextRequest, NextResponse } from 'next/server';
import { getPriceOracle, formatPrice, isPriceStaleError } from '@/app/lib/contracts';
import fs from 'fs';
import path from 'path';

interface AgentRegistry {
    agents: {
        name: string;
        symbol: string;
        contractAddress: string;
        basePrice: number;
        deploymentDate: string;
    }[];
}

export async function GET(request: NextRequest) {
    try {
        // Load agent registry
        const registryPath = path.join(process.cwd(), '..', 'hardhat', 'scripts', 'agents', 'agent-registry.json');
        if (!fs.existsSync(registryPath)) {
            return NextResponse.json(
                { error: 'Agent registry not found' },
                { status: 404 }
            );
        }

        const registry: AgentRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        if (registry.agents.length === 0) {
            return NextResponse.json(
                { error: 'No agents found in registry' },
                { status: 404 }
            );
        }

        // Get prices for all tokens
        const oracle = getPriceOracle();
        const pricePromises = registry.agents.map(async (agent) => {
            try {
                const priceData = await oracle.getLatestPriceData(agent.contractAddress);
                return {
                    name: agent.name,
                    symbol: agent.symbol,
                    tokenAddress: agent.contractAddress,
                    currentPrice: formatPrice(priceData.price, priceData.decimals),
                    basePrice: agent.basePrice.toString(),
                    timestamp: priceData.timestamp.toString(),
                    decimals: priceData.decimals.toString(),
                    status: 'active'
                };
            } catch (error) {
                console.error(`Error fetching price for ${agent.symbol}:`, error);
                return {
                    name: agent.name,
                    symbol: agent.symbol,
                    tokenAddress: agent.contractAddress,
                    basePrice: agent.basePrice.toString(),
                    status: isPriceStaleError(error) ? 'stale' : 'error',
                    error: isPriceStaleError(error) ? 'Price data is stale' : 'Failed to fetch price data'
                };
            }
        });

        const prices = await Promise.all(pricePromises);

        return NextResponse.json({
            success: true,
            data: prices
        });
    } catch (error: any) {
        console.error('Error fetching all prices:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch prices',
                details: error.toString()
            },
            { status: 500 }
        );
    }
} 