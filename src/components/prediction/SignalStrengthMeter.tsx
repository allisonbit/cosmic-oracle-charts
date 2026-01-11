import { Zap, TrendingUp, TrendingDown, Activity, Target, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HighConvictionSignal {
  id: string;
  name: string;
  symbol: string;
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  signalStrength: number;
  price: number;
  change24h: number;
  indicatorAlignment: number;
}

interface SignalStrengthMeterProps {
  signals: HighConvictionSignal[];
}

export function SignalStrengthMeter({ signals }: SignalStrengthMeterProps) {
  // Sort by signal strength (composite of confidence + alignment)
  const topSignals = signals
    .sort((a, b) => b.signalStrength - a.signalStrength)
    .slice(0, 5);

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getStrengthBg = (strength: number) => {
    if (strength >= 80) return 'bg-green-500/20';
    if (strength >= 60) return 'bg-yellow-500/20';
    return 'bg-orange-500/20';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  return (
    <div className="holo-card p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold">High Conviction Signals</h3>
        </div>
        <Badge variant="outline" className="text-xs text-primary border-primary/30">
          Top 5 Today
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Strongest AI signals based on confidence, indicator alignment, and momentum
      </p>

      <div className="space-y-3">
        {topSignals.map((signal, index) => (
          <Link
            key={signal.id}
            to={`/price-prediction/${signal.id}/daily`}
            className="block"
          >
            <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-xs",
                      signal.bias === 'bullish' ? 'bg-green-500/20 text-green-400' :
                      signal.bias === 'bearish' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {signal.symbol.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      #{index + 1}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{signal.name}</div>
                    <div className="text-xs text-muted-foreground uppercase">{signal.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm">{formatPrice(signal.price)}</div>
                  <div className={cn("text-xs", signal.change24h >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {signal.change24h >= 0 ? '+' : ''}{signal.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Signal Strength Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Signal Strength</span>
                  <span className={getStrengthColor(signal.signalStrength)}>{signal.signalStrength}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", getStrengthBg(signal.signalStrength))}
                    style={{ 
                      width: `${signal.signalStrength}%`,
                      background: signal.signalStrength >= 80 
                        ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                        : signal.signalStrength >= 60 
                          ? 'linear-gradient(90deg, #eab308, #facc15)'
                          : 'linear-gradient(90deg, #f97316, #fb923c)'
                    }}
                  />
                </div>
              </div>

              {/* Metrics Row */}
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{signal.confidence}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Indicators:</span>
                  <span className="font-medium">{signal.indicatorAlignment}/50</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] py-0 h-5",
                    signal.bias === 'bullish' ? 'border-green-500/50 text-green-400' :
                    signal.bias === 'bearish' ? 'border-red-500/50 text-red-400' : 'border-yellow-500/50 text-yellow-400'
                  )}
                >
                  {signal.bias === 'bullish' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {signal.bias === 'bearish' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {signal.bias.toUpperCase()}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {topSignals.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Loading high conviction signals...</p>
        </div>
      )}
    </div>
  );
}
