import { useMemo } from "react";
import { Target, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketRegimeIndicator() {
  const regime = useMemo(() => {
    const position = 35 + Math.random() * 30; // Position on the meter (0-100)
    
    let label: string;
    if (position < 25) label = "Bear Trend";
    else if (position < 40) label = "Sideways";
    else if (position < 60) label = "Neutral";
    else if (position < 75) label = "Bull Trend";
    else label = "High Vol";

    const volatilities = ["Low", "Medium", "High"];
    const strengths = ["Weak", "Moderate", "Strong"];
    const momentums = ["Negative", "Neutral", "Positive"];

    return {
      position,
      label,
      volatility: volatilities[Math.floor(Math.random() * 3)],
      trendStrength: strengths[Math.floor(Math.random() * 3)],
      momentum: momentums[Math.floor(Math.random() * 3)],
      duration: Math.floor(Math.random() * 30) + 5,
      similarity: Math.floor(Math.random() * 30) + 60,
      historicalMatch: "Q1 2024 consolidation"
    };
  }, []);

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
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Duration</div>
          <div className="text-sm sm:text-base font-bold text-primary">
            {regime.duration} days
          </div>
        </div>
      </div>

      {/* Historical Similarity */}
      <div className="pt-3 border-t border-border">
        <div className="text-[10px] sm:text-xs text-muted-foreground mb-2">Historical Similarity:</div>
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
          Similar to {regime.historicalMatch}
        </p>
      </div>
    </div>
  );
}
