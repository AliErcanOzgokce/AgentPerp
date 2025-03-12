import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '@/app/lib/utils';
import { getPerpDEX } from '@/app/lib/contracts';
import { formatPrice } from '@/app/lib/utils';

export async function GET(
    request: Request,
    { params }: { params: { traderAddress: string; tokenAddress: string } }
) {
    const { traderAddress, tokenAddress } = await params;

    try {
        // Validate addresses
        if (!validateAddress(traderAddress) || !validateAddress(tokenAddress)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid address format'
            });
        }


        // Get position
        const perpDex = getPerpDEX();
        const position = await perpDex.getPosition(traderAddress, tokenAddress);
        console.log("Position", position);

        // Get unrealized PnL
        const pnl = await perpDex.getUnrealizedPnL(traderAddress, tokenAddress);

        // Check if position exists (size > 0)
        const hasPosition = position.size > 0n;

        // Convert BigInt values to strings for JSON serialization
        return NextResponse.json({
            success: true,
            data: {
                trader: traderAddress,
                token: tokenAddress,
                isLong: position.isLong,
                size: position.size.toString(),
                margin: position.margin.toString(),
                entryPrice: position.entryPrice.toString(),
                liquidationPrice: position.liquidationPrice.toString(),
                leverage: position.leverage.toString(),
                lastUpdateTimestamp: position.lastUpdateTimestamp.toString(),
                unrealizedPnL: pnl.toString()
            }
        });

    } catch (error) {
        console.error('Error fetching position:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch position'
        }, { status: 500 });
    }
} 