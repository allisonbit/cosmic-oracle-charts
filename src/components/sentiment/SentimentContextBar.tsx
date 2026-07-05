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
    <div className="border-y border-border/30 py-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x md:divide-border/30">
        {/* Trend */}
        <div className="flex items-center gap-3 md:px-4 md:first:pl-0">
          {getTrendIcon()}
          <div>
            <div className="section-label">Trend</div>
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
        <div className="flex items-center gap-3 md:px-4">
          <Target className={cn(
            "w-4 h-4 flex-shrink-0",
            vsPrice === 'bullish_divergence' ? "text-success" :
            vsPrice === 'bearish_divergence' ? "text-danger" : "text-muted-foreground"
          )} />
          <div>
            <div className="section-label">Vs. Price</div>
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
        <div className="flex items-center gap-3 md:px-4">
          <Cpu className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <div className="section-label">Top Sector</div>
            <div className="font-bold text-sm flex items-center gap-1">
              {topSector}
              <span className={cn(
                "text-xs",
                sectorChange >= 0 ? "text-success" : "text-danger"
              )}>
                {sectorChange >= 0 ? '+' : ''}{(sectorChange ?? 0).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Whale Mood */}
        <div className="flex items-center gap-3 md:px-4">
          <Waves className={cn(
            "w-4 h-4 flex-shrink-0",
            whaleMood === 'accumulating' ? "text-success" :
            whaleMood === 'distributing' ? "text-danger" : "text-muted-foreground"
          )} />
          <div>
            <div className="section-label">Whale Mood</div>
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
