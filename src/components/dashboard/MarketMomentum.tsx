import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";

export function MarketMomentum() {
  const { data } = useMarketData();
  const topCoins = data?.topCoins?.slice(0, 12) || [];

  // Calculate momentum indicators
  const bullish = topCoins.filter(c => c.change24h > 2).length;
  const bearish = topCoins.filter(c => c.change24h < -2).length;
  const neutral = topCoins.length - bullish - bearish;

  const momentum = bullish > bearish ? "BULLISH" : bearish > bullish ? "BEARISH" : "NEUTRAL";
  const strength = Math.abs(bullish - bearish) / topCoins.length * 100;

  return (
    <div className="holo-card p-6">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        MARKET MOMENTUM
      </h3>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={cn(
            "text-2xl font-display font-bold",
            momentum === "BULLISH" ? "text-success" : momentum === "BEARISH" ? "text-danger" : "text-warning"
          )}>
            {momentum}
          </div>
          <div className="text-xs text-muted-foreground">
            Strength: {strength.toFixed(0)}%
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-success font-bold text-xl">{bullish}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Bullish
            </div>
          </div>
          <div>
            <div className="text-warning font-bold text-xl">{neutral}</div>
            <div className="text-xs text-muted-foreground">Neutral</div>
          </div>
          <div>
            <div className="text-danger font-bold text-xl">{bearish}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Bearish
            </div>
          </div>
        </div>
      </div>

      {/* Momentum Bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-muted">
        <div 
          className="bg-success transition-all" 
          style={{ width: `${(bullish / topCoins.length) * 100}%` }} 
        />
        <div 
          className="bg-warning transition-all" 
          style={{ width: `${(neutral / topCoins.length) * 100}%` }} 
        />
        <div 
          className="bg-danger transition-all" 
          style={{ width: `${(bearish / topCoins.length) * 100}%` }} 
        />
      </div>
    </div>
  );
}
