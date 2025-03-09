import { NextRequest, NextResponse } from 'next/server';
import { getPerpDEX, validateAddress, formatPosition } from '@/app/lib/contracts';
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

export async function GET(
    request: NextRequest,
    { params }: { params: { traderAddress: string } }
) {
    try {
        // Validate trader address
        if (!validateAddress(params.traderAddress)) {
            return NextResponse.json(
                { error: 'Invalid trader address' },
                { status: 400 }
            );
        }

        // Load agent registry to get all tokens
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

        // Get positions for all tokens
        const perpDex = getPerpDEX();
        const positionPromises = registry.agents.map(async (agent) => {
            try {
                const position = await perpDex.getPosition(params.traderAddress, agent.contractAddress);
                const pnl = await perpDex.getUnrealizedPnL(params.traderAddress, agent.contractAddress);

                // Only include positions with non-zero size
                if (position.size > 0n) {
                    return {
                        name: agent.name,
                        symbol: agent.symbol,
                        ...formatPosition(position),
                        unrealizedPnL: pnl.toString()
                    };
                }
                return null;
            } catch (error) {
                console.error(`Error fetching position for ${agent.symbol}:`, error);
                return null;
            }
        });

        const positions = (await Promise.all(positionPromises)).filter(Boolean);

        return NextResponse.json({
            success: true,
            data: positions
        });
    } catch (error: any) {
        console.error('Error fetching positions:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch positions',
                details: error.toString()
            },
            { status: 500 }
        );
    }
} 