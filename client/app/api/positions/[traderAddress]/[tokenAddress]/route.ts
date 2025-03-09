import { NextRequest, NextResponse } from 'next/server';
import { getPerpDEX, validateAddress, formatPosition } from '@/app/lib/contracts';

export async function GET(
    request: NextRequest,
    { params }: { params: { traderAddress: string, tokenAddress: string } }
) {
    try {
        // Validate addresses
        if (!validateAddress(params.traderAddress)) {
            return NextResponse.json(
                { error: 'Invalid trader address' },
                { status: 400 }
            );
        }

        if (!validateAddress(params.tokenAddress)) {
            return NextResponse.json(
                { error: 'Invalid token address' },
                { status: 400 }
            );
        }

        // Get position
        const perpDex = getPerpDEX();
        const position = await perpDex.getPosition(params.traderAddress, params.tokenAddress);

        // Get unrealized PnL
        const pnl = await perpDex.getUnrealizedPnL(params.traderAddress, params.tokenAddress);

        return NextResponse.json({
            success: true,
            data: {
                ...formatPosition(position),
                unrealizedPnL: pnl.toString()
            }
        });
    } catch (error: any) {
        console.error('Error fetching position:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch position',
                details: error.toString()
            },
            { status: 500 }
        );
    }
} 