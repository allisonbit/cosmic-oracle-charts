import { useState } from "react";
import { TrendingUp, TrendingDown, Target, AlertTriangle, ChevronRight, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DivergenceSignal {
  symbol: string;
  name: string;
  price: number;
  priceChange: number;
  sentimentScore: number;
  sentimentChange: number;
  divergenceType: 'bullish' | 'bearish';
  strength: number;
  timeframe: string;
  description: string;
}

interface DivergenceScannerProps {
  coins: Array<{ symbol: string; name: string; price: number; change24h: number; volume: number; marketCap: number }>;
}

export function DivergenceScanner({ coins }: DivergenceScannerProps) {
  const [selectedDivergence, setSelectedDivergence] = useState<DivergenceSignal | null>(null);

  // Generate divergence signals based on price and simulated sentiment
  const divergences: DivergenceSignal[] = coins.slice(0, 15).map(coin => {
    // Simulate sentiment data
    const sentimentScore = 30 + Math.random() * 60;
    const sentimentChange = (Math.random() - 0.5) * 30;
    
    // Detect divergence
    const priceTrend = coin.change24h;
    const sentimentTrend = sentimentChange;
    
    let divergenceType: 'bullish' | 'bearish' = 'bullish';
    let strength = 0;
    let description = '';
    
    // Bullish divergence: Price dropping but sentiment rising
    if (priceTrend < -2 && sentimentTrend > 5) {
      divergenceType = 'bullish';
      strength = Math.min(100, Math.abs(priceTrend - sentimentTrend) * 3);
      description = `${coin.symbol} price is declining (${priceTrend.toFixed(1)}%) while social sentiment is improving (+${sentimentTrend.toFixed(1)}%). This bullish divergence suggests potential reversal.`;
    }
    // Bearish divergence: Price rising but sentiment dropping
    else if (priceTrend > 2 && sentimentTrend < -5) {
      divergenceType = 'bearish';
      strength = Math.min(100, Math.abs(priceTrend - sentimentTrend) * 3);
      description = `${coin.symbol} price is rising (+${priceTrend.toFixed(1)}%) but social sentiment is declining (${sentimentTrend.toFixed(1)}%). This bearish divergence signals potential weakness.`;
    }
    // Strong bullish: Price very low, sentiment high
    else if (priceTrend < -5 && sentimentScore > 60) {
      divergenceType = 'bullish';
      strength = Math.min(100, (sentimentScore - 50) + Math.abs(priceTrend));
      description = `Extreme oversold condition. ${coin.symbol} has dropped ${Math.abs(priceTrend).toFixed(1)}% but maintains strong sentiment (${sentimentScore.toFixed(0)}).`;
    }
    else {
      // Minor divergence
      strength = Math.random() * 40;
      divergenceType = priceTrend < sentimentTrend ? 'bullish' : 'bearish';
      description = `Minor ${divergenceType} divergence detected between price action and sentiment indicators.`;
    }
    
    return {
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
      priceChange: priceTrend,
      sentimentScore,
      sentimentChange,
      divergenceType,
      strength,
      timeframe: '24h',
      description
    };
  }).filter(d => d.strength > 30).sort((a, b) => b.strength - a.strength).slice(0, 6);

  const bullishCount = divergences.filter(d => d.divergenceType === 'bullish').length;
  const bearishCount = divergences.filter(d => d.divergenceType === 'bearish').length;

  return (
    <>
      <div className="holo-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            DIVERGENCE SCANNER
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-success">
              <TrendingUp className="w-3 h-3" /> {bullishCount} Bullish
            </span>
            <span className="flex items-center gap-1 text-danger">
              <TrendingDown className="w-3 h-3" /> {bearishCount} Bearish
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Detects when price and sentiment diverge — contrarian trading opportunities
        </div>

        <div className="space-y-2">
          {divergences.map((div, i) => (
            <button
              key={div.symbol}
              onClick={() => setSelectedDivergence(div)}
              className={cn(
                "w-full p-3 rounded-lg border flex items-center justify-between transition-all text-left group",
                div.divergenceType === 'bullish' 
                  ? "bg-success/10 border-success/30 hover:border-success/50" 
                  : "bg-danger/10 border-danger/30 hover:border-danger/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  div.divergenceType === 'bullish' ? "bg-success/20" : "bg-danger/20"
                )}>
                  {div.divergenceType === 'bullish' 
                    ? <TrendingUp className="w-5 h-5 text-success" />
                    : <TrendingDown className="w-5 h-5 text-danger" />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold">{div.symbol}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-bold uppercase",
                      div.divergenceType === 'bullish' ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                    )}>
                      {div.divergenceType}
                    </span>
                    {div.strength > 70 && <Zap className="w-3 h-3 text-warning" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Price: <span className={div.priceChange >= 0 ? "text-success" : "text-danger"}>
                      {div.priceChange >= 0 ? '+' : ''}{div.priceChange.toFixed(1)}%
                    </span>
                    {' • '}
                    Sentiment: <span className={div.sentimentChange >= 0 ? "text-success" : "text-danger"}>
                      {div.sentimentChange >= 0 ? '+' : ''}{div.sentimentChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Strength</div>
                  <div className={cn(
                    "font-bold",
                    div.strength > 70 ? "text-primary" : "text-foreground"
                  )}>
                    {div.strength.toFixed(0)}%
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}

          {divergences.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No significant divergences detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedDivergence} onOpenChange={() => setSelectedDivergence(null)}>
        <DialogContent className="max-w-md">
          {selectedDivergence && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    selectedDivergence.divergenceType === 'bullish' ? "bg-success/20" : "bg-danger/20"
                  )}>
                    {selectedDivergence.divergenceType === 'bullish' 
                      ? <TrendingUp className="w-6 h-6 text-success" />
                      : <TrendingDown className="w-6 h-6 text-danger" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-display">{selectedDivergence.symbol}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-bold uppercase",
                        selectedDivergence.divergenceType === 'bullish' ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                      )}>
                        {selectedDivergence.divergenceType} Divergence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">{selectedDivergence.name}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Strength Gauge */}
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-4xl font-display font-bold text-primary mb-1">
                    {selectedDivergence.strength.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Divergence Strength</div>
                  <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        selectedDivergence.divergenceType === 'bullish' ? "bg-success" : "bg-danger"
                      )}
                      style={{ width: `${selectedDivergence.strength}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Price Change (24h)</div>
                    <div className={cn(
                      "font-bold text-lg",
                      selectedDivergence.priceChange >= 0 ? "text-success" : "text-danger"
                    )}>
                      {selectedDivergence.priceChange >= 0 ? '+' : ''}{selectedDivergence.priceChange.toFixed(2)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Sentiment Change</div>
                    <div className={cn(
                      "font-bold text-lg",
                      selectedDivergence.sentimentChange >= 0 ? "text-success" : "text-danger"
                    )}>
                      {selectedDivergence.sentimentChange >= 0 ? '+' : ''}{selectedDivergence.sentimentChange.toFixed(2)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="font-bold">${selectedDivergence.price.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Sentiment Score</div>
                    <div className="font-bold">{selectedDivergence.sentimentScore.toFixed(0)}</div>
                  </div>
                </div>

                {/* Analysis */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  selectedDivergence.divergenceType === 'bullish' 
                    ? "bg-success/10 border-success/30" 
                    : "bg-danger/10 border-danger/30"
                )}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={cn(
                      "w-4 h-4 mt-0.5 flex-shrink-0",
                      selectedDivergence.divergenceType === 'bullish' ? "text-success" : "text-danger"
                    )} />
                    <p className="text-sm">{selectedDivergence.description}</p>
                  </div>
                </div>

                {/* Trading Implications */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Trading Implication
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedDivergence.divergenceType === 'bullish'
                      ? 'Consider accumulation on weakness. Watch for price stabilization and volume confirmation before entry.'
                      : 'Exercise caution. Consider reducing exposure or tightening stop-losses on existing positions.'
                    }
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
