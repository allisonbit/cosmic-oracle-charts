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
    <div className="holo-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          {view === "gainers" ? (
            <TrendingUp className="w-5 h-5 text-success" />
          ) : (
            <TrendingDown className="w-5 h-5 text-danger" />
          )}
          {view === "gainers" ? "TOP GAINERS" : "TOP LOSERS"}
        </h3>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => setView("gainers")}
            className={cn(
              "px-3 py-1 rounded text-xs font-display transition-all",
              view === "gainers" ? "bg-success/20 text-success" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Gainers
          </button>
          <button
            onClick={() => setView("losers")}
            className={cn(
              "px-3 py-1 rounded text-xs font-display transition-all",
              view === "losers" ? "bg-danger/20 text-danger" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Losers
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {displayedCoins.map((coin, i) => {
          const Icon = icons[i] || Award;
          const isPositive = coin.change24h >= 0;
          
          return (
            <button
              key={coin.symbol}
              onClick={() => onCoinClick(coin)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02] text-left",
                isPositive ? "bg-success/5 border-success/20 hover:border-success/40" : "bg-danger/5 border-danger/20 hover:border-danger/40"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                i < 3 ? (isPositive ? "bg-success/20" : "bg-danger/20") : "bg-muted"
              )}>
                {i < 3 ? (
                  <Icon className={cn("w-4 h-4", isPositive ? "text-success" : "text-danger")} />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold">{coin.symbol}</span>
                  <span className="text-xs text-muted-foreground truncate">{coin.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-right">
                <div className={cn(
                  "font-bold flex items-center gap-1 justify-end",
                  isPositive ? "text-success" : "text-danger"
                )}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
                </div>
                <div className="text-xs text-primary flex items-center gap-1 justify-end">
                  Details <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Link 
        to="/explorer"
        className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium py-2"
      >
        View All Tokens <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
