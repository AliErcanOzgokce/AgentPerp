import { NextRequest, NextResponse } from 'next/server';
import { getPerpDEX, validateAddress, formatMarket } from '@/app/lib/contracts';

export async function GET(
    request: NextRequest,
    { params }: { params: { tokenAddress: string } }
) {
    try {
        // Validate token address
        if (!validateAddress(params.tokenAddress)) {
            return NextResponse.json(
                { error: 'Invalid token address' },
                { status: 400 }
            );
        }

        // Get market data
        const perpDex = getPerpDEX();
        const market = await perpDex.getMarket(params.tokenAddress);

        return NextResponse.json({
            success: true,
            data: formatMarket(market)
        });
    } catch (error: any) {
        console.error('Error fetching market:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch market',
                details: error.toString()
            },
            { status: 500 }
        );
    }
} 