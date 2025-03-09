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

        // Get price
        const oracle = getPriceOracle();
        const price = await oracle.getPrice(params.tokenAddress);

        return NextResponse.json({
            success: true,
            data: {
                tokenAddress: params.tokenAddress,
                price: formatPrice(price)
            }
        });
    } catch (error: any) {
        console.error('Error fetching price:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch price',
                details: error.toString()
            },
            { status: 500 }
        );
    }
} 