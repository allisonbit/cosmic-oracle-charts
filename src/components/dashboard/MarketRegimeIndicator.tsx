import { useMemo } from "react";
import { Target, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";

export function MarketRegimeIndicator() {
  const { data } = useMarketData();

  const regime = useMemo(() => {
    const coins = data?.topCoins ?? [];
    const fgi = data?.fearGreedIndex ?? 50;
    const mcChange = data?.global?.marketCapChange24h ?? 0;
    const top = coins.slice(0, 20);

    const avgChange = top.length ? top.reduce((a, c) => a + (c.change24h || 0), 0) / top.length : 0;
    const avgVol = top.length ? top.reduce((a, c) => a + Math.abs(c.change24h || 0), 0) / top.length : 0;
    const bullish = top.filter(c => (c.change24h || 0) > 2).length;
    const bearish = top.filter(c => (c.change24h || 0) < -2).length;

    // Map fear/greed (0-100) directly to regime position
    const position = Math.max(0, Math.min(100, fgi));
    let label: string;
    if (position < 25) label = "Bear Trend";
    else if (position < 40) label = "Sideways";
    else if (position < 60) label = "Neutral";
    else if (position < 75) label = "Bull Trend";
    else label = "High Greed";

    const volatility = avgVol > 6 ? "High" : avgVol > 3 ? "Medium" : "Low";
    const strengthScore = Math.abs(bullish - bearish) / Math.max(top.length, 1);
    const trendStrength = strengthScore > 0.5 ? "Strong" : strengthScore > 0.25 ? "Moderate" : "Weak";
    const momentum = mcChange > 1 ? "Positive" : mcChange < -1 ? "Negative" : "Neutral";
    // Similarity = how close fgi & mc change agree (0-100)
    const similarity = Math.round(100 - Math.min(100, Math.abs((fgi - 50) - mcChange * 5)));
    const historicalMatch = position >= 60 && avgVol > 5 ? "Late-stage bull run" : position >= 60 ? "Sustained uptrend" : position <= 40 ? "Capitulation phase" : "Consolidation range";

    return { position, label, volatility, trendStrength, momentum, similarity, historicalMatch };
  }, [data]);

  const getVolatilityColor = (v: string) => {
    if (v === "Low") return "text-success";
    if (v === "Medium") return "text-warning";
    return "text-danger";
  };

  const getMomentumColor = (m: string) => {
    if (m === "Positive") return "text-success";
    if (m === "Neutral") return "text-warning";
    return "text-danger";
  };

  const getStrengthColor = (s: string) => {
    if (s === "Strong") return "text-success";
    if (s === "Moderate") return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          MARKET REGIME
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Current market state identification</p>
      </div>

      {/* Regime Meter */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-2">
          <span>Bear</span>
          <span>Neutral</span>
          <span>Bull</span>
          <span>High Vol</span>
        </div>
        <div className="relative h-2 rounded-full bg-gradient-to-r from-danger via-warning to-success">
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
            style={{ left: `${regime.position}%` }}
          >
            <div className="w-4 h-4 rounded-full bg-foreground border-2 border-background shadow-lg" />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] sm:text-xs font-medium bg-muted px-2 py-0.5 rounded">
                {regime.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        <div className="bg-muted/30 p-2 sm:p-3 rounded-lg">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Volatility</div>
          <div className={cn("text-sm sm:text-base font-bold", getVolatilityColor(regime.volatility))}>
            {regime.volatility}
          </div>
        </div>
        <div className="bg-muted/30 p-2 sm:p-3 rounded-lg">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Trend Strength</div>
          <div className={cn("text-sm sm:text-base font-bold", getStrengthColor(regime.trendStrength))}>
            {regime.trendStrength}
          </div>
        </div>
        <div className="bg-muted/30 p-2 sm:p-3 rounded-lg">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Momentum</div>
          <div className={cn("text-sm sm:text-base font-bold flex items-center gap-1", getMomentumColor(regime.momentum))}>
            {regime.momentum === "Positive" ? <TrendingUp className="w-3 h-3" /> : 
             regime.momentum === "Negative" ? <TrendingDown className="w-3 h-3" /> :
             <Activity className="w-3 h-3" />}
            {regime.momentum}
          </div>
        </div>
        <div className="bg-muted/30 p-2 sm:p-3 rounded-lg">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Trend Strength</div>
          <div className={cn("text-sm sm:text-base font-bold", regime.trendStrength === "Strong" ? "text-success" : regime.trendStrength === "Moderate" ? "text-warning" : "text-muted-foreground")}>
            {regime.trendStrength}
          </div>
        </div>
      </div>

      {/* Signal Confluence */}
      <div className="pt-3 border-t border-border">
        <div className="text-[10px] sm:text-xs text-muted-foreground mb-2">Signal Confluence:</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${regime.similarity}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-foreground">{regime.similarity}%</span>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
          {regime.historicalMatch}
        </p>
      </div>
    </div>
  );
}
