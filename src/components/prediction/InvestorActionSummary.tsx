import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  Target, Shield, Clock, ChevronRight, Activity
} from "lucide-react";

interface InvestorActionSummaryProps {
  coinName: string;
  symbol: string;
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  currentPrice: number;
  entryZone?: { min: number; max: number };
  stopLoss?: number;
  takeProfit?: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
}

export function InvestorActionSummary({
  coinName,
  symbol,
  bias,
  confidence,
  riskLevel,
  currentPrice,
  entryZone,
  stopLoss,
  takeProfit,
  timeframe
}: InvestorActionSummaryProps) {
  // Determine investor action based on bias and confidence
  const getInvestorAction = () => {
    if (bias === 'bullish') {
      if (confidence >= 75) return { action: 'Strong Buy Signal', color: 'text-green-400', bgColor: 'bg-green-600/20' };
      if (confidence >= 60) return { action: 'Consider Buying', color: 'text-green-300', bgColor: 'bg-green-600/10' };
      return { action: 'Watch for Entry', color: 'text-green-200', bgColor: 'bg-green-600/5' };
    }
    if (bias === 'bearish') {
      if (confidence >= 75) return { action: 'Strong Sell Signal', color: 'text-red-400', bgColor: 'bg-red-600/20' };
      if (confidence >= 60) return { action: 'Consider Selling', color: 'text-red-300', bgColor: 'bg-red-600/10' };
      return { action: 'Proceed with Caution', color: 'text-red-200', bgColor: 'bg-red-600/5' };
    }
    return { action: 'Hold / Wait', color: 'text-muted-foreground', bgColor: 'bg-muted/50' };
  };

  const investorAction = getInvestorAction();

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  const timeframeLabel = timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'This Week' : 'This Month';

  return (
    <Card className="bg-gradient-to-br from-card/80 to-card/50 border-primary/20 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Investor Action Summary
          </CardTitle>
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Clock className="w-3 h-3 mr-1" />
            {timeframeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Action */}
        <div className={`p-4 rounded-xl ${investorAction.bgColor} border border-primary/10`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">AI Recommendation</span>
            <Badge className={`${bias === 'bullish' ? 'bg-green-600/20 text-green-400' : bias === 'bearish' ? 'bg-red-600/20 text-red-400' : 'bg-muted'}`}>
              {confidence}% Confidence
            </Badge>
          </div>
          <div className={`text-2xl font-display font-bold ${investorAction.color} flex items-center gap-2`}>
            {bias === 'bullish' ? <TrendingUp className="w-6 h-6" /> : 
             bias === 'bearish' ? <TrendingDown className="w-6 h-6" /> : 
             <Minus className="w-6 h-6" />}
            {investorAction.action}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {coinName} ({symbol.toUpperCase()}) technical analysis, market sentiment, and AI prediction models.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">Current Price</div>
            <div className="font-mono font-bold">{formatPrice(currentPrice)}</div>
          </div>
          {entryZone && (
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Target className="w-3 h-3" /> Entry Zone
              </div>
              <div className="font-mono font-bold text-sm">
                {formatPrice(entryZone.min)} - {formatPrice(entryZone.max)}
              </div>
            </div>
          )}
          {stopLoss && (
            <div className="p-3 rounded-lg bg-red-600/10 text-center">
              <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Stop Loss
              </div>
              <div className="font-mono font-bold text-red-400">{formatPrice(stopLoss)}</div>
            </div>
          )}
          {takeProfit && (
            <div className="p-3 rounded-lg bg-green-600/10 text-center">
              <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" /> Take Profit
              </div>
              <div className="font-mono font-bold text-green-400">{formatPrice(takeProfit)}</div>
            </div>
          )}
        </div>

        {/* Risk Warning */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
          <AlertTriangle className={`w-5 h-5 ${getRiskColor()} flex-shrink-0 mt-0.5`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">Risk Level:</span>
              <span className={`text-sm font-bold uppercase ${getRiskColor()}`}>{riskLevel}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cryptocurrency investments carry significant risk. This is not financial advice. 
              Always conduct your own research and consider your risk tolerance before investing.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/price-prediction/${symbol.toLowerCase()}/${timeframe}`}
            className="flex items-center gap-1 text-sm px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
          >
            Full {coinName} Analysis <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to={`/strength?coin=${symbol.toLowerCase()}`}
            className="flex items-center gap-1 text-sm px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            {symbol} Strength Score
          </Link>
          <Link
            to="/market/best-crypto-to-buy-today"
            className="flex items-center gap-1 text-sm px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Best Crypto Today
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
