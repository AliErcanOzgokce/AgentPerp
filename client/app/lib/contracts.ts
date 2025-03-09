import { ethers } from 'ethers';
import { ORACLE_ABI } from './constants/oracle-abi';
import { PERPDEX_ABI } from './constants/perpdex-abi';

// Provider singleton
let provider: ethers.JsonRpcProvider;

export function getProvider() {
    if (!provider) {
        provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_MONAD_RPC_URL);
    }
    return provider;
}

// Contract instances
export function getPriceOracle() {
    return new ethers.Contract(
        process.env.NEXT_PUBLIC_ORACLE_ADDRESS!,
        ORACLE_ABI,
        getProvider()
    );
}

export function getPerpDEX() {
    return new ethers.Contract(
        process.env.NEXT_PUBLIC_PERPDEX_ADDRESS!,
        PERPDEX_ABI,
        getProvider()
    );
}

// Helper functions
export function validateAddress(address: string): boolean {
    return ethers.isAddress(address);
}

export function formatPrice(price: bigint, decimals: number = 18): string {
    return ethers.formatUnits(price, decimals);
}

export function parsePrice(price: string, decimals: number = 18): bigint {
    return ethers.parseUnits(price, decimals);
}

// Error handling
export function isPriceStaleError(error: any): boolean {
    return error?.reason === "Price too old" || 
           error?.shortMessage?.includes("Price too old");
}

// Position formatting
export function formatPosition(position: any) {
    if (!position) return null;
    
    return {
        trader: position.trader,
        token: position.token,
        isLong: position.isLong,
        size: formatPrice(position.size),
        margin: formatPrice(position.margin),
        entryPrice: formatPrice(position.entryPrice),
        liquidationPrice: formatPrice(position.liquidationPrice),
        leverage: position.leverage.toString(),
        lastUpdateTimestamp: position.lastUpdateTimestamp.toString()
    };
}

// Market formatting
export function formatMarket(market: any) {
    if (!market) return null;
    
    return {
        isActive: market.isActive,
        maxLeverage: market.maxLeverage.toString(),
        liquidationThreshold: market.liquidationThreshold.toString(),
        minPositionSize: formatPrice(market.minPositionSize),
        maxPositionSize: formatPrice(market.maxPositionSize),
        totalLongPositions: formatPrice(market.totalLongPositions),
        totalShortPositions: formatPrice(market.totalShortPositions),
        openInterest: formatPrice(market.openInterest),
        fundingRate: market.fundingRate.toString(),
        lastFundingUpdate: market.lastFundingUpdate.toString()
    };
} 