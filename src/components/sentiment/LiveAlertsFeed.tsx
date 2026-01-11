import { useState, useEffect } from "react";
import { 
  Zap, Waves, TrendingUp, TrendingDown, Bell, Filter, 
  Clock, DollarSign, ChevronRight, AlertTriangle, Newspaper,
  Twitter, Volume2, Activity, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Alert {
  id: string;
  type: 'whale' | 'volume' | 'social' | 'news' | 'options' | 'price';
  severity: 'critical' | 'high' | 'medium' | 'low';
  symbol: string;
  title: string;
  description: string;
  value?: number;
  change?: number;
  timestamp: number;
  narrative?: string;
  source?: string;
}

interface LiveAlertsFeedProps {
  whaleData?: {
    transactions: Array<{
      id: string;
      type: 'buy' | 'sell' | 'transfer';
      asset: string;
      value: number;
      impact: string;
      timestamp: number;
      from: string;
      to: string;
    }>;
    netflow: number;
  };
  coins: Array<{ symbol: string; name: string; price: number; change24h: number; volume: number }>;
}

export function LiveAlertsFeed({ whaleData, coins }: LiveAlertsFeedProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filter, setFilter] = useState<'all' | 'whale' | 'volume' | 'social' | 'critical'>('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Generate alerts from various sources
  useEffect(() => {
    const generatedAlerts: Alert[] = [];

    // Whale alerts from real data
    if (whaleData?.transactions) {
      whaleData.transactions.slice(0, 5).forEach(tx => {
        generatedAlerts.push({
          id: tx.id,
          type: 'whale',
          severity: tx.value >= 1000000 ? 'critical' : tx.value >= 500000 ? 'high' : 'medium',
          symbol: tx.asset,
          title: `${tx.type === 'buy' ? 'Whale Accumulation' : tx.type === 'sell' ? 'Whale Distribution' : 'Large Transfer'}`,
          description: `${tx.type === 'buy' ? 'Outflow from' : tx.type === 'sell' ? 'Inflow to' : 'Transfer between'} ${tx.from} → ${tx.to}`,
          value: tx.value,
          timestamp: tx.timestamp,
          narrative: tx.type === 'buy' ? '#Accumulation' : '#Distribution',
          source: 'On-chain'
        });
      });
    }

    // Volume spike alerts
    coins.filter(c => c.volume > 2e9 && Math.abs(c.change24h) > 3).slice(0, 3).forEach(coin => {
      generatedAlerts.push({
        id: `volume-${coin.symbol}`,
        type: 'volume',
        severity: coin.volume > 5e9 ? 'high' : 'medium',
        symbol: coin.symbol,
        title: 'Volume Spike Detected',
        description: `${coin.symbol} trading volume surged to $${(coin.volume / 1e9).toFixed(1)}B with ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(1)}% price movement`,
        value: coin.volume,
        change: coin.change24h,
        timestamp: Date.now() - Math.random() * 1800000,
        narrative: coin.change24h > 0 ? '#Breakout' : '#Breakdown',
        source: 'Market Data'
      });
    });

    // Price movement alerts
    coins.filter(c => Math.abs(c.change24h) > 5).slice(0, 4).forEach(coin => {
      generatedAlerts.push({
        id: `price-${coin.symbol}`,
        type: 'price',
        severity: Math.abs(coin.change24h) > 10 ? 'critical' : 'high',
        symbol: coin.symbol,
        title: coin.change24h > 0 ? 'Strong Bullish Momentum' : 'Sharp Price Decline',
        description: `${coin.symbol} moved ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(1)}% in 24 hours`,
        value: coin.price,
        change: coin.change24h,
        timestamp: Date.now() - Math.random() * 3600000,
        narrative: coin.change24h > 10 ? '#Pump' : coin.change24h < -10 ? '#Dump' : coin.change24h > 0 ? '#Bullish' : '#Bearish',
        source: 'Price Action'
      });
    });

    // Social alerts (simulated)
    const socialAlerts: Alert[] = [
      {
        id: 'social-btc',
        type: 'social',
        severity: 'medium',
        symbol: 'BTC',
        title: 'Social Volume Spike',
        description: 'Bitcoin mentions increased 45% across Twitter and Reddit in the last 4 hours',
        timestamp: Date.now() - 900000,
        narrative: '#Bitcoin_Trending',
        source: 'Social Analytics'
      },
      {
        id: 'news-eth',
        type: 'news',
        severity: 'high',
        symbol: 'ETH',
        title: 'Major News Event',
        description: 'Ethereum network upgrade announcement trending across crypto news outlets',
        timestamp: Date.now() - 1200000,
        narrative: '#ETH_Upgrade',
        source: 'News Aggregator'
      }
    ];

    generatedAlerts.push(...socialAlerts);

    // Sort by timestamp and severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    generatedAlerts.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp - a.timestamp;
    });

    setAlerts(generatedAlerts);
  }, [whaleData, coins]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'critical') return alert.severity === 'critical' || alert.severity === 'high';
    return alert.type === filter;
  });

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'whale': return <Waves className="w-4 h-4" />;
      case 'volume': return <Volume2 className="w-4 h-4" />;
      case 'social': return <Twitter className="w-4 h-4" />;
      case 'news': return <Newspaper className="w-4 h-4" />;
      case 'options': return <Activity className="w-4 h-4" />;
      case 'price': return <TrendingUp className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-danger bg-danger/20 text-danger';
      case 'high': return 'border-warning bg-warning/20 text-warning';
      case 'medium': return 'border-primary bg-primary/20 text-primary';
      default: return 'border-muted bg-muted/20 text-muted-foreground';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const formatValue = (value?: number) => {
    if (!value) return '';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toLocaleString()}`;
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const whaleCount = alerts.filter(a => a.type === 'whale').length;

  return (
    <>
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="holo-card p-4 text-center">
            <Bell className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-display font-bold">{alerts.length}</div>
            <div className="text-xs text-muted-foreground">Active Alerts</div>
          </div>
          <div className="holo-card p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-danger mx-auto mb-1" />
            <div className="text-2xl font-display font-bold text-danger">{criticalCount}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="holo-card p-4 text-center">
            <Waves className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-display font-bold">{whaleCount}</div>
            <div className="text-xs text-muted-foreground">Whale Alerts</div>
          </div>
          <div className="holo-card p-4 text-center">
            <Target className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="text-2xl font-display font-bold text-success">
              {formatValue(whaleData?.netflow)}
            </div>
            <div className="text-xs text-muted-foreground">Net Flow</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'critical', 'whale', 'volume', 'social'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize text-xs"
              >
                {f === 'critical' ? '🔥 Critical' : f}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live Feed
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="holo-card p-4 md:p-6">
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            LIVE MARKET ALERTS
          </h2>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredAlerts.map((alert, i) => (
              <button
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={cn(
                  "w-full p-4 rounded-lg border flex items-start gap-3 transition-all text-left group animate-fade-in",
                  alert.severity === 'critical' ? "bg-danger/10 border-danger/40 hover:border-danger" :
                  alert.severity === 'high' ? "bg-warning/10 border-warning/40 hover:border-warning" :
                  "bg-muted/30 border-border hover:border-primary/50"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  getSeverityColor(alert.severity)
                )}>
                  {getAlertIcon(alert.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-bold text-primary">{alert.symbol}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-bold uppercase",
                      getSeverityColor(alert.severity)
                    )}>
                      {alert.severity}
                    </span>
                    {alert.narrative && (
                      <span className="text-xs text-muted-foreground">{alert.narrative}</span>
                    )}
                  </div>
                  <div className="font-medium text-sm mb-1">{alert.title}</div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getTimeAgo(alert.timestamp)}
                    </span>
                    {alert.value && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {formatValue(alert.value)}
                      </span>
                    )}
                    {alert.source && (
                      <span className="text-primary">{alert.source}</span>
                    )}
                  </div>
                </div>

                {/* Change & Arrow */}
                <div className="flex items-center gap-2">
                  {alert.change !== undefined && (
                    <div className={cn(
                      "text-right",
                      alert.change >= 0 ? "text-success" : "text-danger"
                    )}>
                      <div className="font-bold">
                        {alert.change >= 0 ? '+' : ''}{alert.change.toFixed(1)}%
                      </div>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-md">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    getSeverityColor(selectedAlert.severity)
                  )}>
                    {getAlertIcon(selectedAlert.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-display">{selectedAlert.symbol}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-bold uppercase",
                        getSeverityColor(selectedAlert.severity)
                      )}>
                        {selectedAlert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">{selectedAlert.title}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Value Card */}
                {selectedAlert.value && (
                  <div className={cn(
                    "p-4 rounded-xl border text-center",
                    selectedAlert.change && selectedAlert.change >= 0 
                      ? "bg-success/10 border-success/30" 
                      : "bg-danger/10 border-danger/30"
                  )}>
                    <div className="text-3xl font-bold">{formatValue(selectedAlert.value)}</div>
                    {selectedAlert.change !== undefined && (
                      <div className={cn(
                        "text-lg font-bold",
                        selectedAlert.change >= 0 ? "text-success" : "text-danger"
                      )}>
                        {selectedAlert.change >= 0 ? '+' : ''}{selectedAlert.change.toFixed(2)}%
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm">{selectedAlert.description}</p>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Time</div>
                    <div className="font-medium">{getTimeAgo(selectedAlert.timestamp)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">Source</div>
                    <div className="font-medium">{selectedAlert.source || 'Real-time Data'}</div>
                  </div>
                </div>

                {/* Narrative Tag */}
                {selectedAlert.narrative && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">Detected Narrative</div>
                    <div className="font-bold text-primary">{selectedAlert.narrative}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
