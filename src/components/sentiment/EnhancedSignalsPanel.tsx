import { useState } from "react";
import { 
  Zap, TrendingUp, TrendingDown, Activity, Flame, BarChart3,
  ChevronRight, ExternalLink, Target, AlertTriangle, Rocket,
  Clock, DollarSign, Brain, Shield, Eye, Filter, Bell,
  ArrowUpRight, ArrowDownRight, Globe, LineChart, Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SignalCoin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  rank?: number;
}

interface EnhancedSignalsPanelProps {
  coins: SignalCoin[];
  onCoinClick: (coin: SignalCoin, signalType: string, message: string) => void;
}

interface SignalDetails {
  type: 'pump' | 'bullish' | 'dump' | 'bearish' | 'neutral' | 'breakout' | 'reversal';
  title: string;
  description: string;
  strength: number;
  confidence: number;
  timeframe: string;
  action: string;
  targets: { support: number; resistance: number; target: number };
  triggers: string[];
}

export function EnhancedSignalsPanel({ coins, onCoinClick }: EnhancedSignalsPanelProps) {
  const [selectedCoin, setSelectedCoin] = useState<SignalCoin | null>(null);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'extreme'>('all');

  const getSignalDetails = (coin: SignalCoin): SignalDetails => {
    const change = coin.change24h;
    let type: SignalDetails['type'] = 'neutral';
    let title = '';
    let description = '';
    let action = '';
    let triggers: string[] = [];

    if (change >= 10) {
      type = 'pump';
      title = 'Major Pump Detected';
      description = `${coin.symbol} is experiencing a significant pump with +${change.toFixed(2)}% gains. High volume confirms the move.`;
      action = 'Consider taking partial profits if already in position. New entries should wait for pullback.';
      triggers = ['High volume spike', 'Social media buzz', 'Breaking resistance', 'FOMO momentum'];
    } else if (change >= 5) {
      type = 'bullish';
      title = 'Strong Bullish Momentum';
      description = `${coin.symbol} showing bullish momentum with +${change.toFixed(2)}% gain. Volume supports the uptrend.`;
      action = 'Monitor for continuation. Consider adding on pullbacks with defined stop-loss.';
      triggers = ['Breaking key level', 'Increasing volume', 'Positive sentiment shift'];
    } else if (change <= -10) {
      type = 'dump';
      title = 'Sharp Decline Alert';
      description = `${coin.symbol} experiencing sharp decline of ${change.toFixed(2)}%. High selling pressure detected.`;
      action = 'Avoid catching falling knife. Wait for stabilization and volume decrease before considering entry.';
      triggers = ['Massive selling', 'Breaking support', 'Fear spreading', 'Whale distribution'];
    } else if (change <= -5) {
      type = 'bearish';
      title = 'Bearish Pressure';
      description = `${coin.symbol} under selling pressure with ${change.toFixed(2)}% decline. Monitor support levels.`;
      action = 'Exercise caution. Tighten stop-losses on existing positions.';
      triggers = ['Support breakdown', 'Negative news', 'Market weakness'];
    } else if (change > 0) {
      type = 'bullish';
      title = 'Positive Momentum';
      description = `${coin.symbol} maintaining positive momentum at +${change.toFixed(2)}%.`;
      action = 'Hold existing positions. Monitor for breakout confirmation.';
      triggers = ['Gradual accumulation', 'Stable volume'];
    } else {
      type = 'bearish';
      title = 'Slight Weakness';
      description = `${coin.symbol} showing minor weakness at ${change.toFixed(2)}%.`;
      action = 'Monitor key support levels. Prepare for potential bounce or breakdown.';
      triggers = ['Light selling', 'Consolidation phase'];
    }

    return {
      type,
      title,
      description,
      strength: Math.min(100, Math.abs(change) * 8),
      confidence: 60 + Math.random() * 30,
      timeframe: Math.abs(change) > 5 ? '1-4 hours' : '24-48 hours',
      action,
      targets: {
        support: coin.price * (1 - 0.05 - Math.random() * 0.05),
        resistance: coin.price * (1 + 0.05 + Math.random() * 0.05),
        target: coin.price * (1 + (change > 0 ? 0.15 : -0.15))
      },
      triggers
    };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const filteredCoins = coins.filter(coin => {
    if (filter === 'all') return true;
    if (filter === 'bullish') return coin.change24h > 0;
    if (filter === 'bearish') return coin.change24h < 0;
    if (filter === 'extreme') return Math.abs(coin.change24h) > 5;
    return true;
  }).slice(0, 15);

  // Stats
  const pumpCount = coins.filter(c => c.change24h >= 5).length;
  const dumpCount = coins.filter(c => c.change24h <= -5).length;
  const avgChange = coins.reduce((sum, c) => sum + c.change24h, 0) / coins.length;

  return (
    <div className="space-y-6">
      {/* Signal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="holo-card p-4 text-center">
          <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-display font-bold">{coins.length}</div>
          <div className="text-xs text-muted-foreground">Active Signals</div>
        </div>
        <div className="holo-card p-4 text-center">
          <Rocket className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-2xl font-display font-bold text-success">{pumpCount}</div>
          <div className="text-xs text-muted-foreground">Pump Signals</div>
        </div>
        <div className="holo-card p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-danger mx-auto mb-2" />
          <div className="text-2xl font-display font-bold text-danger">{dumpCount}</div>
          <div className="text-xs text-muted-foreground">Dump Signals</div>
        </div>
        <div className="holo-card p-4 text-center">
          <Activity className="w-6 h-6 text-warning mx-auto mb-2" />
          <div className={cn("text-2xl font-display font-bold", avgChange >= 0 ? "text-success" : "text-danger")}>
            {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground">Avg Change</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {(['all', 'bullish', 'bearish', 'extreme'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === 'all' ? 'All' : f === 'extreme' ? '🔥 Extreme' : f}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Signals List */}
      <div className="holo-card p-6">
        <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          LIVE MARKET SIGNALS
          <Bell className="w-4 h-4 text-muted-foreground ml-2" />
        </h2>
        <div className="space-y-3">
          {filteredCoins.map((coin, i) => {
            const signal = getSignalDetails(coin);
            const message = signal.description;
            
            return (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin)}
                className={cn(
                  "w-full flex items-start gap-4 p-4 rounded-lg border transition-all animate-fade-in text-left group",
                  signal.type === "pump" ? "border-success/50 bg-success/10 hover:border-success" :
                  signal.type === "bullish" ? "border-success/30 bg-success/5 hover:border-success/50" : 
                  signal.type === "dump" ? "border-danger/50 bg-danger/10 hover:border-danger" :
                  signal.type === "bearish" ? "border-danger/30 bg-danger/5 hover:border-danger/50" : 
                  "border-border hover:border-primary/50"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={cn(
                  "p-2.5 rounded-lg flex-shrink-0",
                  signal.type === "pump" ? "bg-success/20" : 
                  signal.type === "bullish" ? "bg-success/10" :
                  signal.type === "dump" ? "bg-danger/20" : 
                  signal.type === "bearish" ? "bg-danger/10" : 
                  "bg-warning/10"
                )}>
                  {signal.type === "pump" || signal.type === "bullish" ? 
                    <TrendingUp className="w-5 h-5 text-success" /> :
                   signal.type === "dump" || signal.type === "bearish" ? 
                    <TrendingDown className="w-5 h-5 text-danger" /> :
                    <Activity className="w-5 h-5 text-warning" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-bold text-primary group-hover:text-foreground transition-colors">{coin.symbol}</span>
                    <span className="text-xs text-muted-foreground">{coin.name}</span>
                    {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 text-warning" />}
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-bold ml-auto",
                      signal.type === "pump" || signal.type === "bullish" ? "bg-success/20 text-success" :
                      signal.type === "dump" || signal.type === "bearish" ? "bg-danger/20 text-danger" :
                      "bg-warning/20 text-warning"
                    )}>
                      {signal.title}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-1">{message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> {formatNumber(coin.volume)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {formatNumber(coin.marketCap)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> Confidence: {signal.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "text-right flex-shrink-0",
                    coin.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    <div className="font-bold text-lg flex items-center gap-1">
                      {coin.change24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Signal Detail Modal */}
      <Dialog open={!!selectedCoin} onOpenChange={() => setSelectedCoin(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedCoin && (() => {
            const signal = getSignalDetails(selectedCoin);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      signal.type === "pump" || signal.type === "bullish" ? "bg-success/20" : 
                      signal.type === "dump" || signal.type === "bearish" ? "bg-danger/20" : "bg-warning/20"
                    )}>
                      {signal.type === "pump" || signal.type === "bullish" ? 
                        <TrendingUp className="w-6 h-6 text-success" /> :
                       signal.type === "dump" || signal.type === "bearish" ? 
                        <TrendingDown className="w-6 h-6 text-danger" /> :
                        <Activity className="w-6 h-6 text-warning" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-display">{selectedCoin.symbol}</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-bold",
                          signal.type === "pump" || signal.type === "bullish" ? "bg-success/20 text-success" :
                          signal.type === "dump" || signal.type === "bearish" ? "bg-danger/20 text-danger" :
                          "bg-warning/20 text-warning"
                        )}>
                          {signal.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-normal">{selectedCoin.name}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="signal" className="mt-4">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="signal">Signal</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="action">Action</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signal" className="space-y-4 mt-4">
                    {/* Price & Change */}
                    <div className={cn(
                      "p-4 rounded-xl border",
                      signal.type === "pump" || signal.type === "bullish" ? "bg-success/10 border-success/30" :
                      signal.type === "dump" || signal.type === "bearish" ? "bg-danger/10 border-danger/30" :
                      "bg-warning/10 border-warning/30"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="text-2xl font-bold">${selectedCoin.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">24h Change</span>
                        <span className={cn(
                          "text-xl font-bold",
                          selectedCoin.change24h >= 0 ? "text-success" : "text-danger"
                        )}>
                          {selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Signal Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">Signal Strength</div>
                        <div className="font-bold text-lg">{signal.strength.toFixed(0)}%</div>
                        <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              signal.strength > 70 ? "bg-success" : signal.strength > 40 ? "bg-warning" : "bg-danger"
                            )}
                            style={{ width: `${signal.strength}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                        <div className="font-bold text-lg">{signal.confidence.toFixed(0)}%</div>
                        <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${signal.confidence}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">Timeframe</div>
                        <div className="font-bold">{signal.timeframe}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">Volume</div>
                        <div className="font-bold">{formatNumber(selectedCoin.volume)}</div>
                      </div>
                    </div>

                    {/* Triggers */}
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Signal Triggers
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {signal.triggers.map((trigger, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4 mt-4">
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        AI Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground">{signal.description}</p>
                    </div>

                    {/* Price Targets */}
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Price Levels
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Support</span>
                          <span className="font-mono text-success">${signal.targets.support.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className="font-mono font-bold">${selectedCoin.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Resistance</span>
                          <span className="font-mono text-danger">${signal.targets.resistance.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-sm font-medium">Target</span>
                          <span className={cn(
                            "font-mono font-bold",
                            signal.targets.target > selectedCoin.price ? "text-success" : "text-danger"
                          )}>
                            ${signal.targets.target.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="action" className="space-y-4 mt-4">
                    <div className={cn(
                      "p-4 rounded-xl border",
                      signal.type === "pump" || signal.type === "bullish" ? "bg-success/10 border-success/30" :
                      signal.type === "dump" || signal.type === "bearish" ? "bg-danger/10 border-danger/30" :
                      "bg-primary/10 border-primary/30"
                    )}>
                      <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Suggested Action
                      </h4>
                      <p className="text-sm">{signal.action}</p>
                    </div>

                    {/* External Links */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${selectedCoin.symbol}USDT`, '_blank')}>
                        <LineChart className="w-4 h-4 mr-2" /> TradingView
                      </Button>
                      <Button variant="outline" onClick={() => window.open(`https://www.coingecko.com/en/coins/${selectedCoin.name.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}>
                        <Globe className="w-4 h-4 mr-2" /> CoinGecko
                      </Button>
                      <Button variant="outline" onClick={() => window.open(`https://dexscreener.com/ethereum/${selectedCoin.symbol.toLowerCase()}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" /> DexScreener
                      </Button>
                      <Button variant="outline" onClick={() => window.open(`https://alternative.me/crypto/fear-and-greed-index/`, '_blank')}>
                        <Brain className="w-4 h-4 mr-2" /> Fear & Greed
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Signals are for informational purposes. Always DYOR and manage risk.
                </p>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
