import { 
  TrendingUp, TrendingDown, Crown, Medal, Award, ArrowRight, 
  Eye, Activity, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TokenIcon } from "@/components/ui/token-icon";

interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

interface EnhancedTopPerformersProps {
  onCoinClick: (coin: CoinData) => void;
}

export function EnhancedTopPerformers({ onCoinClick }: EnhancedTopPerformersProps) {
  const { data, isLoading } = useMarketData();
  const navigate = useNavigate();
  const [view, setView] = useState<"gainers" | "losers">("gainers");

  const { gainers, losers } = useMemo(() => {
    const coins = data?.topCoins || [];
    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
    return {
      gainers: sorted.slice(0, 6),
      losers: sorted.slice(-6).reverse(),
    };
  }, [data]);

  const displayedCoins = view === "gainers" ? gainers : losers;
  const icons = [Crown, Medal, Award];

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getCoinId = (coin: CoinData) => coin.name?.toLowerCase().replace(/\s+/g, '-') || coin.symbol.toLowerCase();

  return (
    <div className="holo-card p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
          {view === "gainers" ? (
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
          )}
          <span className="hidden sm:inline">{view === "gainers" ? "TOP GAINERS" : "TOP LOSERS"}</span>
          <span className="sm:hidden">{view === "gainers" ? "GAINERS" : "LOSERS"}</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setView("gainers")}
              className={cn(
                "px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-display transition-all",
                view === "gainers" ? "bg-success/20 text-success" : "text-muted-foreground"
              )}
            >
              Gainers
            </button>
            <button
              onClick={() => setView("losers")}
              className={cn(
                "px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-display transition-all",
                view === "losers" ? "bg-danger/20 text-danger" : "text-muted-foreground"
              )}
            >
              Losers
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {displayedCoins.map((coin, i) => {
          const Icon = icons[i] || Award;
          const isPositive = coin.change24h >= 0;
          const volumeToMcap = (coin.volume / coin.marketCap) * 100;
          const coinId = getCoinId(coin);
          
          return (
            <Link
              key={coin.symbol}
              to={`/price-prediction/${coinId}/daily`}
              className={cn(
                "w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all active:scale-[0.98] text-left group",
                isPositive ? "bg-success/5 border-success/20 hover:border-success/40" : "bg-danger/5 border-danger/20 hover:border-danger/40"
              )}
            >
              <TokenIcon coinId={coinId} symbol={coin.symbol} size="sm" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display font-bold text-sm sm:text-base">{coin.symbol}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate hidden xs:inline">{coin.name}</span>
                  {volumeToMcap > 10 && <Activity className="w-3 h-3 text-warning" />}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2">
                  <span>${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-primary/50">•</span>
                  <span>Vol: {formatNumber(coin.volume)}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className={cn(
                  "font-bold flex items-center gap-1 justify-end text-sm sm:text-base",
                  isPositive ? "text-success" : "text-danger"
                )}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive ? "+" : ""}{coin.change24h.toFixed(1)}%
                </div>
                <div className="text-[10px] sm:text-xs text-primary flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3" /> View
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link 
        to="/explorer"
        className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 font-medium py-2"
      >
        View All Tokens <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
