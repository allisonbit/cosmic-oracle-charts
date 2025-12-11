import { TrendingUp, TrendingDown, Crown, Medal, Award, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface TopPerformersProps {
  onCoinClick: (coin: any) => void;
}

export function TopPerformers({ onCoinClick }: TopPerformersProps) {
  const { data } = useMarketData();
  const [view, setView] = useState<"gainers" | "losers">("gainers");

  const { gainers, losers } = useMemo(() => {
    const coins = data?.topCoins || [];
    const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }, [data]);

  const displayedCoins = view === "gainers" ? gainers : losers;
  const icons = [Crown, Medal, Award];

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
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => setView("gainers")}
            className={cn(
              "px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-display transition-all touch-target-lg tap-highlight-none active:scale-95",
              view === "gainers" ? "bg-success/20 text-success" : "text-muted-foreground"
            )}
          >
            Gainers
          </button>
          <button
            onClick={() => setView("losers")}
            className={cn(
              "px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-display transition-all touch-target-lg tap-highlight-none active:scale-95",
              view === "losers" ? "bg-danger/20 text-danger" : "text-muted-foreground"
            )}
          >
            Losers
          </button>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {displayedCoins.map((coin, i) => {
          const Icon = icons[i] || Award;
          const isPositive = coin.change24h >= 0;
          
          return (
            <button
              key={coin.symbol}
              onClick={() => onCoinClick(coin)}
              className={cn(
                "w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all active:scale-[0.98] text-left touch-target tap-highlight-none",
                isPositive ? "bg-success/5 border-success/20 active:border-success/40" : "bg-danger/5 border-danger/20 active:border-danger/40"
              )}
            >
              <div className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                i < 3 ? (isPositive ? "bg-success/20" : "bg-danger/20") : "bg-muted"
              )}>
                {i < 3 ? (
                  <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isPositive ? "text-success" : "text-danger")} />
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{i + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display font-bold text-sm sm:text-base">{coin.symbol}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate hidden xs:inline">{coin.name}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className={cn(
                  "font-bold flex items-center gap-1 justify-end text-sm sm:text-base",
                  isPositive ? "text-success" : "text-danger"
                )}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {isPositive ? "+" : ""}{coin.change24h.toFixed(1)}%
                </div>
                <div className="text-[10px] sm:text-xs text-primary flex items-center gap-1 justify-end">
                  <span className="hidden sm:inline">Details</span> <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Link 
        to="/explorer"
        className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 font-medium py-2 touch-target tap-highlight-none active:scale-95"
      >
        View All Tokens <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
