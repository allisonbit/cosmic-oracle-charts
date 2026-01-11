import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  GitCompare,
  LineChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/hooks/useStrengthMeter";

interface ExpandableStrengthCardProps {
  data: StrengthData;
  rank: number;
  onCompare?: (id: string) => void;
}

export function ExpandableStrengthCard({ data, rank, onCompare }: ExpandableStrengthCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStrengthLabel = (score: number) => {
    if (score >= 70) return { text: 'Strong', color: 'text-success', bg: 'bg-success' };
    if (score >= 55) return { text: 'Bullish', color: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (score >= 45) return { text: 'Neutral', color: 'text-warning', bg: 'bg-warning' };
    if (score >= 30) return { text: 'Weak', color: 'text-orange-400', bg: 'bg-orange-400' };
    return { text: 'Bearish', color: 'text-danger', bg: 'bg-danger' };
  };

  const strength = getStrengthLabel(data.strengthScore);

  // Calculate individual factor scores
  const factors = [
    { 
      name: 'Momentum', 
      score: Math.min(100, Math.max(0, 50 + (data.priceChange24h || 0) * 2)),
      description: 'Price momentum based on 24h change'
    },
    { 
      name: 'Volume Flow', 
      score: Math.min(100, Math.max(0, 50 + (data.volumeChange || 0))),
      description: 'Trading volume relative to average'
    },
    { 
      name: 'Relative Perf', 
      score: Math.min(100, Math.max(0, 50 + ((data.relativeStrengthVsBTC || 0) + (data.relativeStrengthVsETH || 0)) / 2)),
      description: 'Performance vs BTC & ETH'
    },
    { 
      name: 'Sentiment', 
      score: data.sentimentScore || 50,
      description: 'Social & news sentiment'
    },
    { 
      name: 'Stability', 
      score: Math.min(100, Math.max(0, 100 - (data.volatility || 50))),
      description: 'Lower volatility = higher stability'
    },
    { 
      name: 'Dominance', 
      score: Math.min(100, Math.max(0, 50 + (data.dominanceChange || 0) * 10)),
      description: 'Market share movement'
    },
    { 
      name: 'Trend', 
      score: data.trendConsistency || 50,
      description: 'Trend consistency over time'
    },
  ];

  return (
    <Card className={cn(
      "glass-card transition-all duration-300 group overflow-hidden",
      isOpen ? "border-primary/40 ring-1 ring-primary/20" : "hover:border-primary/30"
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              {/* Rank Badge */}
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                rank <= 3 ? "bg-primary/20 text-primary ring-2 ring-primary/30" : "bg-muted/50 text-muted-foreground"
              )}>
                {rank}
              </div>

              {/* Logo & Name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img 
                  src={data.logo} 
                  alt={data.name}
                  className="w-9 h-9 rounded-full ring-2 ring-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36';
                  }}
                />
                <div className="min-w-0">
                  <h3 className="font-semibold truncate text-base">{data.symbol}</h3>
                  <p className="text-xs text-muted-foreground truncate">{data.name}</p>
                </div>
              </div>

              {/* Strength Score Gauge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-2xl font-bold", strength.color)}>
                      {data.strengthScore}
                    </span>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", strength.color)}>
                    {strength.text}
                  </Badge>
                </div>
                
                {/* Visual Gauge */}
                <div className="w-14 h-14 relative hidden sm:block">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${data.strengthScore}, 100`}
                      className={strength.color}
                    />
                  </svg>
                </div>

                {/* Expand Icon */}
                <div className="text-muted-foreground">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className={cn(data.priceChange24h >= 0 ? "text-success" : "text-danger")}>
                24h: {data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h.toFixed(2)}%
              </span>
              <span className={cn(data.volumeChange >= 0 ? "text-success" : "text-danger")}>
                Vol: {data.volumeChange >= 0 ? '+' : ''}{data.volumeChange.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                Trend: {data.trendConsistency.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 border-t border-border/50">
            {/* Factor Breakdown - Radar-style */}
            <h4 className="text-sm font-semibold mt-4 mb-3">Factor Breakdown</h4>
            <div className="grid grid-cols-2 gap-3">
              {factors.map((factor) => (
                <div key={factor.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{factor.name}</span>
                    <span className={cn(
                      "font-medium",
                      factor.score >= 55 ? "text-success" : factor.score >= 45 ? "text-warning" : "text-danger"
                    )}>
                      {factor.score.toFixed(0)}
                    </span>
                  </div>
                  <Progress 
                    value={factor.score} 
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {onCompare && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onCompare(data.id)}
                  className="gap-1.5 text-xs"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Compare
                </Button>
              )}
              {data.type === 'asset' && (
                <>
                  <Link to={`/price-prediction/${data.id}/daily`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <LineChart className="w-3.5 h-3.5" />
                      Prediction
                    </Button>
                  </Link>
                  <Link to={`/factory?asset=${data.symbol}`}>
                    <Button variant="default" size="sm" className="gap-1.5 text-xs">
                      View Full Report
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </>
              )}
              {data.type === 'chain' && (
                <Link to={`/chain/${data.id}`}>
                  <Button variant="default" size="sm" className="gap-1.5 text-xs">
                    View Chain
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
