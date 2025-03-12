import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '@/app/lib/utils';
import { getPerpDEX } from '@/app/lib/contracts';
import { formatPrice } from '@/app/lib/utils';

interface Position {
    token: string;
    isLong: boolean;
    size: bigint;
    margin: bigint;
    entryPrice: bigint;
    liquidationPrice: bigint;
    leverage: bigint;
    lastUpdateTimestamp: bigint;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { traderAddress: string } }
) {
    const { traderAddress } = params;

    try {
        // Validate trader address
        if (!validateAddress(traderAddress)) {
            return NextResponse.json(
                { error: 'Invalid trader address' },
                { status: 400 }
            );
        }

        // Get positions
        const perpDex = getPerpDEX();
        const positions = await perpDex.getPositions(traderAddress);

        // Get unrealized PnL for each position
        const positionsWithPnL = await Promise.all(
            positions.map(async (position: Position) => {
                const pnl = await perpDex.getUnrealizedPnL(traderAddress, position.token);
                return {
                    name: "Ali AI", // TODO: Get from token metadata
                    symbol: "aliAI",
                    isLong: position.isLong,
                    size: formatPrice(position.size, 18),
                    margin: formatPrice(position.margin, 18),
                    entryPrice: formatPrice(position.entryPrice, 18),
                    liquidationPrice: formatPrice(position.liquidationPrice, 18),
                    leverage: formatPrice(position.leverage, 18),
                    unrealizedPnL: formatPrice(pnl, 18)
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: positionsWithPnL
        });
    } catch (error) {
        console.error('Error fetching positions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch positions' },
            { status: 500 }
        );
    }
} 