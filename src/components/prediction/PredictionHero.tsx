import { PredictionData } from "@/hooks/usePricePrediction";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionHeroProps {
  coinName: string;
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  data: PredictionData;
}

export function PredictionHero({ coinName, symbol, timeframe, data }: PredictionHeroProps) {
  const timeframeText = timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'This Week' : 'This Month';
  const timeframeLower = timeframe === 'daily' ? 'today' : timeframe === 'weekly' ? 'this week' : 'this month';
  
  const biasColors = {
    bullish: 'from-green-500/20 to-green-600/10 border-green-500/30',
    bearish: 'from-red-500/20 to-red-600/10 border-red-500/30',
    neutral: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
  };
  
  const BiasIcon = data.bias === 'bullish' ? TrendingUp : data.bias === 'bearish' ? TrendingDown : Minus;
  
  const lastUpdate = new Date(data.timestamp);
  
  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <Card className={cn(
        "bg-gradient-to-br border-2 backdrop-blur-sm overflow-hidden",
        biasColors[data.bias]
      )}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Coin Info & Bias */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{symbol.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{coinName} Price Prediction {timeframeText}</h1>
                  <p className="text-muted-foreground">{symbol.toUpperCase()} / USD</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge 
                  className={cn(
                    "text-lg px-4 py-1",
                    data.bias === 'bullish' ? 'bg-green-500 hover:bg-green-600' :
                    data.bias === 'bearish' ? 'bg-red-500 hover:bg-red-600' :
                    'bg-yellow-500 hover:bg-yellow-600'
                  )}
                >
                  <BiasIcon className="h-4 w-4 mr-2" />
                  {data.bias.toUpperCase()}
                </Badge>
                
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {data.confidence}% Confidence
                </Badge>
                
                <Badge 
                  variant="outline" 
                  className={cn(
                    "px-3 py-1",
                    data.riskLevel === 'low' ? 'border-green-500 text-green-500' :
                    data.riskLevel === 'medium' ? 'border-yellow-500 text-yellow-500' :
                    data.riskLevel === 'high' ? 'border-orange-500 text-orange-500' :
                    'border-red-500 text-red-500'
                  )}
                >
                  {data.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </div>
            
            {/* Right: Current Price & Probabilities */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-8">
              <div className="text-center sm:text-right">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  ${data.currentPrice.toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-500">{data.probabilityBullish}%</p>
                  <span className="text-xs text-muted-foreground">Bullish</span>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <TrendingDown className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-500">{data.probabilityBearish}%</p>
                  <span className="text-xs text-muted-foreground">Bearish</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Card */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-3">
            {coinName} Prediction Summary {timeframeText}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {data.summary}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdate.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span>Updates {timeframe === 'daily' ? 'every 5 minutes' : timeframe === 'weekly' ? 'every 30 minutes' : 'hourly'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
