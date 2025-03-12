'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/app/lib/utils';
import { AGENT_DESCRIPTIONS } from '@/app/components/AgentCard';
import { useAccount } from 'wagmi';
import TradingViewWidget from '@/app/components/TradingViewWidget';
import { useUSDCBalance } from '@/app/hooks/useUSDCBalance';
import { useUSDCApprove } from '@/app/hooks/useUSDCApprove';
import { usePerpDex } from '@/app/hooks/usePerpDex';
import PositionsTable from '@/app/components/PositionsTable';

// Types for our component
interface Position {
  trader: string;
  token: string;
  isLong: boolean;
  size: string;
  margin: string;
  entryPrice: string;
  liquidationPrice: string;
  leverage: string;
  lastUpdateTimestamp: string;
  unrealizedPnL: string;
}

interface PriceData {
  tokenAddress: string;
  price: string;
  timestamp: string;
  decimals: string;
}

interface TradePageProps {
  params: {
    tokenAddress: string;
  };
}

export default function TradePage({ params }: TradePageProps) {
  // State management
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isLong, setIsLong] = useState(true);
  const [leverage, setLeverage] = useState(20);
  const [margin, setMargin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any>(null);
  const { address } = useAccount();
  const { balance: usdcBalance, isLoading: isBalanceLoading } = useUSDCBalance();
  const { useOpenPosition } = usePerpDex(params.tokenAddress);
  const [isApproving, setIsApproving] = useState(false);
  const [isOpeningPosition, setIsOpeningPosition] = useState(false);
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // USDC Approve Hook
  const {
    write: approveUsdc,
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
  } = useUSDCApprove(margin);

  // Open Position Hook
  const {
    write: openPosition,
    isLoading: isOpenPositionLoading,
    isSuccess: isOpenPositionSuccess,
    error: openPositionError
  } = useOpenPosition(isLong, margin, leverage);

  // Fetch price and agent data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch price data
        const priceRes = await fetch(`/api/prices/data/${params.tokenAddress}`);
        const priceJson = await priceRes.json();
        if (!priceJson.success) throw new Error(priceJson.error);
        setPriceData(priceJson.data.price);
        setAgentData(priceJson.data.agent);

        if (address) {
          const positionRes = await fetch(`/api/positions/${address}/${params.tokenAddress}`);
          const positionJson = await positionRes.json();
          if (positionJson.success) {
            setPosition(positionJson.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up polling for price updates
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [params.tokenAddress, address]);

  // Handle Position Opening
  const handleOpenPosition = async () => {
    if (!margin || !leverage || !approveUsdc || !openPosition) return;
    
    try {
      setOperationStatus({ type: null, message: '' });
      
      // First approve USDC
      setIsApproving(true);
      try {
        // Send approve request
        await approveUsdc();
        
        // Wait for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Proceed with opening position
        setIsApproving(false);
        setIsOpeningPosition(true);
        setOperationStatus({
          type: 'success',
          message: 'USDC Approved! Opening position...'
        });
        
        // Send open position request
        await openPosition();
        
        // Wait for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Show final success message
        setOperationStatus({
          type: 'success',
          message: `Successfully submitted ${isLong ? 'long' : 'short'} position`
        });
        
        // Reset form
        setMargin('');
        setLeverage(20);
      } catch (error: any) {
        // Only show error if it's not a user rejection
        if (error?.code !== 4001) {
          setOperationStatus({
            type: 'error',
            message: 'Transaction failed'
          });
        }
        console.error('Transaction error:', error);
      }
    } catch (error) {
      console.error('General error:', error);
    } finally {
      setIsApproving(false);
      setIsOpeningPosition(false);
    }
  };

  if (loading || !agentData) {
    return (
      <main className="flex min-h-screen pt-24 flex-col items-center bg-[#0f1011]">
        <div className="w-full max-w-[1300px] px-4 py-8">
          {/* Agent Card Skeleton */}
          <div className="w-full mb-6">
            <div className="relative rounded-[32px] w-full p-[16px] text-center shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)] bg-[hsla(160,6%,7%,1)]">
              <div className="pt-6 pb-4 rounded-[16px] p-[20px] lg:pt-[20px] relative">
                <div className="flex items-start gap-6">
                  {/* Image Skeleton */}
                  <div className="w-[164px] h-[164px] rounded-3xl bg-gray-800 animate-pulse" />
                  
                  {/* Content Skeleton */}
                  <div className="flex-1 pt-2">
                    <div className="h-8 w-48 bg-gray-800 rounded-lg mb-4 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-full max-w-[420px] bg-gray-800 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-12 gap-6">
            {/* Chart Skeleton */}
            <div className="col-span-8 bg-[hsla(160,6%,7%,1)] rounded-[32px] p-6">
              <div className="w-full h-[560px] bg-gray-800 rounded-2xl animate-pulse" />
            </div>

            {/* Trading Interface Skeleton */}
            <div className="col-span-4">
              <div className="bg-[hsla(160,6%,7%,1)] rounded-[32px] p-6">
                {/* Toggle Skeleton */}
                <div className="h-12 bg-gray-800 rounded-full mb-6 animate-pulse" />

                {/* Leverage Input Skeleton */}
                <div className="h-[180px] bg-gray-800 rounded-2xl mb-4 animate-pulse" />

                {/* Margin Input Skeleton */}
                <div className="h-[100px] bg-gray-800 rounded-2xl mb-6 animate-pulse" />

                {/* Balance Skeleton */}
                <div className="h-[50px] bg-gray-800 rounded-2xl mb-4 animate-pulse" />

                {/* Button Skeleton */}
                <div className="h-12 bg-gray-800 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400 text-center">
          <p className="text-xl font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen pt-24 flex-col items-center bg-[#0f1011]">
      <div className="w-full max-w-[1300px] px-4 py-8">
        {/* Top Agent Card */}
        <div className="w-full mb-6">
          <div className="relative rounded-[32px] w-full p-[16px] text-center shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]"
            style={{
              background:
                "linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)",
            }}>
            <div className="pt-6 pb-4 bg-[hsla(160,6%,7%,1)] rounded-[16px] p-[20px] lg:pt-[20px] shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
              {/* Background Pattern - Optimized opacity */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "url(/images/DotPattern.svg)",
                  backgroundSize: "32px 32px",
                  backgroundRepeat: "repeat",
                }}
              />

              {/* Enhanced Glow Effect */}
              <div
                className="pointer-events-none absolute w-[360px] h-[360px] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-soft-light will-change-transform"
                style={{
                  background:
                    "radial-gradient(circle, rgba(179, 168, 240, 0.75) 100%, rgba(59, 51, 102, 0.25) 100%, transparent 70%)",
                  filter: "blur(100px)",
                  left: "50%",
                  top: "50%",
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  {/* Left side - Image, Title and Description */}
                  <div className="flex gap-6">
                    {/* Agent Image */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#6E54FF]/20 to-[#8E74FF]/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative w-[164px] h-[164px] rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-10"></div>
                        <Image
                          src={`/agents/${agentData.symbol}.jpeg`}
                          alt={agentData.name}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="flex flex-col pt-2">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{agentData.name}</h2>
                        <div className="px-2.5 py-1 rounded-full bg-[#6E54FF]/10 border border-[#6E54FF]/20">
                          <span className="text-xs font-medium text-[#6E54FF]">Active</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-left text-sm leading-relaxed max-w-[420px] mb-3">{AGENT_DESCRIPTIONS[agentData.symbol]}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#6E54FF]"></div>
                          <span className="text-xs text-gray-400">AI Powered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                          <span className="text-xs text-gray-400">High Performance</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Stats and Social */}
                  <div className="flex items-center gap-6">
                    {/* Price Display */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/5 hover:border-[#6E54FF]/20 transition-all duration-300 hover:bg-black/40">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-400">1 {agentData.symbol} = </span>
                        <div className="flex items-baseline">
                          <span className="text-sm text-[#6E54FF]">$</span>
                          <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {parseFloat(agentData.currentPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3">
                      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:border-[#6E54FF]/20 transition-all duration-300">
                        <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                        <p className="text-sm font-medium text-white">$1.2M</p>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:border-[#6E54FF]/20 transition-all duration-300">
                        <p className="text-xs text-gray-400 mb-1">TVL</p>
                        <p className="text-sm font-medium text-white">$4.5M</p>
                      </div>
                    </div>

                    {/* Social */}
                    <div className="flex items-center">
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2c2d30] hover:bg-[#3c3d40] transition-colors"
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Chart */}
          <div className="col-span-8 bg-[hsla(160,6%,7%,1)] rounded-[32px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
            <div className="w-full h-[540px]">
              <TradingViewWidget />
            </div>
          </div>

          {/* Trading Interface */}
          <div className="col-span-4">
            <div className="relative rounded-[32px] w-full p-[16px] text-center shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]"
              style={{
                background:
                  "linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)",
              }}>
              <div className="pt-6 pb-4 bg-[hsla(160,6%,7%,1)] rounded-[16px] p-[20px] lg:pt-[20px] shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
                {/* Background Pattern */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: "url(/images/DotPattern.svg)",
                    backgroundSize: "32px 32px",
                    backgroundRepeat: "repeat",
                  }}
                />

                {/* Enhanced Glow Effect */}
                <div
                  className="pointer-events-none absolute w-[360px] h-[360px] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-soft-light will-change-transform"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(179, 168, 240, 0.75) 100%, rgba(59, 51, 102, 0.25) 100%, transparent 70%)",
                    filter: "blur(100px)",
                    left: "50%",
                    top: "50%",
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Long/Short Toggle */}
                  <div className="relative bg-[#0f1011] rounded-[100px] p-1 mb-6 border border-[#1c1d21]">
                    <div 
                      className={`absolute inset-y-1 transition-all duration-300 ease-out ${
                        isLong ? 'left-1 right-[50%]' : 'left-[50%] right-1'
                      }`}
                    >
                      <div className={`w-full h-full rounded-[100px] ${
                        isLong 
                          ? 'bg-[#6E54FF] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]' 
                          : 'bg-[#FF5454] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(255,84,84,0.50),0px_0px_0px_1px_#EB4747]'
                      }`} />
                    </div>
                    <div className="relative grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setIsLong(true)}
                        className={`inline-flex items-center justify-center whitespace-nowrap h-10 px-6 py-2 rounded-[100px] text-[15px] font-medium transition-all duration-300 ${
                          isLong ? 'text-white z-10' : 'text-[#6b7280] hover:text-white'
                        }`}
                      >
                        Buy/Long
                      </button>
                      <button
                        onClick={() => setIsLong(false)}
                        className={`inline-flex items-center justify-center whitespace-nowrap h-10 px-6 py-2 rounded-[100px] text-[15px] font-medium transition-all duration-300 ${
                          !isLong ? 'text-white z-10' : 'text-[#6b7280] hover:text-white'
                        }`}
                      >
                        Sell/Short
                      </button>
                    </div>
                  </div>

                  {/* Leverage Input */}
                  <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-white/5 mb-4 hover:border-[#6E54FF]/20 transition-all duration-300 hover:bg-black/40">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm text-gray-400">Leverage</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={leverage}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 1 && value <= 100) {
                              setLeverage(value);
                            }
                          }}
                          className="w-[60px] bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white text-center text-sm focus:border-[#6E54FF]/20 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="text-sm text-gray-400">×</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {[5, 10, 25, 50].map((value) => (
                        <button
                          key={value}
                          onClick={() => setLeverage(value)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            leverage === value
                              ? `${isLong ? 'bg-[#6E54FF]' : 'bg-[#FF5454]'} text-white shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset]`
                              : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
                          }`}
                        >
                          {value}×
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${leverage}%`,
                            background: `linear-gradient(90deg, ${isLong ? '#6E54FF' : '#FF5454'} 0%, ${isLong ? '#836EF9' : '#FF7A7A'} 100%)`
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={leverage}
                        onChange={(e) => setLeverage(parseInt(e.target.value))}
                        className="relative w-full h-2 bg-[#2c2d30] rounded-lg appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:opacity-0 [&::-moz-range-thumb]:opacity-0 [&::-ms-thumb]:opacity-0"
                        style={{
                          background: 'transparent'
                        }}
                      />
                    </div>
                  </div>

                  {/* Margin Input */}
                  <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-white/5 mb-6 hover:border-[#6E54FF]/20 transition-all duration-300 hover:bg-black/40">
                    <label className="block text-sm text-gray-400 mb-3">
                      Margin (USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={margin}
                        onChange={(e) => setMargin(e.target.value)}
                        placeholder="Enter margin amount"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-[#6E54FF]/20 focus:outline-none transition-all duration-300 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        USDC
                      </div>
                    </div>
                  </div>

                  {/* USDC Balance Display - Moved above the button */}
                  <div className="mb-4 bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/5 hover:border-[#6E54FF]/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">USDC Balance</span>
                      <span className="text-sm font-medium text-white">
                        {isBalanceLoading ? (
                          <div className="animate-pulse w-16 h-4 bg-gray-700 rounded"></div>
                        ) : (
                          `$${Number(usdcBalance?.formatted || 0).toLocaleString()}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Operation Status Message */}
                  {operationStatus.type && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
                      operationStatus.type === 'success' 
                        ? 'bg-[#6E54FF]/10 text-[#6E54FF] border border-[#6E54FF]/20' 
                        : 'bg-[#FF5454]/10 text-[#FF5454] border border-[#FF5454]/20'
                    }`}>
                      {operationStatus.message}
                    </div>
                  )}

                  {/* Open Position Button */}
                  <button 
                    onClick={handleOpenPosition}
                    disabled={!margin || !leverage || isApproving || isOpeningPosition || !address}
                    className={`inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[6px] min-w-full transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-white h-12 px-4 py-[6px] rounded-[100px] text-[16px] leading-[24px] font-[500] ${
                      isLong 
                        ? 'bg-[#6E54FF] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] hover:bg-[#836EF9] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]' 
                        : 'bg-[#FF5454] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(255,84,84,0.50),0px_0px_0px_1px_#EB4747] hover:bg-[#FF7A7A] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(255,84,84,0.50),0px_0px_0px_1px_#EB4747]'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isApproving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Approving USDC...
                        </>
                      ) : isOpeningPosition ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Opening Position...
                        </>
                      ) : (
                        <>
                          {isLong ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                              <path d="M12 20V4M5 11L12 4L19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                              <path d="M12 4V20M5 13L12 20L19 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {!address ? 'Connect Wallet' : isLong ? 'Open Long Position' : 'Open Short Position'}
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add PositionsTable */}
        <PositionsTable />
      </div>
    </main>
  );
} 