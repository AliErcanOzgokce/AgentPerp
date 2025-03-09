import { NextRequest, NextResponse } from 'next/server';
import { getPriceOracle, validateAddress, formatPrice } from '@/app/lib/contracts';

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

        // Get price data
        const oracle = getPriceOracle();
        const priceData = await oracle.getLatestPriceData(params.tokenAddress);

        return NextResponse.json({
            success: true,
            data: {
                tokenAddress: params.tokenAddress,
                price: formatPrice(priceData.price, priceData.decimals),
                timestamp: priceData.timestamp.toString(),
                decimals: priceData.decimals.toString()
            }
        });
    } catch (error: any) {
        console.error('Error fetching price data:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch price data',
                details: error.toString()
            },
            { status: 500 }
        );
    }
} 