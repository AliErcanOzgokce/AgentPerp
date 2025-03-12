import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

const PERP_DEX_ADDRESS = "0x0eA5493903cBce2aEBdd1B13fA4cDA697dd4fC14";
const PERP_DEX_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isLong",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "margin",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "leverage",
        "type": "uint256"
      }
    ],
    "name": "openPosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "closePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function usePerpDex(tokenAddress: string) {
  const { address } = useAccount();

  // Open Position Configuration
  const useOpenPosition = (isLong: boolean, margin: string, leverage: number) => {
    const { data: hash, isPending, writeContract, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const write = () => {
      writeContract({
        address: PERP_DEX_ADDRESS,
        abi: PERP_DEX_ABI,
        functionName: 'openPosition',
        args: [tokenAddress, isLong, parseUnits(margin, 6), BigInt(leverage)],
      });
    };

    return {
      write,
      isLoading: isPending || isConfirming,
      isSuccess,
      error,
    };
  };

  // Close Position Configuration
  const useClosePosition = () => {
    const { data: hash, isPending, writeContract, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
      hash,
    });

    const write = () => {
      writeContract({
        address: PERP_DEX_ADDRESS,
        abi: PERP_DEX_ABI,
        functionName: 'closePosition',
        args: [tokenAddress],
      });
    };

    return {
      write,
      isLoading: isPending || isConfirming,
      isSuccess,
      error,
    };
  };

  return {
    useOpenPosition,
    useClosePosition,
  };
} 