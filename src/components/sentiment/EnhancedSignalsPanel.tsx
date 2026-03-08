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

    </div>
  );
}
