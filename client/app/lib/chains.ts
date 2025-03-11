import { Chain } from 'wagmi';

export const monadTestnet = {
  id: 1_337,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MONAD',
  },
  rpcUrls: {
    public: { http: ['https://testnet-rpc.monad.xyz/'] },
    default: { http: ['https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'MonadScan', url: 'https://testnet.monad.xyz/explorer' },
  },
  testnet: true,
} as const satisfies Chain; 