import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Target, Shield, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PredictionCardProps {
  crypto: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change24h: number;
    marketCap: number;
    bias: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    signalStrength?: number;
    indicatorAlignment?: number;
    entryZone?: { low: number; high: number };
    stopLoss?: number;
    takeProfit?: number;
  };
}

export function PredictionCard({ crypto }: PredictionCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  const indicatorAlignment = crypto.indicatorAlignment || Math.floor(30 + Math.random() * 18);
  const signalStrength = crypto.signalStrength || Math.floor(crypto.confidence * 0.9 + Math.random() * 10);

  // Calculate mock trading zones based on price and bias
  const priceMultiplier = crypto.bias === 'bullish' ? 1 : crypto.bias === 'bearish' ? -1 : 0;
  const entryZone = crypto.entryZone || {
    low: crypto.price * (1 - 0.02),
    high: crypto.price * (1 + 0.01)
  };
  const stopLoss = crypto.stopLoss || crypto.price * (1 - 0.05 * (priceMultiplier > 0 ? 1 : -1));
  const takeProfit = crypto.takeProfit || crypto.price * (1 + 0.08 * priceMultiplier);

  return (
    <div className="holo-card p-4 hover:border-primary/50 transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm",
            crypto.bias === 'bullish' ? 'bg-green-500/20 text-green-400' :
            crypto.bias === 'bearish' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
          )}>
            {crypto.symbol.toUpperCase().slice(0, 3)}
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
              {crypto.name}
            </h3>
            <span className="text-xs text-muted-foreground uppercase">
              {crypto.symbol}
            </span>
          </div>
        </div>
        <Badge 
          variant="outline"
          className={cn(
            crypto.bias === 'bullish' ? 'bg-green-600/20 text-green-400 border-green-600/30' : 
            crypto.bias === 'bearish' ? 'bg-red-600/20 text-red-400 border-red-600/30' : 
            'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
          )}
        >
          {crypto.bias === 'bullish' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
           crypto.bias === 'bearish' ? <TrendingDown className="w-3 h-3 mr-1" /> : 
           <Minus className="w-3 h-3 mr-1" />}
          {crypto.confidence}%
        </Badge>
      </div>
      
      {/* Price Row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold font-mono">
          {formatPrice(crypto.price)}
        </span>
        <span className={cn("text-sm font-medium", crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400')}>
          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
        </span>
      </div>

      {/* Signal Strength */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Signal Strength
          </span>
          <span className={signalStrength >= 70 ? 'text-green-400' : signalStrength >= 50 ? 'text-yellow-400' : 'text-orange-400'}>
            {signalStrength}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${signalStrength}%`,
              background: signalStrength >= 70 
                ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                : signalStrength >= 50 
                  ? 'linear-gradient(90deg, #eab308, #facc15)'
                  : 'linear-gradient(90deg, #f97316, #fb923c)'
            }}
          />
        </div>
      </div>

      {/* Indicator Alignment */}
      <div className="flex items-center gap-2 mb-3 text-[10px]">
        <span className="text-muted-foreground">Indicator Sentiment:</span>
        <div className="flex items-center gap-1">
          <span className="text-green-400">{indicatorAlignment} Bullish</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-yellow-400">{Math.floor((50 - indicatorAlignment) * 0.4)} Neutral</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-red-400">{50 - indicatorAlignment - Math.floor((50 - indicatorAlignment) * 0.4)} Bearish</span>
        </div>
      </div>

      {/* Quick Trading Zones Preview */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="p-1.5 rounded bg-green-500/10 border border-green-500/20">
          <div className="text-[9px] text-green-400 mb-0.5">Entry Zone</div>
          <div className="text-[10px] font-mono font-medium">{formatPrice(entryZone.low)}</div>
        </div>
        <div className="p-1.5 rounded bg-red-500/10 border border-red-500/20">
          <div className="text-[9px] text-red-400 mb-0.5">Stop Loss</div>
          <div className="text-[10px] font-mono font-medium">{formatPrice(stopLoss)}</div>
        </div>
        <div className="p-1.5 rounded bg-primary/10 border border-primary/20">
          <div className="text-[9px] text-primary mb-0.5">Take Profit</div>
          <div className="text-[10px] font-mono font-medium">{formatPrice(takeProfit)}</div>
        </div>
      </div>

      {/* Timeframe Links */}
      <div className="flex gap-2 mb-3">
        <Link
          to={`/price-prediction/${crypto.id}/daily`}
          className="flex-1 text-center py-1.5 text-xs bg-muted/50 hover:bg-primary/10 rounded transition-colors"
        >
          Daily
        </Link>
        <Link
          to={`/price-prediction/${crypto.id}/weekly`}
          className="flex-1 text-center py-1.5 text-xs bg-muted/50 hover:bg-primary/10 rounded transition-colors"
        >
          Weekly
        </Link>
        <Link
          to={`/price-prediction/${crypto.id}/monthly`}
          className="flex-1 text-center py-1.5 text-xs bg-muted/50 hover:bg-primary/10 rounded transition-colors"
        >
          Monthly
        </Link>
      </div>

      {/* View Details Link */}
      <Link
        to={`/price-prediction/${crypto.id}`}
        className="flex items-center justify-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1"
      >
        View Full Prediction <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
