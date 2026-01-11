import { TrendingUp, TrendingDown, Activity, Waves, Cpu, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentContextBarProps {
  trend: 'improving' | 'declining' | 'stable';
  vsPrice: 'bullish_divergence' | 'bearish_divergence' | 'aligned' | 'neutral';
  topSector: string;
  sectorChange: number;
  whaleMood: 'accumulating' | 'distributing' | 'neutral';
  netflow: number;
}

export function SentimentContextBar({
  trend,
  vsPrice,
  topSector,
  sectorChange,
  whaleMood,
  netflow
}: SentimentContextBarProps) {
  const getTrendIcon = () => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-danger" />;
    return <Activity className="w-4 h-4 text-warning" />;
  };

  const getTrendText = () => {
    if (trend === 'improving') return 'Improving ↗️';
    if (trend === 'declining') return 'Declining ↘️';
    return 'Stable →';
  };

  const getDivergenceText = () => {
    if (vsPrice === 'bullish_divergence') return 'Bullish Divergence';
    if (vsPrice === 'bearish_divergence') return 'Bearish Divergence';
    if (vsPrice === 'aligned') return 'Aligned with Price';
    return 'Neutral Alignment';
  };

  const getWhaleMoodText = () => {
    if (whaleMood === 'accumulating') return 'Accumulating';
    if (whaleMood === 'distributing') return 'Distributing';
    return 'Neutral';
  };

  return (
    <div className="holo-card p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Trend */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            trend === 'improving' ? "bg-success/20" : 
            trend === 'declining' ? "bg-danger/20" : "bg-warning/20"
          )}>
            {getTrendIcon()}
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-display">TREND</div>
            <div className={cn(
              "font-bold",
              trend === 'improving' ? "text-success" : 
              trend === 'declining' ? "text-danger" : "text-warning"
            )}>
              {getTrendText()}
            </div>
          </div>
        </div>

        {/* Vs. Price */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            vsPrice === 'bullish_divergence' ? "bg-success/20" :
            vsPrice === 'bearish_divergence' ? "bg-danger/20" : "bg-muted"
          )}>
            <Target className={cn(
              "w-4 h-4",
              vsPrice === 'bullish_divergence' ? "text-success" :
              vsPrice === 'bearish_divergence' ? "text-danger" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-display">VS. PRICE</div>
            <div className={cn(
              "font-bold text-sm",
              vsPrice === 'bullish_divergence' ? "text-success" :
              vsPrice === 'bearish_divergence' ? "text-danger" : "text-foreground"
            )}>
              {getDivergenceText()}
            </div>
          </div>
        </div>

        {/* Top Sector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-display">TOP SECTOR</div>
            <div className="font-bold text-sm flex items-center gap-1">
              {topSector}
              <span className={cn(
                "text-xs",
                sectorChange >= 0 ? "text-success" : "text-danger"
              )}>
                {sectorChange >= 0 ? '+' : ''}{sectorChange.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Whale Mood */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            whaleMood === 'accumulating' ? "bg-success/20" :
            whaleMood === 'distributing' ? "bg-danger/20" : "bg-muted"
          )}>
            <Waves className={cn(
              "w-4 h-4",
              whaleMood === 'accumulating' ? "text-success" :
              whaleMood === 'distributing' ? "text-danger" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-display">WHALE MOOD</div>
            <div className={cn(
              "font-bold text-sm flex items-center gap-1",
              whaleMood === 'accumulating' ? "text-success" :
              whaleMood === 'distributing' ? "text-danger" : "text-foreground"
            )}>
              {getWhaleMoodText()}
              <span className="text-xs text-muted-foreground">
                ({netflow >= 0 ? '+' : ''}${(netflow / 1e6).toFixed(0)}M)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
