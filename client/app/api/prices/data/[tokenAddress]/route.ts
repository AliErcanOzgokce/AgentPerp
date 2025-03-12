import { NextRequest, NextResponse } from 'next/server';
import { validateAddress } from '@/app/lib/utils';
import { getPriceOracle } from '@/app/lib/contracts';
import { formatPrice } from '@/app/lib/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: { tokenAddress: string } }
) {
    const { tokenAddress } = params;

    try {
        // Validate token address
        if (!validateAddress(tokenAddress)) {
            return NextResponse.json(
                { error: 'Invalid token address' },
                { status: 400 }
            );
        }

        // Get price data
        const oracle = getPriceOracle();
        const priceData = await oracle.getLatestPriceData(tokenAddress);

        return NextResponse.json({
            success: true,
            data: {
                tokenAddress: tokenAddress,
                price: formatPrice(priceData.price, priceData.decimals),
                timestamp: priceData.timestamp.toString(),
                decimals: priceData.decimals.toString(),
                agent: {
                    name: "Ali AI",
                    symbol: "aliAI",
                    currentPrice: formatPrice(priceData.price, priceData.decimals)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching price data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch price data' },
            { status: 500 }
        );
    }
} 