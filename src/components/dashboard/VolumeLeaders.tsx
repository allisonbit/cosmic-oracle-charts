import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo } from "react";

export function VolumeLeaders() {
  const { data } = useMarketData();

  const volumeLeaders = useMemo(() => {
    const coins = data?.topCoins || [];
    return [...coins]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);
  }, [data]);

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
    return `$${vol.toLocaleString()}`;
  };

  const maxVolume = volumeLeaders[0]?.volume || 1;

  return (
    <div className="holo-card p-6">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        VOLUME LEADERS
      </h3>
      
      <div className="space-y-4">
        {volumeLeaders.map((coin, i) => (
          <div key={coin.symbol} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <span className="font-display font-bold">{coin.symbol}</span>
                <span className={cn(
                  "text-xs flex items-center gap-0.5",
                  coin.change24h >= 0 ? "text-success" : "text-danger"
                )}>
                  {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {coin.change24h.toFixed(1)}%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{formatVolume(coin.volume)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${(coin.volume / maxVolume) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
