import { PredictionData } from "@/hooks/usePricePrediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicalIndicatorsPanelProps {
  data: PredictionData;
}

export function TechnicalIndicatorsPanel({ data }: TechnicalIndicatorsPanelProps) {
  const { technicalIndicators: ti } = data;
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">RSI (14)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{ti.rsi}</span>
              <Badge variant={ti.rsiSignal === 'oversold' ? 'default' : ti.rsiSignal === 'overbought' ? 'destructive' : 'secondary'} className="text-xs">
                {ti.rsiSignal}
              </Badge>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                ti.rsi < 30 ? "bg-green-500" : ti.rsi > 70 ? "bg-red-500" : "bg-yellow-500"
              )}
              style={{ width: `${ti.rsi}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Oversold (30)</span>
            <span>Overbought (70)</span>
          </div>
        </div>
        
        {/* MACD */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">MACD</span>
            <Badge variant={ti.macd.trend === 'bullish' ? 'default' : 'destructive'}>
              {ti.macd.trend === 'bullish' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {ti.macd.trend}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Value</span>
              <p className="font-mono">{ti.macd.value}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Signal</span>
              <p className="font-mono">{ti.macd.signal}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Histogram</span>
              <p className={cn("font-mono", ti.macd.histogram > 0 ? "text-green-500" : "text-red-500")}>
                {ti.macd.histogram}
              </p>
            </div>
          </div>
        </div>
        
        {/* Moving Averages */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Moving Averages</span>
            <Badge variant={ti.movingAverages.trend === 'bullish' ? 'default' : ti.movingAverages.trend === 'bearish' ? 'destructive' : 'secondary'}>
              {ti.movingAverages.trend}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">MA 20</span>
              <p className="font-mono">${ti.movingAverages.ma20.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">MA 50</span>
              <p className="font-mono">${ti.movingAverages.ma50.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">MA 200</span>
              <p className="font-mono">${ti.movingAverages.ma200.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Bollinger Bands */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Bollinger Bands</span>
            <Badge variant="outline" className="text-xs">
              {ti.bollingerBands.position} band
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Upper</span>
              <p className="font-mono text-red-400">${ti.bollingerBands.upper.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Middle</span>
              <p className="font-mono">${ti.bollingerBands.middle.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Lower</span>
              <p className="font-mono text-green-400">${ti.bollingerBands.lower.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Volume Analysis */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Volume</span>
            <Badge variant="outline" className="text-xs">
              {ti.volumeAnalysis.trend}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${ti.volumeAnalysis.strength}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{ti.volumeAnalysis.strength}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PriceTargetsPanelProps {
  data: PredictionData;
  timeframe: string;
}

export function PriceTargetsPanel({ data, timeframe }: PriceTargetsPanelProps) {
  const timeframeText = timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'This Week' : 'This Month';
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Price Targets {timeframeText}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Price */}
        <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm text-muted-foreground">Current Price</span>
          <p className="text-2xl font-bold text-primary">${data.currentPrice.toLocaleString()}</p>
        </div>
        
        {/* Target Ranges */}
        <div className="space-y-3">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-green-400">Conservative</span>
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">Low Risk</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>${data.priceTargets.conservative.low.toLocaleString()}</span>
              <span>—</span>
              <span>${data.priceTargets.conservative.high.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-yellow-400">Moderate</span>
              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">Medium Risk</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>${data.priceTargets.moderate.low.toLocaleString()}</span>
              <span>—</span>
              <span>${data.priceTargets.moderate.high.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-red-400">Aggressive</span>
              <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">High Risk</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>${data.priceTargets.aggressive.low.toLocaleString()}</span>
              <span>—</span>
              <span>${data.priceTargets.aggressive.high.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Support & Resistance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <span className="text-xs text-muted-foreground">Support Levels</span>
            <div className="mt-2 space-y-1">
              {data.supportLevels.map((level, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-mono">${level.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <span className="text-xs text-muted-foreground">Resistance Levels</span>
            <div className="mt-2 space-y-1">
              {data.resistanceLevels.map((level, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-mono">${level.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TradingZonesPanelProps {
  data: PredictionData;
}

export function TradingZonesPanel({ data }: TradingZonesPanelProps) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Trading Zones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entry Zone */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <span className="text-sm font-medium text-blue-400">Entry Zone</span>
          <div className="flex justify-between mt-1 text-lg font-mono">
            <span>${data.tradingZones.entryZone.min.toLocaleString()}</span>
            <span className="text-muted-foreground">—</span>
            <span>${data.tradingZones.entryZone.max.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Stop Loss */}
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="text-sm font-medium text-red-400">Stop Loss</span>
          <p className="text-lg font-mono mt-1">${data.tradingZones.stopLoss.toLocaleString()}</p>
        </div>
        
        {/* Take Profits */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-green-400">Take Profit Levels</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-center">
              <span className="text-xs text-muted-foreground">TP1</span>
              <p className="font-mono text-sm">${data.tradingZones.takeProfit1.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-500/15 border border-green-500/30 rounded text-center">
              <span className="text-xs text-muted-foreground">TP2</span>
              <p className="font-mono text-sm">${data.tradingZones.takeProfit2.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-500/20 border border-green-500/40 rounded text-center">
              <span className="text-xs text-muted-foreground">TP3</span>
              <p className="font-mono text-sm">${data.tradingZones.takeProfit3.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ScenariosPanelProps {
  data: PredictionData;
}

export function ScenariosPanel({ data }: ScenariosPanelProps) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Market Scenarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bull Scenario */}
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-400">Bullish Scenario</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              {data.bullScenario.probability}% probability
            </Badge>
          </div>
          <p className="text-lg font-mono text-green-400 mb-3">
            Target: ${data.bullScenario.target.toLocaleString()}
          </p>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Triggers:</span>
            <ul className="text-sm space-y-1">
              {data.bullScenario.triggers.map((trigger, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-muted-foreground">{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bear Scenario */}
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-400">Bearish Scenario</span>
            </div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
              {data.bearScenario.probability}% probability
            </Badge>
          </div>
          <p className="text-lg font-mono text-red-400 mb-3">
            Target: ${data.bearScenario.target.toLocaleString()}
          </p>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Triggers:</span>
            <ul className="text-sm space-y-1">
              {data.bearScenario.triggers.map((trigger, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-muted-foreground">{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RiskAssessmentPanelProps {
  data: PredictionData;
}

export function RiskAssessmentPanel({ data }: RiskAssessmentPanelProps) {
  const riskColors = {
    low: 'text-green-500 bg-green-500/20 border-green-500/50',
    medium: 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50',
    high: 'text-orange-500 bg-orange-500/20 border-orange-500/50',
    extreme: 'text-red-500 bg-red-500/20 border-red-500/50'
  };
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Risk Level</span>
          <Badge className={riskColors[data.riskLevel]}>
            {data.riskLevel.toUpperCase()}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Volatility Index</span>
            <span className="font-mono">{data.volatilityIndex}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                data.volatilityIndex < 5 ? "bg-green-500" : 
                data.volatilityIndex < 10 ? "bg-yellow-500" : 
                data.volatilityIndex < 20 ? "bg-orange-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(100, data.volatilityIndex * 5)}%` }}
            />
          </div>
        </div>
        
        {/* Key Factors */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Key Factors</span>
          <ul className="space-y-2">
            {data.keyFactors.map((factor, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
