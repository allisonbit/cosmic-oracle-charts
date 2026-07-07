import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  Target, Shield, Clock, ChevronRight, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const getInvestorAction = () => {
    if (bias === 'bullish') {
      if (confidence >= 75) return { action: 'Strong Buy Signal', color: 'text-green-400', accent: 'border-green-500' };
      if (confidence >= 60) return { action: 'Consider Buying', color: 'text-green-300', accent: 'border-green-500/70' };
      return { action: 'Watch for Entry', color: 'text-green-200', accent: 'border-green-500/40' };
    }
    if (bias === 'bearish') {
      if (confidence >= 75) return { action: 'Strong Sell Signal', color: 'text-red-400', accent: 'border-red-500' };
      if (confidence >= 60) return { action: 'Consider Selling', color: 'text-red-300', accent: 'border-red-500/70' };
      return { action: 'Proceed with Caution', color: 'text-red-200', accent: 'border-red-500/40' };
    }
    return { action: 'Hold / Wait', color: 'text-muted-foreground', accent: 'border-border' };
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
    if (price >= 1000) return `$${(price ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${(price ?? 0).toFixed(2)}`;
    return `$${(price ?? 0).toPrecision(4)}`;
  };

  const timeframeLabel = timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'This Week' : 'This Month';

  return (
    <section className="border-t border-border/30 pt-5">
      <div className="section-header mb-4">
        <span className="section-label flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Investor Action Summary
        </span>
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Clock className="w-3 h-3 mr-1" />
          {timeframeLabel}
        </Badge>
      </div>

      {/* Main Action — colored left accent */}
      <div className={cn("border-l-4 pl-4 mb-6", investorAction.accent)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">AI Recommendation</span>
          <Badge className={cn(bias === 'bullish' ? 'bg-green-600/20 text-green-400' : bias === 'bearish' ? 'bg-red-600/20 text-red-400' : 'bg-muted')}>
            {confidence}% Confidence
          </Badge>
        </div>
        <div className={cn("text-2xl font-display font-bold flex items-center gap-2", investorAction.color)}>
          {bias === 'bullish' ? <TrendingUp className="w-6 h-6" /> :
           bias === 'bearish' ? <TrendingDown className="w-6 h-6" /> :
           <Minus className="w-6 h-6" />}
          {investorAction.action}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Based on {coinName} ({symbol.toUpperCase()}) technical analysis, market sentiment, and AI prediction models.
        </p>
      </div>

      {/* Key Metrics — inline strip with dividers */}
      <div className="flex flex-wrap gap-y-4 border-y border-border/20 py-4 mb-6">
        <div className="pr-6 min-w-[8rem]">
          <div className="section-label mb-1">Current Price</div>
          <div className="font-mono font-bold">{formatPrice(currentPrice)}</div>
        </div>
        {entryZone && (
          <div className="px-6 min-w-[8rem] border-l border-border/20">
            <div className="section-label mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Entry Zone</div>
            <div className="font-mono font-bold text-sm">{formatPrice(entryZone.min)} – {formatPrice(entryZone.max)}</div>
          </div>
        )}
        {stopLoss && (
          <div className="px-6 min-w-[8rem] border-l border-border/20">
            <div className="section-label mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Stop Loss</div>
            <div className="font-mono font-bold text-red-400">{formatPrice(stopLoss)}</div>
          </div>
        )}
        {takeProfit && (
          <div className="px-6 min-w-[8rem] border-l border-border/20">
            <div className="section-label mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Take Profit</div>
            <div className="font-mono font-bold text-green-400">{formatPrice(takeProfit)}</div>
          </div>
        )}
      </div>

      {/* Risk Warning */}
      <div className="flex items-start gap-3 mb-5">
        <AlertTriangle className={cn("w-5 h-5 flex-shrink-0 mt-0.5", getRiskColor())} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">Risk Level:</span>
            <span className={cn("text-sm font-bold uppercase", getRiskColor())}>{riskLevel}</span>
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
          className="flex items-center gap-1 text-sm px-4 py-2 bg-primary/20 hover:bg-primary/30 transition-colors"
        >
          Full {coinName} Analysis <ChevronRight className="w-4 h-4" />
        </Link>
        <Link
          to={`/strength?coin=${symbol.toLowerCase()}`}
          className="flex items-center gap-1 text-sm px-4 py-2 bg-muted hover:bg-muted/80 transition-colors"
        >
          {symbol} Strength Score
        </Link>
      </div>
    </section>
  );
}
