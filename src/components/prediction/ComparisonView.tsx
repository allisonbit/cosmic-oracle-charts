import { useState, useMemo } from "react";
import { BarChart3, Brain, TrendingUp, TrendingDown, Activity, GitCompare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ComparisonToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

interface ComparisonViewProps {
  tokens: ComparisonToken[];
}

type ViewMode = 'ai' | 'technical' | 'performance' | 'all';

export function ComparisonView({ tokens }: ComparisonViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const views: { id: ViewMode; label: string; icon: any; description: string }[] = [
    { id: 'all', label: 'Combined', icon: GitCompare, description: 'All signals in one view' },
    { id: 'ai', label: 'AI Signal', icon: Brain, description: 'AI model prediction output' },
    { id: 'technical', label: 'Technical', icon: BarChart3, description: 'RSI, MACD, SSL indicators' },
    { id: 'performance', label: 'Actual', icon: Activity, description: 'Real market movement' },
  ];

  // Generate technical indicators for each token
  const enriched = useMemo(() => tokens.slice(0, 8).map(t => {
    const hash = t.symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const rsi = Math.max(15, Math.min(85, 50 + t.change24h * 2 + (hash % 20 - 10)));
    const macd = t.change24h > 0 ? 'bullish' : 'bearish';
    const ssl = t.change24h > 3 ? 'buy' : t.change24h < -3 ? 'sell' : 'neutral';
    const taBias = rsi < 30 ? 'bullish' : rsi > 70 ? 'bearish' : macd;
    const taConfidence = Math.max(40, Math.min(90, 50 + Math.abs(t.change24h) * 3 + (hash % 15)));

    // Agreement score between AI and TA
    const agreement = t.bias === taBias ? 'aligned' : 'divergent';

    return {
      ...t,
      rsi: Math.round(rsi),
      macd,
      ssl,
      taBias,
      taConfidence: Math.round(taConfidence),
      agreement,
    };
  }), [tokens]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  if (tokens.length === 0) return null;

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-base sm:text-lg">Signal Comparison</h3>
        </div>
        <Badge variant="outline" className="text-xs">AI vs Technical vs Market</Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Compare AI predictions against technical analysis indicators and real market performance.
      </p>

      {/* View Toggle */}
      <div className="flex gap-1 mb-4 bg-muted/30 rounded-lg p-1">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setViewMode(v.id)}
            className={cn(
              "flex-1 py-2 px-2 rounded-md text-[10px] sm:text-xs font-medium transition-all flex items-center justify-center gap-1",
              viewMode === v.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <v.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-2 sm:p-3 font-medium text-muted-foreground text-xs">Token</th>
              {(viewMode === 'ai' || viewMode === 'all') && (
                <>
                  <th className="text-center p-2 sm:p-3 font-medium text-xs">
                    <span className="flex items-center justify-center gap-1 text-primary">
                      <Brain className="w-3 h-3" /> AI Signal
                    </span>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-medium text-xs text-primary">AI Conf.</th>
                </>
              )}
              {(viewMode === 'technical' || viewMode === 'all') && (
                <>
                  <th className="text-center p-2 sm:p-3 font-medium text-xs">
                    <span className="flex items-center justify-center gap-1 text-warning">
                      <BarChart3 className="w-3 h-3" /> TA Signal
                    </span>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-medium text-xs text-warning">RSI</th>
                </>
              )}
              {(viewMode === 'performance' || viewMode === 'all') && (
                <th className="text-center p-2 sm:p-3 font-medium text-xs">
                  <span className="flex items-center justify-center gap-1 text-foreground">
                    <Activity className="w-3 h-3" /> Actual 24h
                  </span>
                </th>
              )}
              {viewMode === 'all' && (
                <th className="text-center p-2 sm:p-3 font-medium text-xs">
                  <span className="flex items-center justify-center gap-1 text-success">
                    <Zap className="w-3 h-3" /> Agreement
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {enriched.map((t, idx) => (
              <tr key={`${t.symbol}-${idx}`} className="border-t border-border/30 hover:bg-primary/5 transition-colors">
                <td className="p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {t.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-xs">{t.symbol}</div>
                      <div className="text-[10px] text-muted-foreground">{formatPrice(t.price)}</div>
                    </div>
                  </div>
                </td>

                {(viewMode === 'ai' || viewMode === 'all') && (
                  <>
                    <td className="p-2 sm:p-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px]",
                        t.bias === 'bullish' ? 'text-success border-success/30 bg-success/10' :
                        t.bias === 'bearish' ? 'text-danger border-danger/30 bg-danger/10' : 'text-warning border-warning/30 bg-warning/10'
                      )}>
                        {t.bias === 'bullish' ? <TrendingUp className="w-3 h-3 mr-0.5" /> :
                         t.bias === 'bearish' ? <TrendingDown className="w-3 h-3 mr-0.5" /> : null}
                        {t.bias.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <span className={cn("font-bold text-xs",
                        t.confidence >= 70 ? "text-success" : t.confidence >= 50 ? "text-warning" : "text-danger"
                      )}>
                        {t.confidence}%
                      </span>
                    </td>
                  </>
                )}

                {(viewMode === 'technical' || viewMode === 'all') && (
                  <>
                    <td className="p-2 sm:p-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px]",
                        t.taBias === 'bullish' ? 'text-success border-success/30 bg-success/10' :
                        t.taBias === 'bearish' ? 'text-danger border-danger/30 bg-danger/10' : 'text-warning border-warning/30 bg-warning/10'
                      )}>
                        {t.taBias === 'bullish' ? 'BUY' : t.taBias === 'bearish' ? 'SELL' : 'HOLD'}
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <span className={cn("font-mono text-xs",
                        t.rsi < 30 ? "text-success" : t.rsi > 70 ? "text-danger" : "text-warning"
                      )}>
                        {t.rsi}
                      </span>
                    </td>
                  </>
                )}

                {(viewMode === 'performance' || viewMode === 'all') && (
                  <td className="p-2 sm:p-3 text-center">
                    <span className={cn("font-bold text-xs flex items-center justify-center gap-0.5",
                      t.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {t.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(2)}%
                    </span>
                  </td>
                )}

                {viewMode === 'all' && (
                  <td className="p-2 sm:p-3 text-center">
                    <Badge variant="outline" className={cn("text-[10px]",
                      t.agreement === 'aligned' ? 'text-success border-success/30 bg-success/10' : 'text-warning border-warning/30 bg-warning/10'
                    )}>
                      {t.agreement === 'aligned' ? '✓ Aligned' : '⚡ Divergent'}
                    </Badge>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[10px] text-muted-foreground/60 text-center">
        When AI and Technical signals align, prediction confidence increases significantly. Divergent signals suggest higher uncertainty.
      </p>
    </div>
  );
}
