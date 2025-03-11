'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/app/lib/utils';
import { AGENT_DESCRIPTIONS } from '@/app/components/AgentCard';

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

  // Fetch price and agent data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch price data
        const priceRes = await fetch(`/api/prices/data/${params.tokenAddress}`);
        const priceJson = await priceRes.json();
        if (!priceJson.success) throw new Error(priceJson.error);
        setPriceData(priceJson.data);

        // Fetch agent data
        const agentRes = await fetch('/api/prices/all');
        const agentJson = await agentRes.json();
        if (!agentJson.success) throw new Error(agentJson.error);
        const agent = agentJson.data.find((a: any) => a.tokenAddress === params.tokenAddress);
        if (!agent) throw new Error('Agent not found');
        setAgentData(agent);

        // Fetch position data if wallet is connected
        // TODO: Add wallet connection logic
        const walletAddress = '0x...'; // Replace with actual wallet address
        const positionRes = await fetch(`/api/positions/${walletAddress}/${params.tokenAddress}`);
        const positionJson = await positionRes.json();
        if (positionJson.success) {
          setPosition(positionJson.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set up polling for price updates
    const interval = setInterval(fetchData, 100000000);
    return () => clearInterval(interval);
  }, [params.tokenAddress]);

  // TradingView widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "BINANCE:DOGEUSDT",
      "interval": "1",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": true,
      "hide_legend": true,
      "save_image": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com"
    });
    
    const container = document.getElementById('tradingview_chart');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  if (loading || !agentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6E54FF]"></div>
      </div>
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
          <div className="bg-[hsla(160,6%,7%,1)] rounded-[32px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "url(/images/DotPattern.svg)",
                backgroundSize: "32px 32px",
                backgroundRepeat: "repeat",
              }}
            />

            {/* Glow Effect */}
            <div
              className="pointer-events-none absolute w-[360px] h-[360px] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-soft-light will-change-transform"
              style={{
                background: "radial-gradient(circle, rgba(179, 168, 240, 0.75) 100%, rgba(59, 51, 102, 0.25) 100%, transparent 70%)",
                filter: "blur(100px)",
                left: "50%",
                top: "50%",
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start gap-6">
                {/* Left side - Image and Basic Info */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <Image
                      src={`/agents/${agentData.symbol}.jpeg`}
                      alt={agentData.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{agentData.name}</h2>
                    <p className="text-gray-400 text-sm mb-4 max-w-[400px]">{AGENT_DESCRIPTIONS[agentData.symbol]}</p>
                  </div>
                </div>

                {/* Middle - Price and Stats */}
                <div className="flex-1 flex items-center justify-center gap-6">
                  {/* Price Display */}
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-400">1 {agentData.symbol} = </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-[#6E54FF]">$</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                          {parseFloat(agentData.currentPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                      <p className="text-sm font-medium text-white">$1.2M</p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-gray-400 mb-1">TVL</p>
                      <p className="text-sm font-medium text-white">$4.5M</p>
                    </div>
                  </div>
                </div>

                {/* Right side - Social */}
                <div className="flex items-center">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2c2d30] hover:bg-[#3c3d40] transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Chart */}
          <div className="col-span-8 bg-[hsla(160,6%,7%,1)] rounded-[32px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
            <div id="tradingview_chart" className="w-full h-[600px]" />
          </div>

          {/* Trading Interface */}
          <div className="col-span-4">
            <div className="bg-[hsla(160,6%,7%,1)] rounded-[32px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "url(/images/DotPattern.svg)",
                  backgroundSize: "32px 32px",
                  backgroundRepeat: "repeat",
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Long/Short Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setIsLong(true)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      isLong
                        ? 'bg-[#6E54FF] text-white shadow-[0_0_20px_rgba(110,84,255,0.15)]'
                        : 'bg-[#2c2d30] text-gray-400'
                    }`}
                  >
                    Buy/Long
                  </button>
                  <button
                    onClick={() => setIsLong(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      !isLong
                        ? 'bg-[#FF5454] text-white shadow-[0_0_20px_rgba(255,84,84,0.15)]'
                        : 'bg-[#2c2d30] text-gray-400'
                    }`}
                  >
                    Sell/Short
                  </button>
                </div>

                {/* Leverage Input */}
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Leverage: {leverage}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#2c2d30] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Margin Input */}
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    Margin (USDC)
                  </label>
                  <input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                    placeholder="Enter margin amount"
                    className="w-full bg-[#2c2d30] border border-[#3c3d40] rounded-xl px-4 py-3 text-white"
                  />
                </div>

                {/* Open Position Button */}
                <button className="w-full bg-[#6E54FF] text-white py-4 rounded-xl font-medium hover:bg-[#5842CC] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_20px_rgba(110,84,255,0.15)]">
                  Open Position
                </button>

                {/* Positions Section */}
                {position && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-4">Open Positions</h3>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Size</span>
                          <span className="text-white">${position.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entry Price</span>
                          <span className="text-white">${position.entryPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Leverage</span>
                          <span className="text-white">{position.leverage}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Liquidation Price</span>
                          <span className="text-white">${position.liquidationPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Unrealized PnL</span>
                          <span className={`${
                            parseFloat(position.unrealizedPnL) >= 0
                              ? 'text-[#6E54FF]'
                              : 'text-[#FF5454]'
                          }`}>
                            ${position.unrealizedPnL}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 