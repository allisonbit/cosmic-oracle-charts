import { 
  BarChart3, TrendingUp, TrendingDown, ArrowRight, Eye, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TokenIcon } from "@/components/ui/token-icon";

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
    return `$${vol.toLocaleString()}`;
  };

  const maxVolume = volumeLeaders[0]?.volume || 1;
  const totalVolume = volumeLeaders.reduce((acc, c) => acc + c.volume, 0);
  const getCoinId = (coin: VolumeLeader) => coin.name?.toLowerCase().replace(/\s+/g, '-') || coin.symbol.toLowerCase();

  return (
    <div className="holo-card p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          VOLUME LEADERS
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
          Live
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-3 mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Combined 24h Volume</div>
          <div className="text-lg font-bold text-primary">{formatVolume(totalVolume)}</div>
        </div>
        <Activity className="w-6 h-6 text-primary/50" />
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {volumeLeaders.map((coin, i) => (
          <Link
            key={coin.symbol}
            to={`/price-prediction/${getCoinId(coin)}/daily`}
            className="block space-y-1.5 sm:space-y-2 hover:bg-muted/20 p-2 -mx-2 rounded-lg transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground w-4 sm:w-5">{i + 1}</span>
                <TokenIcon coinId={getCoinId(coin)} symbol={coin.symbol} size="sm" />
                <span className="font-display font-bold text-sm sm:text-base">{coin.symbol}</span>
                <span className={cn(
                  "text-[10px] sm:text-xs flex items-center gap-0.5",
                  coin.change24h >= 0 ? "text-success" : "text-danger"
                )}>
                  {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {coin.change24h.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">{formatVolume(coin.volume)}</span>
                <Eye className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${(coin.volume / maxVolume) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Vol/MCap: {coin.volumeToMcap.toFixed(1)}%</span>
              <span className={cn(
                coin.volumeToMcap > 10 ? "text-success" : coin.volumeToMcap > 5 ? "text-warning" : "text-muted-foreground"
              )}>
                {coin.volumeToMcap > 10 ? "High Activity" : coin.volumeToMcap > 5 ? "Active" : "Normal"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full mt-4 pt-3 border-t border-border/30 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1"
      >
        {showAll ? "Show Less" : "Show More"} <ArrowRight className={cn("w-4 h-4 transition-transform", showAll && "rotate-90")} />
      </button>
    </div>
  );
}
