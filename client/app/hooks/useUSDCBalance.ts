import { useAccount } from 'wagmi';
import { useBalance } from 'wagmi';

const USDC_ADDRESS = "0x267c72e9637AB47FB36ba50248e216311AAb5175";

export function useUSDCBalance() {
  const { address } = useAccount();
  
  const { data: balance, isLoading, refetch } = useBalance({
    address,
    token: USDC_ADDRESS,
    watch: true,
  });

  return {
    balance,
    isLoading,
    refetch
  };
} 