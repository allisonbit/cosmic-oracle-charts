import { 
  TrendingUp, TrendingDown, Zap, Activity, BarChart3, 
  ArrowRight, Clock, Target, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export function EnhancedMarketMomentum() {
  const { data, isLoading } = useMarketData();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const topCoins = data?.topCoins?.slice(0, 20) || [];

  const momentum = useMemo(() => {
    const bullish = topCoins.filter(c => c.change24h > 2).length;
    const bearish = topCoins.filter(c => c.change24h < -2).length;
    const neutral = topCoins.length - bullish - bearish;
    const direction = bullish > bearish ? "BULLISH" : bearish > bullish ? "BEARISH" : "NEUTRAL";
    const strength = Math.abs(bullish - bearish) / Math.max(topCoins.length, 1) * 100;
    const avgChange = topCoins.reduce((acc, c) => acc + c.change24h, 0) / Math.max(topCoins.length, 1);
    const strongBullish = topCoins.filter(c => c.change24h > 5).length;
    const strongBearish = topCoins.filter(c => c.change24h < -5).length;
    const velocity = strongBullish > strongBearish ? "accelerating" : strongBearish > strongBullish ? "decelerating" : "stable";
    const changes = topCoins.map(c => Math.abs(c.change24h));
    const avgVolatility = changes.reduce((a, b) => a + b, 0) / Math.max(changes.length, 1);
    const volatilityLevel = avgVolatility > 8 ? "extreme" : avgVolatility > 5 ? "high" : avgVolatility > 2 ? "moderate" : "low";
    return { bullish, bearish, neutral, direction, strength, avgChange, velocity, volatilityLevel };
  }, [topCoins]);

  const sectors = useMemo(() => [
    { sector: "Large Caps", avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 0.5), topMover: topCoins[0]?.symbol || "BTC", topMoverChange: topCoins[0]?.change24h || 0 },
    { sector: "DeFi", avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 0.8), topMover: "UNI", topMoverChange: (Math.random() - 0.3) * 15 },
    { sector: "Layer 1s", avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 0.6), topMover: "SOL", topMoverChange: (Math.random() - 0.3) * 12 },
    { sector: "Memes", avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 2), topMover: "DOGE", topMoverChange: (Math.random() - 0.3) * 20 },
  ], [topCoins, momentum.avgChange]);

  return (
    <div className="holo-card p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          MARKET MOMENTUM
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
          Live
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <div>
          <div className={cn(
            "text-xl sm:text-2xl font-display font-bold",
            momentum.direction === "BULLISH" ? "text-success" : momentum.direction === "BEARISH" ? "text-danger" : "text-warning"
          )}>
            {momentum.direction}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2">
            <span>Strength: {momentum.strength.toFixed(0)}%</span>
            <span className="text-primary">•</span>
            <span className={cn(
              momentum.velocity === "accelerating" ? "text-success" : 
              momentum.velocity === "decelerating" ? "text-danger" : "text-muted-foreground"
            )}>
              {momentum.velocity.charAt(0).toUpperCase() + momentum.velocity.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-6 text-center">
          <div>
            <div className="text-success font-bold text-lg sm:text-xl">{momentum.bullish}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Bullish
            </div>
          </div>
          <div>
            <div className="text-warning font-bold text-lg sm:text-xl">{momentum.neutral}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Neutral</div>
          </div>
          <div>
            <div className="text-danger font-bold text-lg sm:text-xl">{momentum.bearish}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Bearish
            </div>
          </div>
        </div>
      </div>

      <div className="h-2 sm:h-3 rounded-full overflow-hidden flex bg-muted mb-4">
        <div className="bg-success transition-all" style={{ width: `${(momentum.bullish / Math.max(topCoins.length, 1)) * 100}%` }} />
        <div className="bg-warning transition-all" style={{ width: `${(momentum.neutral / Math.max(topCoins.length, 1)) * 100}%` }} />
        <div className="bg-danger transition-all" style={{ width: `${(momentum.bearish / Math.max(topCoins.length, 1)) * 100}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">Avg Change</div>
          <div className={cn("text-sm font-bold", momentum.avgChange >= 0 ? "text-success" : "text-danger")}>
            {momentum.avgChange >= 0 ? "+" : ""}{momentum.avgChange.toFixed(2)}%
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">Volatility</div>
          <div className={cn("text-sm font-bold capitalize",
            momentum.volatilityLevel === "extreme" ? "text-danger" :
            momentum.volatilityLevel === "high" ? "text-warning" : "text-muted-foreground"
          )}>
            {momentum.volatilityLevel}
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">Tracked</div>
          <div className="text-sm font-bold text-primary">{topCoins.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sectors.map((sector) => (
          <div key={sector.sector}>
            <button
              onClick={() => setExpandedSector(expandedSector === sector.sector ? null : sector.sector)}
              className="w-full p-2 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
            >
              <div className="text-[10px] text-muted-foreground mb-1">{sector.sector}</div>
              <div className={cn("text-sm font-bold", sector.avgChange >= 0 ? "text-success" : "text-danger")}>
                {sector.avgChange >= 0 ? "+" : ""}{sector.avgChange.toFixed(1)}%
              </div>
            </button>
            {expandedSector === sector.sector && (
              <div className="mt-1 p-2 rounded bg-muted/20 border border-border/20 text-xs animate-in fade-in duration-200">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top Mover:</span>
                  <Link to={`/price-prediction/${sector.topMover.toLowerCase()}/daily`} className="text-primary hover:underline">
                    {sector.topMover} ({sector.topMoverChange >= 0 ? "+" : ""}{sector.topMoverChange.toFixed(1)}%)
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
