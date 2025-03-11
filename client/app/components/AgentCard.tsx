import Image from "next/image";
import { formatPrice } from "../lib/utils";
import { useRouter } from "next/navigation";

// Mock descriptions for agents
export const AGENT_DESCRIPTIONS = {
  aliAI: "Advanced trading algorithm specializing in momentum-based strategies with real-time.",
  ozAI: "Sophisticated arbitrage detection system utilizing cross-chain data analysis for trading .",
  zeAI: "High-frequency trading bot with advanced pattern recognition and risk management protocols.",
  hiAI: "Machine learning-powered trading system focusing on market sentiment and analysis.",
  ggAI: "Quantitative trading algorithm specializing in statistical arbitrage and mean reversion strategies.",
  gmonadAI: "Neural network-based trading system with deep learning capabilities for market prediction."
};

// Mock price changes (would come from API in real implementation)
const MOCK_PRICE_CHANGES = {
  aliAI: 18.9,
  ozAI: -12.5,
  hiAI: 24.8,
  zeAI: -8.7,
  ggAI: 15.3,
  gmonadAI: 22.1
};

interface AgentCardProps {
  name: string;
  symbol: string;
  currentPrice: string;
  basePrice: string;
  tokenAddress: string;
}

const AgentCard = ({ name, symbol, currentPrice, basePrice, tokenAddress }: AgentCardProps) => {
  const router = useRouter();
  // Calculate MCap (price * 21 million)
  const price = parseFloat(currentPrice);
  const mcapValue = price * 21000000;
  const priceChange = MOCK_PRICE_CHANGES[symbol] || 0;
  
  // Calculate TVL as 60-80% of MCAP
  const tvlPercentage = 0.6 + Math.random() * 0.2;
  const tvl = mcapValue * tvlPercentage;
  
  // Calculate 24h volume as 5-15% of TVL
  const volumePercentage = 0.05 + Math.random() * 0.1;
  const volume = tvl * volumePercentage;

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1 w-full max-w-[540px]">
      {/* Card */}
      <div
        className="relative rounded-[32px] w-full p-[16px] text-center shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]"
        style={{
          background:
            "linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)",
        }}
      >
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

          {/* Glow Effect */}
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

          {/* MCap Badge */}
          <div className="absolute top-4 right-4 bg-black/80 px-4 py-2 rounded-full border border-[#6E54FF] shadow-[0_0_20px_rgba(110,84,255,0.15)] backdrop-blur-xl z-20">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6E54FF]">
                <path d="M2.25 18.75L9 12l4.5 4.5L21.75 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-white">
                ${mcapValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Image */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <Image
                src={`/agents/${symbol}.jpeg`}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info */}
            <div className="text-left mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{AGENT_DESCRIPTIONS[symbol]}</p>
              
              {/* Price Display */}
              <div className="flex items-center justify-between bg-black/40 rounded-2xl p-4 border border-white/5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-400">1 {symbol} = </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-[#6E54FF]">$</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      {price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 3
                      })}
                    </span>
                  </div>
                </div>

                {/* 24h Change Indicator */}
                <div className="flex items-center gap-1.5 bg-[#6E54FF]/5 px-3 py-1.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${priceChange >= 0 ? 'text-[#6E54FF]' : 'text-red-500'}`}>
                    <path d={priceChange >= 0 ? "M12 20V4M5 11L12 4L19 11" : "M12 4V20M5 13L12 20L19 13"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-[#6E54FF]' : 'text-red-500'}`}>
                    {Math.abs(priceChange).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Volume and TVL Stats */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                  <p className="text-sm font-medium text-white">{formatValue(volume)}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">TVL</p>
                  <p className="text-sm font-medium text-white">{formatValue(tvl)}</p>
                </div>
              </div>
            </div>

            {/* Trade Button */}
            <button 
              onClick={() => router.push(`/trade/${tokenAddress}`)}
              className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[6px] min-w-full transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[hsla(220,10%,12%,1)] text-white shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(0,0,0,0.08),0px_0px_0px_1px_#000] hover:bg-[hsla(220,10%,18%,1)] h-12 px-4 py-[6px] rounded-[100px] text-[16px] leading-[24px] font-[500]">
              Trade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
