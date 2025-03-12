import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

export function formatPrice(price: bigint | string, decimals: number = 18): string {
    if (typeof price === 'string') {
        price = BigInt(price);
    }
    const divisor = BigInt(10) ** BigInt(decimals);
    const floatValue = Number(price) / Number(divisor);
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(floatValue);
}

export function validateAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

interface Agent {
  name: string;
  symbol: string;
  currentPrice: string;
}

const AGENT_ADDRESSES: { [key: string]: Agent } = {
  "0xF3c3E02f7DB5F41627445C138D71e5050F34641d": {
    name: "Ali AI",
    symbol: "aliAI",
    currentPrice: "0"
  },
  "0x2E52C9C2c8501D7E3B0d5C071a0555B9Dd25Aab1": {
    name: "Oz AI",
    symbol: "ozAI",
    currentPrice: "0"
  },
  "0x3E52C9C2c8501D7E3B0d5C071a0555B9Dd25Aab2": {
    name: "Ze AI",
    symbol: "zeAI",
    currentPrice: "0"
  }
};

export function getAgentByAddress(address: string): Agent | null {
  const agent = AGENT_ADDRESSES[address];
  if (!agent) {
    console.warn(`No agent found for address: ${address}`);
    return null;
  }
  return agent;
} 