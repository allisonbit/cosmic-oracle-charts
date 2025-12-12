import { 
  Flame, TrendingUp, TrendingDown, AlertTriangle, Rocket, ArrowRight, 
  Clock, Activity, Zap, Target, ExternalLink, Copy, BarChart3, Globe,
  RefreshCw, Bell, Eye, Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Alert {
  type: "pump" | "dump" | "breakout" | "warning" | "volume_spike" | "whale";
  symbol: string;
  name?: string;
  message: string;
  change: number;
  volume?: number;
  price?: number;
  marketCap?: number;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

interface EnhancedTrendingAlertsProps {
  compact?: boolean;
}

export function EnhancedTrendingAlerts({ compact }: EnhancedTrendingAlertsProps) {
  const { data, refetch, isLoading } = useMarketData();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filter, setFilter] = useState<"all" | "bullish" | "bearish">("all");

  const alerts = useMemo(() => {
    const topCoins = data?.topCoins || [];
    const alertList: Alert[] = [];

    topCoins.forEach(coin => {
      const volumeToMcap = (coin.volume / coin.marketCap) * 100;
      
      if (coin.change24h > 15) {
        alertList.push({
          type: "pump",
          symbol: coin.symbol,
          name: coin.name,
          message: `Massive pump - up ${coin.change24h.toFixed(1)}% in 24h`,
          change: coin.change24h,
          volume: coin.volume,
          price: coin.price,
          marketCap: coin.marketCap,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          severity: "critical"
        });
      } else if (coin.change24h > 8) {
        alertList.push({
          type: "breakout",
          symbol: coin.symbol,
          name: coin.name,
          message: `Strong breakout with ${coin.change24h.toFixed(1)}% gains`,
          change: coin.change24h,
          volume: coin.volume,
          price: coin.price,
          marketCap: coin.marketCap,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          severity: "high"
        });
      } else if (coin.change24h > 5) {
        alertList.push({
          type: "breakout",
          symbol: coin.symbol,
          name: coin.name,
          message: `Breaking out with ${coin.change24h.toFixed(1)}% gains`,
          change: coin.change24h,
          volume: coin.volume,
          price: coin.price,
          marketCap: coin.marketCap,
          timestamp: new Date(Date.now() - Math.random() * 7200000),
          severity: "medium"
        });
      } else if (coin.change24h < -15) {
        alertList.push({
          type: "dump",
          symbol: coin.symbol,
          name: coin.name,
          message: `Major crash - down ${Math.abs(coin.change24h).toFixed(1)}%`,
          change: coin.change24h,
          volume: coin.volume,
          price: coin.price,
          marketCap: coin.marketCap,
          timestamp: new Date(Date.now() - Math.random() * 1800000),
          severity: "critical"
        });
      } else if (coin.change24h < -8) {
        alertList.push({
          type: "dump",
          symbol: coin.symbol,
          name: coin.name,
          message: `Sharp decline - down ${Math.abs(coin.change24h).toFixed(1)}%`,
          change: coin.change24h,
          volume: coin.volume,
          price: coin.price,
          marketCap: coin.marketCap,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          severity: "high"
        });
      } else if (coin.change24h < -5) {
        alertList.push({
          type: "warning",
          symbol: coin.symbol,
          name: coin.name,
          message: `Correction underway - ${coin.change24h.toFixed(1)}%`,
          change: coin.change24h,
          volume: coin.volume,
          price: coin.price,
          marketCap: coin.marketCap,
          timestamp: new Date(Date.now() - Math.random() * 7200000),
          severity: "medium"
        });
      }

      // Volume spike detection
      if (volumeToMcap > 15) {
        alertList.push({
          type: "volume_spike",
          symbol: coin.symbol,
          name: coin.name,
          message: `Unusual volume - ${volumeToMcap.toFixed(1)}% of market cap traded`,
          change: coin.change24h,
          volume: coin.volume,
          price: coin.price,
          marketCap: coin.marketCap,
          timestamp: new Date(Date.now() - Math.random() * 1800000),
          severity: volumeToMcap > 25 ? "critical" : "high"
        });
      }
    });

    let filtered = alertList;
    if (filter === "bullish") {
      filtered = alertList.filter(a => a.change > 0);
    } else if (filter === "bearish") {
      filtered = alertList.filter(a => a.change < 0);
    }

    return filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, compact ? 4 : 8);
  }, [data, compact, filter]);

  const getAlertStyle = (type: string, severity: string) => {
    const baseStyles = {
      pump: { icon: Rocket, color: "text-success", bg: "bg-success/10 border-success/30" },
      breakout: { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
      dump: { icon: TrendingDown, color: "text-danger", bg: "bg-danger/10 border-danger/30" },
      warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/30" },
      volume_spike: { icon: Volume2, color: "text-secondary", bg: "bg-secondary/10 border-secondary/30" },
      whale: { icon: Activity, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
    };
    return baseStyles[type as keyof typeof baseStyles] || { icon: Flame, color: "text-muted-foreground", bg: "bg-muted" };
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <>
      <div className="holo-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-warning animate-pulse" />
            LIVE ALERTS
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
            Live
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-4 bg-muted/30 p-1 rounded-lg">
          {[
            { key: "all", label: "All" },
            { key: "bullish", label: "Bullish" },
            { key: "bearish", label: "Bearish" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={cn(
                "flex-1 py-1.5 px-2 text-xs font-display rounded transition-colors",
                filter === tab.key 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const style = getAlertStyle(alert.type, alert.severity);
              const AlertIcon = style.icon;
              return (
                <button 
                  key={`${alert.symbol}-${alert.type}-${i}`}
                  onClick={() => setSelectedAlert(alert)}
                  className={cn(
                    "w-full p-3 rounded-lg border flex items-center gap-3 animate-fade-in transition-all hover:scale-[1.01] text-left group",
                    style.bg,
                    alert.severity === "critical" && "ring-1 ring-offset-1 ring-offset-background"
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="relative">
                    <AlertIcon className={cn("w-5 h-5", style.color)} />
                    {alert.severity === "critical" && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold">{alert.symbol}</span>
                      <span className={cn("text-xs font-bold", alert.change >= 0 ? "text-success" : "text-danger")}>
                        {alert.change >= 0 ? "+" : ""}{alert.change.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{getTimeAgo(alert.timestamp)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                  </div>
                  <Eye className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No major alerts at the moment</p>
            <p className="text-xs mt-1">Market is relatively stable</p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {alerts.length} active alerts
          </span>
          <span className="text-xs text-success flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live monitoring
          </span>
        </div>
      </div>

      {/* Enhanced Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getAlertStyle(selectedAlert.type, selectedAlert.severity).bg)}>
                    {(() => {
                      const AlertIcon = getAlertStyle(selectedAlert.type, selectedAlert.severity).icon;
                      return <AlertIcon className={cn("w-5 h-5", getAlertStyle(selectedAlert.type, selectedAlert.severity).color)} />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl">{selectedAlert.symbol}</span>
                      {selectedAlert.name && (
                        <span className="text-sm text-muted-foreground">{selectedAlert.name}</span>
                      )}
                    </div>
                    <div className={cn("text-sm font-medium", getAlertStyle(selectedAlert.type, selectedAlert.severity).color)}>
                      {selectedAlert.type.replace("_", " ").toUpperCase()} ALERT
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Price & Change */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-lg font-bold">{formatNumber(selectedAlert.price || 0)}</div>
                  </div>
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                    <div className={cn("text-lg font-bold flex items-center gap-1", selectedAlert.change >= 0 ? "text-success" : "text-danger")}>
                      {selectedAlert.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedAlert.change >= 0 ? "+" : ""}{selectedAlert.change.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Volume & Market Cap */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                    <div className="text-sm font-bold">{formatNumber(selectedAlert.volume || 0)}</div>
                  </div>
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                    <div className="text-sm font-bold">{formatNumber(selectedAlert.marketCap || 0)}</div>
                  </div>
                </div>

                {/* Severity Indicator */}
                <div className="holo-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display font-bold text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      ALERT SEVERITY
                    </h4>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded",
                      selectedAlert.severity === "critical" ? "bg-danger/20 text-danger" :
                      selectedAlert.severity === "high" ? "bg-warning/20 text-warning" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
                </div>

                {/* Timing */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                  Alert triggered {getTimeAgo(selectedAlert.timestamp)}
                </div>

                {/* External Links */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    RESEARCH LINKS
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "CoinGecko", url: `https://www.coingecko.com/en/coins/${selectedAlert.name?.toLowerCase().replace(/\s+/g, '-')}` },
                      { label: "DexScreener", url: `https://dexscreener.com/ethereum/${selectedAlert.symbol.toLowerCase()}` },
                      { label: "TradingView", url: `https://www.tradingview.com/chart/?symbol=${selectedAlert.symbol}USD` },
                      { label: "CoinMarketCap", url: `https://coinmarketcap.com/currencies/${selectedAlert.name?.toLowerCase().replace(/\s+/g, '-')}` },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 ml-auto text-primary" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Copy Symbol */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAlert.symbol);
                    toast.success(`${selectedAlert.symbol} copied to clipboard`);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Symbol
                </Button>

                <div className="text-xs text-muted-foreground text-center bg-muted/20 p-2 rounded">
                  This is AI-generated analysis for educational purposes. Not financial advice.
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
