import {
  BarChart3, TrendingUp, TrendingDown, ArrowRight, Eye, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CoinImage } from "@/components/ui/CoinImage";

interface VolumeLeader {
  symbol: string;
  name: string;
  volume: number;
  price: number;
  change24h: number;
  marketCap: number;
  volumeToMcap: number;
  rank: number;
}

export function EnhancedVolumeLeaders() {
  const { data, isLoading } = useMarketData();
  const [showAll, setShowAll] = useState(false);

  const volumeLeaders = useMemo(() => {
    const coins = data?.topCoins || [];
    return [...coins]
      .map((coin, index) => ({
        ...coin,
        volumeToMcap: (coin.volume / coin.marketCap) * 100,
        rank: index + 1
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, showAll ? 12 : 6);
  }, [data, showAll]);

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(1)}K`;
    return `$${(vol ?? 0).toLocaleString()}`;
  };

  const maxVolume = volumeLeaders[0]?.volume || 1;
  const totalVolume = volumeLeaders.reduce((acc, c) => acc + c.volume, 0);
  const getCoinId = (coin: VolumeLeader) => coin.name?.toLowerCase().replace(/\s+/g, '-') || coin.symbol.toLowerCase();

  return (
    <div className="border-t border-border/30 pt-5 pb-5">
      <div className="section-header mb-2">
        <span className="section-label flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3 text-primary" />
          Volume Leaders
          <span className={cn("w-2 h-2 rounded-full animate-pulse ml-1", isLoading ? "bg-warning" : "bg-success")} />
        </span>
      </div>

      {/* Inline total volume stat */}
      <div className="flex items-baseline gap-3 mb-5">
        <div>
          <div className="section-label mb-0.5 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Combined 24h Volume
          </div>
          <div className="text-xl font-display font-bold text-primary">{formatVolume(totalVolume)}</div>
        </div>
      </div>

      <div className="space-y-1">
        {volumeLeaders.map((coin, i) => (
          <Link
            key={coin.symbol}
            to={`/price-prediction/${getCoinId(coin)}/daily`}
            className="editorial-row group items-center gap-2"
          >
            <span className="text-xs text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
            <CoinImage symbol={coin.symbol} size={22} className="flex-shrink-0" />
            <span className="font-display font-bold text-sm">{coin.symbol}</span>
            <span className={cn(
              "text-xs flex items-center gap-0.5 flex-shrink-0",
              coin.change24h >= 0 ? "text-success" : "text-danger"
            )}>
              {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {(coin.change24h ?? 0).toFixed(1)}%
            </span>

            <div className="flex-1 min-w-0 px-2">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                  style={{ width: `${(coin.volume / maxVolume) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Vol/MCap: <span className={cn(
                  coin.volumeToMcap > 10 ? "text-success" : coin.volumeToMcap > 5 ? "text-warning" : "text-muted-foreground"
                )}>{(coin.volumeToMcap ?? 0).toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-sm text-muted-foreground">{formatVolume(coin.volume)}</span>
              <Eye className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full mt-4 pt-3 border-t border-border/30 text-xs text-primary font-semibold flex items-center gap-1"
      >
        {showAll ? "Show Less" : "Show More"} <ArrowRight className={cn("w-3 h-3 transition-transform", showAll && "rotate-90")} />
      </button>
    </div>
  );
}
