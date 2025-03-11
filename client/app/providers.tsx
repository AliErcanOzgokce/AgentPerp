'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter } from '@/app/config/wagmi'
import type { ReactNode } from 'react'

// Set up queryClient
const queryClient = new QueryClient()

export function Providers({ 
  children 
}: { 
  children: ReactNode
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 