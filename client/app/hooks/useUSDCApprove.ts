import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

const USDC_ADDRESS = "0x267c72e9637AB47FB36ba50248e216311AAb5175";
const PERP_DEX_ADDRESS = "0x0eA5493903cBce2aEBdd1B13fA4cDA697dd4fC14";

const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function useUSDCApprove(amount: string) {
  const { data: hash, isPending, writeContract, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const write = () => {
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PERP_DEX_ADDRESS, parseUnits(amount, 6)],
    });
  };

  return {
    write,
    isLoading: isPending || isConfirming,
    isSuccess,
    error,
  };
} 