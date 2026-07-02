import {
  TrendingUp, TrendingDown, ArrowRight, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CoinImage } from "@/components/ui/CoinImage";
import { TradeButtons } from "@/components/trading/TradeButtons";

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
  const { data } = useMarketData();
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

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${(num ?? 0).toFixed(2)}`;
  };

  const getCoinId = (coin: CoinData) => coin.name?.toLowerCase().replace(/\s+/g, '-') || coin.symbol.toLowerCase();

  return (
    <div className="border-t border-border/30 pt-5 pb-5">
      <div className="section-header mb-2">
        <span className="section-label flex items-center gap-1.5">
          {view === "gainers" ? (
            <TrendingUp className="w-3 h-3 text-success" />
          ) : (
            <TrendingDown className="w-3 h-3 text-danger" />
          )}
          Top Performers
        </span>
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setView("gainers")}
            className={cn("px-2 py-0.5 transition-colors", view === "gainers" ? "text-success font-semibold" : "text-muted-foreground hover:text-foreground")}
          >
            Gainers
          </button>
          <button
            onClick={() => setView("losers")}
            className={cn("px-2 py-0.5 transition-colors", view === "losers" ? "text-danger font-semibold" : "text-muted-foreground hover:text-foreground")}
          >
            Losers
          </button>
        </div>
      </div>

      <h3 className="font-display font-bold text-base md:text-lg mb-4">
        {view === "gainers" ? "Top Gainers" : "Top Losers"} <span className="text-muted-foreground font-normal text-sm">24h</span>
      </h3>

      <div>
        {displayedCoins.map((coin) => {
          const isPositive = coin.change24h >= 0;
          const volumeToMcap = (coin.volume / coin.marketCap) * 100;
          const coinId = getCoinId(coin);

          return (
            <Link
              key={coin.symbol}
              to={`/price-prediction/${coinId}/daily`}
              className="editorial-row group items-center gap-3"
            >
              <CoinImage symbol={coin.symbol} size={28} className="flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-display font-bold text-sm">{coin.symbol}</span>
                  <span className="text-xs text-muted-foreground truncate">{coin.name}</span>
                  {volumeToMcap > 10 && <Activity className="w-3 h-3 text-warning flex-shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${(coin.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} · {formatNumber(coin.volume)}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className={cn("font-bold text-sm flex items-center gap-0.5 justify-end", isPositive ? "text-success" : "text-danger")}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive ? "+" : ""}{(coin.change24h ?? 0).toFixed(1)}%
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.preventDefault()}>
                  <TradeButtons symbol={coin.symbol} name={coin.name} price={coin.price} variant="inline" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30">
        <Link to="/explorer" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          View all tokens <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
