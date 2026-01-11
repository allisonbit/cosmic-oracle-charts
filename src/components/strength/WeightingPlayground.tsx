import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sliders, RotateCcw, Info, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/hooks/useStrengthMeter";

interface WeightingPlaygroundProps {
  assets: StrengthData[];
}

const DEFAULT_WEIGHTS = {
  momentum: 25,
  relative: 20,
  volume: 15,
  sentiment: 10,
  volatility: 10,
  dominance: 10,
  trend: 10,
};

const WEIGHT_INFO = {
  momentum: "Price momentum measures recent price action strength. Higher weight favors assets with strong upward price movement.",
  relative: "Relative performance compares against BTC & ETH. Higher weight favors assets outperforming market leaders.",
  volume: "Volume flow indicates trading activity. Higher weight favors assets with increasing volume.",
  sentiment: "Sentiment score aggregates social & news sentiment. Higher weight favors assets with positive market perception.",
  volatility: "Volatility measures price swings. Higher weight favors lower volatility (stability).",
  dominance: "Dominance change tracks market share movement. Higher weight favors growing market presence.",
  trend: "Trend consistency measures how cleanly price follows its trend. Higher weight favors stable trends.",
};

export function WeightingPlayground({ assets }: WeightingPlaygroundProps) {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  
  const recalculatedAssets = useMemo(() => {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const normalizedWeights = {
      momentum: weights.momentum / totalWeight,
      relative: weights.relative / totalWeight,
      volume: weights.volume / totalWeight,
      sentiment: weights.sentiment / totalWeight,
      volatility: weights.volatility / totalWeight,
      dominance: weights.dominance / totalWeight,
      trend: weights.trend / totalWeight,
    };

    return assets.map(asset => {
      const momentumScore = Math.min(100, Math.max(0, 50 + (asset.priceChange24h || 0) * 2));
      const relativeScore = Math.min(100, Math.max(0, 50 + ((asset.relativeStrengthVsBTC || 0) + (asset.relativeStrengthVsETH || 0)) / 2));
      const volumeScore = Math.min(100, Math.max(0, 50 + (asset.volumeChange || 0)));
      const sentimentScore = asset.sentimentScore || 50;
      const volatilityScore = Math.min(100, Math.max(0, 100 - (asset.volatility || 50)));
      const dominanceScore = Math.min(100, Math.max(0, 50 + (asset.dominanceChange || 0) * 10));
      const trendScore = asset.trendConsistency || 50;

      const newScore = Math.round(
        momentumScore * normalizedWeights.momentum +
        relativeScore * normalizedWeights.relative +
        volumeScore * normalizedWeights.volume +
        sentimentScore * normalizedWeights.sentiment +
        volatilityScore * normalizedWeights.volatility +
        dominanceScore * normalizedWeights.dominance +
        trendScore * normalizedWeights.trend
      );

      return { ...asset, customScore: newScore, originalRank: assets.findIndex(a => a.id === asset.id) + 1 };
    }).sort((a, b) => b.customScore - a.customScore);
  }, [assets, weights]);

  const resetWeights = () => setWeights(DEFAULT_WEIGHTS);

  const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
    setWeights(prev => ({ ...prev, [key]: value[0] }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sliders className="w-5 h-5 text-primary" />
            Interactive Weighting Playground
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={resetWeights} className="gap-1">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Adjust factor weights to see how rankings change in real-time
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weight Sliders */}
          <div className="space-y-4">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        {WEIGHT_INFO[key as keyof typeof WEIGHT_INFO]}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((value / totalWeight) * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(v) => handleWeightChange(key as keyof typeof weights, v)}
                  max={50}
                  min={0}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Recalculated Rankings */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-3">Live Rankings (Top 8)</h4>
            {recalculatedAssets.slice(0, 8).map((asset, idx) => {
              const rankChange = asset.originalRank - (idx + 1);
              return (
                <div key={asset.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    idx < 3 ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                  )}>
                    {idx + 1}
                  </span>
                  <img src={asset.logo} alt={asset.symbol} className="w-5 h-5 rounded-full" />
                  <span className="text-sm font-medium flex-1">{asset.symbol}</span>
                  <span className={cn(
                    "text-sm font-bold",
                    asset.customScore >= 55 ? "text-success" : asset.customScore >= 45 ? "text-warning" : "text-danger"
                  )}>
                    {asset.customScore}
                  </span>
                  {rankChange !== 0 && (
                    <span className={cn(
                      "text-xs flex items-center gap-0.5",
                      rankChange > 0 ? "text-success" : "text-danger"
                    )}>
                      {rankChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(rankChange)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
