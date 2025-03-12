import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/app/lib/utils';
import { usePerpDex } from '@/app/hooks/usePerpDex';

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

export default function PositionsTable() {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;

  // Get close position function from usePerpDex hook
  const { useClosePosition } = usePerpDex(tokenAddress);
  const { write: closePosition, isLoading: isClosing, isSuccess: isCloseSuccess, error: closeError } = useClosePosition();

  useEffect(() => {
    const fetchPosition = async () => {
      if (!address || !tokenAddress) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/positions/${address}/${tokenAddress}`);
        const json = await response.json();

        if (json.success) {
          setPosition(json.data);
        } else {
          setError(json.error || 'Failed to fetch position');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch position');
      } finally {
        setLoading(false);
      }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 60000);
    return () => clearInterval(interval);
  }, [address, tokenAddress]);

  // Effect to handle close position success
  useEffect(() => {
    if (isCloseSuccess) {
      // Refetch position after successful close
      const fetchPosition = async () => {
        if (!address || !tokenAddress) return;
        const response = await fetch(`/api/positions/${address}/${tokenAddress}`);
        const json = await response.json();
        if (json.success) {
          setPosition(json.data);
        }
      };
      fetchPosition();
    }
  }, [isCloseSuccess, address, tokenAddress]);

  const handleClosePosition = () => {
    if (!closePosition) return;
    closePosition();
  };

  if (loading) {
    return (
      <div className="mt-6">
        <div className="relative rounded-[32px] w-full p-[16px] text-center shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]"
          style={{
            background: "linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)",
          }}>
          <div className="pt-6 pb-4 bg-[hsla(160,6%,7%,1)] rounded-[16px] p-[20px] lg:pt-[20px] shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-800 rounded w-1/4"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <div className="relative rounded-[32px] w-full p-[16px] text-center shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]"
          style={{
            background: "linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)",
          }}>
          <div className="pt-6 pb-4 bg-[hsla(160,6%,7%,1)] rounded-[16px] p-[20px] lg:pt-[20px] shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
            <div className="text-red-400">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!position || position.size === '0') {
    return (
      <div className="mt-6">
        <div className="relative rounded-[32px] w-full p-[16px] text-center shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]"
          style={{
            background: "linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)",
          }}>
          <div className="pt-6 pb-4 bg-[hsla(160,6%,7%,1)] rounded-[16px] p-[20px] lg:pt-[20px] shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
            <div className="text-gray-400">No active positions</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="relative rounded-[32px] w-full p-[16px] shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]"
        style={{
          background: "linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)",
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
              background: "radial-gradient(circle, rgba(179, 168, 240, 0.75) 100%, rgba(59, 51, 102, 0.25) 100%, transparent 70%)",
              filter: "blur(100px)",
              left: "50%",
              top: "50%",
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Position</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#6E54FF]"></div>
                <span className="text-sm text-gray-400">Auto-refreshing every 10s</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">Size</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">Leverage</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">Entry Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">Liq. Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">Margin</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">PnL</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 border-b border-white/5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium ${
                        position.isLong 
                          ? 'bg-[#6E54FF]/10 text-[#6E54FF] ring-1 ring-inset ring-[#6E54FF]/20' 
                          : 'bg-[#FF5454]/10 text-[#FF5454] ring-1 ring-inset ring-[#FF5454]/20'
                      }`}>
                        {position.isLong ? 'Long' : 'Short'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-white">${formatPrice(position.size, 6)}</td>
                    <td className="py-4 px-4 text-right font-medium text-white">{position.leverage}×</td>
                    <td className="py-4 px-4 text-right font-medium text-white">${formatPrice(position.entryPrice, 18)}</td>
                    <td className="py-4 px-4 text-right font-medium text-white">${formatPrice(position.liquidationPrice, 6)}</td>
                    <td className="py-4 px-4 text-right font-medium text-white">${formatPrice(position.margin, 6)}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-medium ${Number(position.unrealizedPnL) >= 0 ? 'text-[#6E54FF]' : 'text-[#FF5454]'}`}>
                          ${formatPrice(position.unrealizedPnL, 6)}
                        </span>
                        <span className={`text-xs ${Number(position.unrealizedPnL) >= 0 ? 'text-[#6E54FF]/60' : 'text-[#FF5454]/60'}`}>
                          {((Number(position.unrealizedPnL) / Number(position.margin)) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={handleClosePosition}
                        disabled={isClosing || !closePosition}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          isClosing
                            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            : 'bg-[#FF5454] text-white hover:bg-[#FF7A7A] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(255,84,84,0.50),0px_0px_0px_1px_#EB4747] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(255,84,84,0.50),0px_0px_0px_1px_#EB4747]'
                        }`}
                      >
                        {isClosing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                            Closing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Close
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {closeError && (
        <div className="mt-2 text-sm text-[#FF5454]">
          Failed to close position. Please try again.
        </div>
      )}
    </div>
  );
} 