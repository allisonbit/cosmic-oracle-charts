import {
  TrendingUp, TrendingDown, Zap, Activity,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";
import { Link } from "react-router-dom";

export function EnhancedMarketMomentum() {
  const { data, isLoading } = useMarketData();
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const topCoins = useMemo(() => data?.topCoins?.slice(0, 20) || [], [data?.topCoins]);

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

  const { data: sectorData } = useQuery({
    queryKey: ["sector-performance"],
    queryFn: async () => {
      const { data } = await invokeFunction("sector-performance");
      return (data?.sectors ?? []) as Array<{ name: string; change: number }>;
    },
    refetchInterval: 120_000,
    refetchIntervalInBackground: true,
    staleTime: 60_000,
  });

  const sectors = useMemo(() => {
    const list = (sectorData ?? []).slice(0, 4);
    return list.map(s => ({
      sector: s.name,
      avgChange: s.change ?? 0,
      topMover: topCoins[0]?.symbol || "BTC",
      topMoverChange: topCoins[0]?.change24h || 0,
    }));
  }, [sectorData, topCoins]);

  return (
    <div className="border-t border-border/30 pt-5 pb-5">
      <div className="section-header mb-2">
        <span className="section-label flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-primary" />
          Market Momentum
          <span className={cn("w-2 h-2 rounded-full animate-pulse ml-1", isLoading ? "bg-warning" : "bg-success")} />
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className={cn(
            "text-xl sm:text-2xl font-display font-bold",
            momentum.direction === "BULLISH" ? "text-success" : momentum.direction === "BEARISH" ? "text-danger" : "text-warning"
          )}>
            {momentum.direction}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <span>Strength: {(momentum.strength ?? 0).toFixed(0)}%</span>
            <span className="text-primary">·</span>
            <span className={cn(
              momentum.velocity === "accelerating" ? "text-success" :
              momentum.velocity === "decelerating" ? "text-danger" : "text-muted-foreground"
            )}>
              {momentum.velocity.charAt(0).toUpperCase() + momentum.velocity.slice(1)}
            </span>
          </div>
        </div>

        {/* Inline stat strip */}
        <div className="flex items-stretch divide-x divide-border/30 text-center">
          <div className="px-4 first:pl-0">
            <div className="text-success font-bold text-lg">{momentum.bullish}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <TrendingUp className="w-3 h-3" /> Bullish
            </div>
          </div>
          <div className="px-4">
            <div className="text-warning font-bold text-lg">{momentum.neutral}</div>
            <div className="text-xs text-muted-foreground">Neutral</div>
          </div>
          <div className="px-4">
            <div className="text-danger font-bold text-lg">{momentum.bearish}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <TrendingDown className="w-3 h-3" /> Bearish
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden flex bg-muted mb-5">
        <div className="bg-success transition-all" style={{ width: `${(momentum.bullish / Math.max(topCoins.length, 1)) * 100}%` }} />
        <div className="bg-warning transition-all" style={{ width: `${(momentum.neutral / Math.max(topCoins.length, 1)) * 100}%` }} />
        <div className="bg-danger transition-all" style={{ width: `${(momentum.bearish / Math.max(topCoins.length, 1)) * 100}%` }} />
      </div>

      {/* Avg change / volatility / tracked — inline strip */}
      <div className="flex items-stretch divide-x divide-border/30 border-t border-border/20 pt-4 mb-5">
        <div className="pr-5">
          <div className="section-label mb-0.5">Avg Change</div>
          <div className={cn("font-bold text-sm", momentum.avgChange >= 0 ? "text-success" : "text-danger")}>
            {momentum.avgChange >= 0 ? "+" : ""}{(momentum.avgChange ?? 0).toFixed(2)}%
          </div>
        </div>
        <div className="px-5">
          <div className="section-label mb-0.5">Volatility</div>
          <div className={cn("font-bold text-sm capitalize",
            momentum.volatilityLevel === "extreme" ? "text-danger" :
            momentum.volatilityLevel === "high" ? "text-warning" : "text-muted-foreground"
          )}>
            {momentum.volatilityLevel}
          </div>
        </div>
        <div className="pl-5">
          <div className="section-label mb-0.5">Tracked</div>
          <div className="font-bold text-sm text-primary">{topCoins.length}</div>
        </div>
      </div>

      {/* Sector rows — editorial */}
      {sectors.length > 0 && (
        <div>
          <div className="section-label mb-2 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Sectors
          </div>
          {sectors.map((sector) => (
            <div key={sector.sector}>
              <button
                onClick={() => setExpandedSector(expandedSector === sector.sector ? null : sector.sector)}
                className="w-full editorial-row text-left items-center justify-between"
              >
                <span className="text-sm font-medium">{sector.sector}</span>
                <span className={cn("text-sm font-bold", sector.avgChange >= 0 ? "text-success" : "text-danger")}>
                  {sector.avgChange >= 0 ? "+" : ""}{(sector.avgChange ?? 0).toFixed(1)}%
                </span>
              </button>
              {expandedSector === sector.sector && (
                <div className="ml-3 pb-3 text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 animate-in fade-in duration-150">
                  Top mover:{" "}
                  <Link to={`/price-prediction/${sector.topMover.toLowerCase()}/daily`} className="text-primary hover:underline">
                    {sector.topMover} ({sector.topMoverChange >= 0 ? "+" : ""}{(sector.topMoverChange ?? 0).toFixed(1)}%)
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
