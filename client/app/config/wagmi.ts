import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { type Chain } from 'viem'

// Define Monad Testnet
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz/'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz/'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
} as const satisfies Chain

// Get projectId from https://cloud.reown.com
export const projectId = '7b572b9e0a17ea9706a43092d0a57b89' // Replace with your actual project ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [monadTestnet],
  projectId,
  ssr: true
})

// Set up metadata
const metadata = {
  name: 'InfinityX',
  description: 'InfinityX - AI Agent Trading Protocol',
  url: 'https://infinityx.xyz',
  icons: ['/logo.png']
}

// Create modal with Monad Testnet as default network
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [monadTestnet],
  projectId,
  defaultNetwork: monadTestnet,
  metadata,
  features: {
    analytics: true
  }
}) 