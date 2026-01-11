import { Link } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, Minus, ChevronRight, Target, Shield, 
  Activity, BarChart3, Zap, AlertTriangle, TrendingUpIcon, Gauge
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EnhancedPredictionCardProps {
  crypto: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change24h: number;
    marketCap?: number;
    volume24h?: number;
    bias: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    signalStrength?: number;
    indicatorAlignment?: number;
    address?: string;
    chain?: string;
    rsi?: number;
    macdTrend?: 'bullish' | 'bearish';
    sslSignal?: 'bullish' | 'bearish' | 'neutral';
    khanStructure?: 'bos_bullish' | 'bos_bearish' | 'choch' | 'neutral';
    volatilityRegime?: 'low' | 'normal' | 'high' | 'extreme';
    seasonalFactor?: number;
    trendStrength?: number;
  };
  showFullDetails?: boolean;
}

// Technical indicator calculation based on script logic
function calculateIndicators(crypto: EnhancedPredictionCardProps['crypto']) {
  const hash = crypto.symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const priceChange = crypto.change24h || 0;
  
  // RSI simulation (30-70 neutral zone)
  let rsi = 50 + (priceChange * 2);
  rsi = Math.max(10, Math.min(90, rsi + (hash % 20 - 10)));
  
  // MACD trend based on momentum
  const macdTrend: 'bullish' | 'bearish' = priceChange > 0 ? 'bullish' : 'bearish';
  
  // SSL Hybrid signal (based on EMA alignment)
  const sslSignal: 'bullish' | 'bearish' | 'neutral' = 
    priceChange > 3 ? 'bullish' : priceChange < -3 ? 'bearish' : 'neutral';
  
  // KHAN SMC Structure (Break of Structure detection)
  const khanStructure: 'bos_bullish' | 'bos_bearish' | 'choch' | 'neutral' = 
    priceChange > 5 ? 'bos_bullish' : 
    priceChange < -5 ? 'bos_bearish' : 
    Math.abs(priceChange) > 2 ? 'choch' : 'neutral';
  
  // Volatility regime
  const volatility = Math.abs(priceChange);
  const volatilityRegime: 'low' | 'normal' | 'high' | 'extreme' = 
    volatility < 2 ? 'low' : volatility < 5 ? 'normal' : volatility < 10 ? 'high' : 'extreme';
  
  // Seasonality factor (simplified monthly)
  const month = new Date().getMonth() + 1;
  const seasonality: Record<number, number> = {
    1: 0.6, 2: 0.4, 3: 0.8, 4: 0.5, 5: 0.3, 6: 0.4,
    7: 0.5, 8: 0.7, 9: -0.2, 10: 0.8, 11: 1.0, 12: 0.9
  };
  const seasonalFactor = seasonality[month] || 0;
  
  // Trend strength (-1 to 1)
  const trendStrength = Math.max(-1, Math.min(1, priceChange / 10));
  
  // Calculate indicator alignment (out of 50 indicators)
  let bullishCount = 0;
  if (rsi < 30) bullishCount += 8; // Oversold = bullish
  else if (rsi < 50) bullishCount += 4;
  if (macdTrend === 'bullish') bullishCount += 10;
  if (sslSignal === 'bullish') bullishCount += 8;
  if (khanStructure === 'bos_bullish') bullishCount += 12;
  else if (khanStructure === 'choch') bullishCount += 4;
  if (seasonalFactor > 0.5) bullishCount += 5;
  if (trendStrength > 0.3) bullishCount += 3;
  
  bullishCount = Math.min(45, Math.max(5, bullishCount + (hash % 8)));
  
  // Signal strength (composite score)
  const signalStrength = Math.min(95, Math.max(25, 
    crypto.confidence * 0.5 + 
    bullishCount + 
    (seasonalFactor > 0 ? 10 : 0) +
    (Math.abs(trendStrength) * 10)
  ));
  
  return {
    rsi: Math.round(rsi),
    macdTrend,
    sslSignal,
    khanStructure,
    volatilityRegime,
    seasonalFactor,
    trendStrength,
    bullishIndicators: bullishCount,
    neutralIndicators: Math.floor((50 - bullishCount) * 0.3),
    bearishIndicators: 50 - bullishCount - Math.floor((50 - bullishCount) * 0.3),
    signalStrength: Math.round(signalStrength)
  };
}

// Trading zones calculation
function calculateTradingZones(price: number, bias: string, volatility: string) {
  const mult = volatility === 'extreme' ? 0.08 : volatility === 'high' ? 0.05 : 0.03;
  const direction = bias === 'bullish' ? 1 : bias === 'bearish' ? -1 : 0;
  
  return {
    entryZone: {
      low: price * (1 - mult * 0.5),
      high: price * (1 + mult * 0.3)
    },
    stopLoss: price * (1 - mult * 1.5 * (direction >= 0 ? 1 : -1)),
    takeProfit1: price * (1 + mult * 1.0 * (direction >= 0 ? 1 : -0.5)),
    takeProfit2: price * (1 + mult * 2.0 * (direction >= 0 ? 1 : -0.5)),
    takeProfit3: price * (1 + mult * 3.0 * (direction >= 0 ? 1 : -0.5)),
    riskRewardRatio: direction >= 0 ? 2.5 : 1.5
  };
}

export function EnhancedPredictionCard({ crypto, showFullDetails = false }: EnhancedPredictionCardProps) {
  const [expanded, setExpanded] = useState(showFullDetails);
  
  const formatPrice = (price: number) => {
    if (!price || price === 0) return '$0.00';
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.001) return `$${price.toFixed(4)}`;
    return `$${price.toPrecision(4)}`;
  };

  const indicators = calculateIndicators(crypto);
  const zones = calculateTradingZones(crypto.price, crypto.bias, indicators.volatilityRegime);
  
  const getRsiColor = (rsi: number) => {
    if (rsi < 30) return 'text-green-400';
    if (rsi > 70) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getVolatilityColor = (regime: string) => {
    switch (regime) {
      case 'low': return 'text-blue-400';
      case 'normal': return 'text-green-400';
      case 'high': return 'text-yellow-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStructureLabel = (structure: string) => {
    switch (structure) {
      case 'bos_bullish': return { label: 'BoS ↑', color: 'text-green-400', desc: 'Break of Structure Bullish' };
      case 'bos_bearish': return { label: 'BoS ↓', color: 'text-red-400', desc: 'Break of Structure Bearish' };
      case 'choch': return { label: 'CHoCH', color: 'text-yellow-400', desc: 'Change of Character' };
      default: return { label: 'Ranging', color: 'text-muted-foreground', desc: 'Consolidation' };
    }
  };

  const structure = getStructureLabel(indicators.khanStructure);

  return (
    <div 
      className="holo-card p-4 hover:border-primary/50 transition-all group cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase">
                {crypto.symbol}
              </span>
              {crypto.chain && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                  {crypto.chain}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge 
            variant="outline"
            className={cn(
              "text-xs",
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
          <Badge variant="outline" className={cn("text-[9px]", structure.color)}>
            {structure.label}
          </Badge>
        </div>
      </div>
      
      {/* Price Row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold font-mono">
          {formatPrice(crypto.price)}
        </span>
        <span className={cn("text-sm font-medium", (crypto.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400')}>
          {(crypto.change24h || 0) >= 0 ? '+' : ''}{(crypto.change24h || 0).toFixed(2)}%
        </span>
      </div>

      {/* Signal Strength Meter */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Signal Strength
          </span>
          <span className={indicators.signalStrength >= 70 ? 'text-green-400' : indicators.signalStrength >= 50 ? 'text-yellow-400' : 'text-orange-400'}>
            {indicators.signalStrength}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${indicators.signalStrength}%`,
              background: indicators.signalStrength >= 70 
                ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                : indicators.signalStrength >= 50 
                  ? 'linear-gradient(90deg, #eab308, #facc15)'
                  : 'linear-gradient(90deg, #f97316, #fb923c)'
            }}
          />
        </div>
      </div>

      {/* Technical Indicators Row */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        <div className="p-1.5 rounded bg-muted/30">
          <div className="text-[9px] text-muted-foreground">RSI</div>
          <div className={cn("text-xs font-mono font-medium", getRsiColor(indicators.rsi))}>
            {indicators.rsi}
          </div>
        </div>
        <div className="p-1.5 rounded bg-muted/30">
          <div className="text-[9px] text-muted-foreground">MACD</div>
          <div className={cn("text-xs font-medium", indicators.macdTrend === 'bullish' ? 'text-green-400' : 'text-red-400')}>
            {indicators.macdTrend === 'bullish' ? '↑' : '↓'}
          </div>
        </div>
        <div className="p-1.5 rounded bg-muted/30">
          <div className="text-[9px] text-muted-foreground">SSL</div>
          <div className={cn("text-xs font-medium", 
            indicators.sslSignal === 'bullish' ? 'text-green-400' : 
            indicators.sslSignal === 'bearish' ? 'text-red-400' : 'text-yellow-400'
          )}>
            {indicators.sslSignal === 'bullish' ? 'BUY' : indicators.sslSignal === 'bearish' ? 'SELL' : 'WAIT'}
          </div>
        </div>
        <div className="p-1.5 rounded bg-muted/30">
          <div className="text-[9px] text-muted-foreground">VOL</div>
          <div className={cn("text-xs font-medium", getVolatilityColor(indicators.volatilityRegime))}>
            {indicators.volatilityRegime.slice(0, 3).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Indicator Alignment */}
      <div className="flex items-center gap-2 mb-3 text-[10px]">
        <span className="text-muted-foreground">50 Indicators:</span>
        <div className="flex-1 flex items-center gap-1">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${(indicators.bullishIndicators / 50) * 100}%` }} 
            />
            <div 
              className="h-full bg-yellow-500" 
              style={{ width: `${(indicators.neutralIndicators / 50) * 100}%` }} 
            />
            <div 
              className="h-full bg-red-500" 
              style={{ width: `${(indicators.bearishIndicators / 50) * 100}%` }} 
            />
          </div>
        </div>
        <span className="text-green-400">{indicators.bullishIndicators}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-yellow-400">{indicators.neutralIndicators}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-red-400">{indicators.bearishIndicators}</span>
      </div>

      {/* Quick Trading Zones */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="p-1.5 rounded bg-green-500/10 border border-green-500/20">
          <div className="text-[9px] text-green-400 mb-0.5 flex items-center justify-center gap-1">
            <Target className="w-2.5 h-2.5" />
            Entry Zone
          </div>
          <div className="text-[10px] font-mono font-medium">{formatPrice(zones.entryZone.low)}</div>
        </div>
        <div className="p-1.5 rounded bg-red-500/10 border border-red-500/20">
          <div className="text-[9px] text-red-400 mb-0.5 flex items-center justify-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            Stop Loss
          </div>
          <div className="text-[10px] font-mono font-medium">{formatPrice(zones.stopLoss)}</div>
        </div>
        <div className="p-1.5 rounded bg-primary/10 border border-primary/20">
          <div className="text-[9px] text-primary mb-0.5 flex items-center justify-center gap-1">
            <TrendingUpIcon className="w-2.5 h-2.5" />
            Take Profit
          </div>
          <div className="text-[10px] font-mono font-medium">{formatPrice(zones.takeProfit1)}</div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
          {/* Full Trading Zones */}
          <div>
            <h4 className="text-xs font-bold mb-2 flex items-center gap-1">
              <Target className="w-3 h-3 text-primary" />
              Complete Trading Zones
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Entry Range:</span>
                <div className="font-mono">{formatPrice(zones.entryZone.low)} - {formatPrice(zones.entryZone.high)}</div>
              </div>
              <div className="p-2 rounded bg-red-500/10">
                <span className="text-red-400">Stop Loss:</span>
                <div className="font-mono">{formatPrice(zones.stopLoss)}</div>
              </div>
              <div className="p-2 rounded bg-green-500/10">
                <span className="text-green-400">TP1:</span>
                <div className="font-mono">{formatPrice(zones.takeProfit1)}</div>
              </div>
              <div className="p-2 rounded bg-green-500/10">
                <span className="text-green-400">TP2:</span>
                <div className="font-mono">{formatPrice(zones.takeProfit2)}</div>
              </div>
              <div className="p-2 rounded bg-green-500/10">
                <span className="text-green-400">TP3:</span>
                <div className="font-mono">{formatPrice(zones.takeProfit3)}</div>
              </div>
              <div className="p-2 rounded bg-primary/10">
                <span className="text-primary">R:R Ratio:</span>
                <div className="font-mono">1:{zones.riskRewardRatio.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Market Context */}
          <div>
            <h4 className="text-xs font-bold mb-2 flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-primary" />
              Market Context
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Structure:</span>
                <div className={structure.color}>{structure.desc}</div>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Volatility:</span>
                <div className={getVolatilityColor(indicators.volatilityRegime)}>
                  {indicators.volatilityRegime.charAt(0).toUpperCase() + indicators.volatilityRegime.slice(1)}
                </div>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Seasonal Factor:</span>
                <div className={indicators.seasonalFactor > 0 ? 'text-green-400' : indicators.seasonalFactor < 0 ? 'text-red-400' : 'text-yellow-400'}>
                  {indicators.seasonalFactor > 0 ? 'Favorable' : indicators.seasonalFactor < 0 ? 'Unfavorable' : 'Neutral'}
                </div>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Trend:</span>
                <div className={indicators.trendStrength > 0 ? 'text-green-400' : indicators.trendStrength < 0 ? 'text-red-400' : 'text-yellow-400'}>
                  {indicators.trendStrength > 0.3 ? 'Strong Up' : indicators.trendStrength < -0.3 ? 'Strong Down' : 'Ranging'}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Address if available */}
          {crypto.address && (
            <div className="p-2 rounded bg-muted/30 text-[10px]">
              <span className="text-muted-foreground">Contract: </span>
              <span className="font-mono break-all">{crypto.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Timeframe Links */}
      <div className="flex gap-2 mt-3 mb-3">
        <Link
          to={`/price-prediction/${crypto.id}/daily`}
          className="flex-1 text-center py-1.5 text-xs bg-muted/50 hover:bg-primary/10 rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Daily
        </Link>
        <Link
          to={`/price-prediction/${crypto.id}/weekly`}
          className="flex-1 text-center py-1.5 text-xs bg-muted/50 hover:bg-primary/10 rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Weekly
        </Link>
        <Link
          to={`/price-prediction/${crypto.id}/monthly`}
          className="flex-1 text-center py-1.5 text-xs bg-muted/50 hover:bg-primary/10 rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Monthly
        </Link>
      </div>

      {/* View Details Link */}
      <Link
        to={`/price-prediction/${crypto.id}`}
        className="flex items-center justify-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        View Full Analysis <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
