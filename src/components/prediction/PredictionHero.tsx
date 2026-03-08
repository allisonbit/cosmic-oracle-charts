import { PredictionData } from "@/hooks/usePricePrediction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, RefreshCw, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenIcon } from "@/components/ui/token-icon";

interface PredictionHeroProps {
  coinName: string;
  coinId?: string;
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  data: PredictionData;
}

export function PredictionHero({ coinName, coinId, symbol, timeframe, data }: PredictionHeroProps) {
  const timeframeText = timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'This Week' : 'This Month';
  const BiasIcon = data.bias === 'bullish' ? TrendingUp : data.bias === 'bearish' ? TrendingDown : Minus;
  const lastUpdate = new Date(data.timestamp);

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className={cn(
        "border-2 overflow-hidden",
        data.bias === 'bullish' ? 'border-success/30 bg-success/[0.03]' :
        data.bias === 'bearish' ? 'border-danger/30 bg-danger/[0.03]' :
        'border-warning/30 bg-warning/[0.03]'
      )}>
        <CardContent className="p-5 md:p-6">
          {/* Top row: token + badges */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <TokenIcon coinId={coinId || coinName.toLowerCase().replace(/\s+/g, '-')} symbol={symbol} size="lg" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold leading-tight">
                    {coinName} Prediction {timeframeText}
                  </h1>
                  <span className="text-sm text-muted-foreground">{symbol.toUpperCase()} / USD</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={cn(
                  "gap-1 font-semibold",
                  data.bias === 'bullish' ? 'bg-success hover:bg-success/90 text-success-foreground' :
                  data.bias === 'bearish' ? 'bg-danger hover:bg-danger/90 text-danger-foreground' :
                  'bg-warning hover:bg-warning/90 text-warning-foreground'
                )}>
                  <BiasIcon className="h-3.5 w-3.5" />
                  {data.bias.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="gap-1 font-mono">
                  <Zap className="w-3 h-3" />
                  {data.confidence}% Confidence
                </Badge>
                <Badge variant="outline" className={cn(
                  "gap-1",
                  data.riskLevel === 'low' ? 'border-success/40 text-success' :
                  data.riskLevel === 'medium' ? 'border-warning/40 text-warning' :
                  data.riskLevel === 'high' ? 'border-danger/40 text-danger' :
                  'border-danger/60 text-danger'
                )}>
                  <Shield className="w-3 h-3" />
                  {data.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </div>

            {/* Price + Probabilities */}
            <div className="flex items-start gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-0.5">Current Price</div>
                <div className="text-2xl md:text-3xl font-bold font-mono text-primary">
                  ${data.currentPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Probability bars */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-success/10 border border-success/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-success" /> Bull Probability
                </span>
                <span className="text-lg font-bold font-mono text-success">{data.probabilityBullish}%</span>
              </div>
              <div className="h-1.5 bg-success/20 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full transition-all" style={{ width: `${data.probabilityBullish}%` }} />
              </div>
            </div>
            <div className="rounded-lg bg-danger/10 border border-danger/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-danger" /> Bear Probability
                </span>
                <span className="text-lg font-bold font-mono text-danger">{data.probabilityBearish}%</span>
              </div>
              <div className="h-1.5 bg-danger/20 rounded-full overflow-hidden">
                <div className="h-full bg-danger rounded-full transition-all" style={{ width: `${data.probabilityBearish}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-2">{coinName} Analysis Summary</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Auto-refreshes {timeframe === 'daily' ? 'every 5 min' : timeframe === 'weekly' ? 'every 30 min' : 'hourly'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
