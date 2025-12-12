import { useMemo, useEffect, useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { WhaleActivity } from "@/hooks/useChainData";
import { useWhaleAlertsWS } from "@/hooks/useRealtimeWebSocket";
import { 
  ArrowUpRight, ArrowDownRight, ArrowRight, ExternalLink, Copy, Wifi, WifiOff, 
  AlertCircle, Bell, TrendingUp, TrendingDown, Activity, BarChart3, Wallet,
  Info, X, DollarSign, Clock, Target, Zap, Shield, Eye, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface WhaleActivityRadarProps {
  chain: ChainConfig;
  whaleActivity: WhaleActivity[] | undefined;
  isLoading: boolean;
}

interface WhaleDetailModalData {
  type: "transaction" | "wallet" | "stats";
  title: string;
  activity?: WhaleActivity;
  stats?: {
    buys: number;
    sells: number;
    transfers: number;
    totalVolume: number;
    count: number;
    avgSize: number;
    largestTx: number;
    netFlow: number;
  };
}

export function EnhancedWhaleActivityRadar({ chain, whaleActivity: initialWhaleActivity, isLoading }: WhaleActivityRadarProps) {
  const { alerts: wsAlerts, isConnected, newAlert } = useWhaleAlertsWS(chain.id);
  const [showNewAlertBanner, setShowNewAlertBanner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<WhaleDetailModalData | null>(null);

  // Combine WebSocket alerts with initial data
  const whaleActivity = useMemo(() => {
    if (wsAlerts.length > 0) {
      return wsAlerts.map(alert => ({
        type: alert.type,
        amount: alert.amount,
        token: alert.token,
        timestamp: alert.timestamp,
        value: alert.value,
        wallet: alert.fromWallet,
        txHash: alert.txHash,
        explorerUrl: alert.explorerUrl,
        impact: alert.impact,
      }));
    }
    return initialWhaleActivity || [];
  }, [wsAlerts, initialWhaleActivity]);

  // Show new alert notification
  useEffect(() => {
    if (newAlert) {
      setShowNewAlertBanner(true);
      toast.info(`🐳 New whale ${newAlert.type}: ${newAlert.amount.toLocaleString()} ${newAlert.token}`, {
        description: `Value: $${(newAlert.value / 1e6).toFixed(2)}M`,
        duration: 5000,
      });
      setTimeout(() => setShowNewAlertBanner(false), 5000);
    }
  }, [newAlert]);

  const formatValue = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // Calculate radar positions for visualization
  const radarDots = useMemo(() => {
    if (!whaleActivity) return [];
    return whaleActivity.slice(0, 20).map((activity, i) => {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 30 + Math.min(20, (activity.value / 1e6) * 3);
      return {
        ...activity,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        size: Math.min(20, 6 + (activity.value / 1e6) * 2),
      };
    });
  }, [whaleActivity]);

  const stats = useMemo(() => {
    if (!whaleActivity || whaleActivity.length === 0) {
      return { buys: 0, sells: 0, transfers: 0, totalVolume: 0, count: 0, avgSize: 0, largestTx: 0, netFlow: 0 };
    }
    const result = whaleActivity.reduce((acc, a) => {
      if (a.type === "buy") acc.buys += a.value;
      if (a.type === "sell") acc.sells += a.value;
      if (a.type === "transfer") acc.transfers += a.value;
      acc.totalVolume += a.value;
      acc.count++;
      acc.largestTx = Math.max(acc.largestTx, a.value);
      return acc;
    }, { buys: 0, sells: 0, transfers: 0, totalVolume: 0, count: 0, avgSize: 0, largestTx: 0, netFlow: 0 });
    
    result.avgSize = result.count > 0 ? result.totalVolume / result.count : 0;
    result.netFlow = result.buys - result.sells;
    return result;
  }, [whaleActivity]);

  const openTransactionDetail = (activity: WhaleActivity) => {
    setModalData({
      type: "transaction",
      title: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Transaction`,
      activity,
    });
    setModalOpen(true);
  };

  const openStatsDetail = () => {
    setModalData({
      type: "stats",
      title: "Whale Activity Analysis",
      stats,
    });
    setModalOpen(true);
  };

  const getImpactLevel = (value: number) => {
    if (value >= 10e6) return { level: "Critical", color: "text-red-400", bg: "bg-red-400/20" };
    if (value >= 5e6) return { level: "High", color: "text-orange-400", bg: "bg-orange-400/20" };
    if (value >= 1e6) return { level: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/20" };
    return { level: "Low", color: "text-green-400", bg: "bg-green-400/20" };
  };

  return (
    <div className="holo-card p-4 sm:p-6 relative overflow-hidden">
      {/* New Alert Banner */}
      {showNewAlertBanner && newAlert && (
        <div className="absolute top-0 left-0 right-0 bg-warning/20 border-b border-warning/40 px-4 py-2 flex items-center gap-2 animate-pulse z-10">
          <Bell className="h-4 w-4 text-warning" />
          <span className="text-xs text-warning font-medium">
            New whale alert: {newAlert.amount.toLocaleString()} {newAlert.token}
          </span>
        </div>
      )}

      <div className={cn("flex items-center justify-between mb-4 sm:mb-6", showNewAlertBanner && "mt-6")}>
        <div>
          <h3 className="text-base sm:text-lg font-display text-foreground flex items-center gap-2">
            🐳 Enhanced Whale Radar
            {isConnected ? (
              <span className="flex items-center gap-1 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded">
                <Wifi className="h-2.5 w-2.5" />
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                <WifiOff className="h-2.5 w-2.5" />
                Offline
              </span>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time whale transaction monitoring on {chain.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openStatsDetail}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-primary/20 text-primary hover:bg-primary/30 transition-all"
          >
            <BarChart3 className="h-2.5 w-2.5" />
            Analytics
          </button>
          <a
            href={`${chain.explorerUrl}/txs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            Explorer
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Radar Visualization */}
        <div className="relative aspect-square max-w-[220px] sm:max-w-[280px] mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circles */}
            {[15, 30, 45].map((r) => (
              <circle
                key={r}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.3"
                strokeDasharray="2 2"
              />
            ))}

            {/* Cross lines */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(var(--border))" strokeWidth="0.3" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(var(--border))" strokeWidth="0.3" />
            <line x1="15" y1="15" x2="85" y2="85" stroke="hsl(var(--border))" strokeWidth="0.2" strokeDasharray="1 2" />
            <line x1="85" y1="15" x2="15" y2="85" stroke="hsl(var(--border))" strokeWidth="0.2" strokeDasharray="1 2" />

            {/* Center icon */}
            <text x="50" y="52" textAnchor="middle" fontSize="14" fill={`hsl(${chain.color})`}>
              {chain.icon}
            </text>

            {/* Activity dots */}
            {radarDots.map((dot, i) => (
              <g key={i} className="cursor-pointer" onClick={() => openTransactionDetail(dot)}>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.size / 3}
                  fill={dot.type === "buy" ? "hsl(160 84% 39%)" : dot.type === "sell" ? "hsl(0 84% 60%)" : "hsl(38 92% 50%)"}
                  className="animate-pulse"
                >
                  <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
                </circle>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.size / 1.5}
                  fill="none"
                  stroke={dot.type === "buy" ? "hsl(160 84% 39% / 0.3)" : dot.type === "sell" ? "hsl(0 84% 60% / 0.3)" : "hsl(38 92% 50% / 0.3)"}
                  strokeWidth="0.5"
                />
              </g>
            ))}
          </svg>

          {/* Scanning line animation */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(${chain.color} / 0.1) 30deg, transparent 60deg)`,
              animation: "spin 4s linear infinite",
            }}
          />
        </div>

        {/* Stats & Activity List */}
        <div className="space-y-3 sm:space-y-4">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={openStatsDetail} className="p-2 sm:p-3 rounded-lg bg-success/10 border border-success/30 hover:bg-success/20 transition-all text-left">
              <div className="flex items-center justify-between">
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                <Info className="h-2.5 w-2.5 text-success/60" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total Buys</p>
              <p className="text-xs sm:text-sm font-display text-success">{formatValue(stats.buys)}</p>
            </button>
            <button onClick={openStatsDetail} className="p-2 sm:p-3 rounded-lg bg-danger/10 border border-danger/30 hover:bg-danger/20 transition-all text-left">
              <div className="flex items-center justify-between">
                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-danger" />
                <Info className="h-2.5 w-2.5 text-danger/60" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total Sells</p>
              <p className="text-xs sm:text-sm font-display text-danger">{formatValue(stats.sells)}</p>
            </button>
            <button onClick={openStatsDetail} className="p-2 sm:p-3 rounded-lg bg-warning/10 border border-warning/30 hover:bg-warning/20 transition-all text-left">
              <div className="flex items-center justify-between">
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
                <Info className="h-2.5 w-2.5 text-warning/60" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Transfers</p>
              <p className="text-xs sm:text-sm font-display text-warning">{formatValue(stats.transfers)}</p>
            </button>
            <button onClick={openStatsDetail} className={cn(
              "p-2 sm:p-3 rounded-lg border transition-all text-left",
              stats.netFlow >= 0 ? "bg-success/5 border-success/20 hover:bg-success/10" : "bg-danger/5 border-danger/20 hover:bg-danger/10"
            )}>
              <div className="flex items-center justify-between">
                <Activity className={cn("h-3 w-3 sm:h-4 sm:w-4", stats.netFlow >= 0 ? "text-success" : "text-danger")} />
                <Info className="h-2.5 w-2.5 text-muted-foreground/60" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Net Flow</p>
              <p className={cn("text-xs sm:text-sm font-display", stats.netFlow >= 0 ? "text-success" : "text-danger")}>
                {stats.netFlow >= 0 ? "+" : ""}{formatValue(Math.abs(stats.netFlow))}
              </p>
            </button>
          </div>

          {/* Recent Activity List */}
          <div className="space-y-1.5 sm:space-y-2 max-h-[180px] sm:max-h-[220px] overflow-y-auto">
            {whaleActivity?.slice(0, 10).map((activity, i) => {
              const impact = getImpactLevel(activity.value);
              return (
                <button
                  key={i}
                  onClick={() => openTransactionDetail(activity)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg transition-all group text-left",
                    activity.type === "buy" && "bg-success/5 border border-success/20 hover:bg-success/10",
                    activity.type === "sell" && "bg-danger/5 border border-danger/20 hover:bg-danger/10",
                    activity.type === "transfer" && "bg-warning/5 border border-warning/20 hover:bg-warning/10",
                    i === 0 && newAlert && "ring-2 ring-warning/50 animate-pulse"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {activity.type === "buy" && <ArrowUpRight className="h-3.5 w-3.5 text-success flex-shrink-0" />}
                    {activity.type === "sell" && <ArrowDownRight className="h-3.5 w-3.5 text-danger flex-shrink-0" />}
                    {activity.type === "transfer" && <ArrowRight className="h-3.5 w-3.5 text-warning flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-foreground truncate font-medium">
                        {activity.amount.toLocaleString()} {activity.token}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                        <Badge variant="outline" className={cn("text-[8px] px-1 py-0", impact.color, impact.bg)}>
                          {impact.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">{formatValue(activity.value)}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* External Links */}
      <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap gap-2">
        <a href={`https://whale-alert.io`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted/20 text-muted-foreground hover:text-foreground transition-all">
          <ExternalLink className="h-3 w-3" /> Whale Alert
        </a>
        <a href={`https://www.whalestats.com/${chain.id === "ethereum" ? "ethereum" : chain.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted/20 text-muted-foreground hover:text-foreground transition-all">
          <ExternalLink className="h-3 w-3" /> WhaleStats
        </a>
        <a href={`https://etherscan.io/accounts?sort=balance&order=desc`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted/20 text-muted-foreground hover:text-foreground transition-all">
          <Wallet className="h-3 w-3" /> Top Wallets
        </a>
        <a href={`https://arkham.intelligence.com`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted/20 text-muted-foreground hover:text-foreground transition-all">
          <Eye className="h-3 w-3" /> Arkham
        </a>
      </div>

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                {modalData?.type === "transaction" ? <Activity className="h-5 w-5 text-primary" /> : <BarChart3 className="h-5 w-5 text-primary" />}
              </div>
              {modalData?.title}
            </DialogTitle>
          </DialogHeader>

          {modalData?.type === "transaction" && modalData.activity && (
            <div className="space-y-4 py-4">
              {/* Transaction Type Badge */}
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "text-sm px-3 py-1",
                  modalData.activity.type === "buy" && "bg-success/20 text-success",
                  modalData.activity.type === "sell" && "bg-danger/20 text-danger",
                  modalData.activity.type === "transfer" && "bg-warning/20 text-warning"
                )}>
                  {modalData.activity.type.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getImpactLevel(modalData.activity.value).color}>
                  {getImpactLevel(modalData.activity.value).level} Impact
                </Badge>
              </div>

              {/* Amount & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                  <p className="text-xl font-bold text-foreground">{modalData.activity.amount.toLocaleString()} {modalData.activity.token}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">USD Value</p>
                  <p className="text-xl font-bold text-primary">{formatValue(modalData.activity.value)}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Transaction Details</h4>
                
                <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Timestamp</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-foreground">{new Date(modalData.activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {modalData.activity.wallet && (
                  <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Wallet Address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground font-mono">{modalData.activity.wallet.slice(0, 8)}...{modalData.activity.wallet.slice(-6)}</span>
                        <button onClick={() => copyToClipboard(modalData.activity!.wallet!, "Wallet")} className="p-1 hover:bg-muted/30 rounded">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(modalData.activity as any).txHash && (
                  <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Transaction Hash</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground font-mono">{(modalData.activity as any).txHash.slice(0, 10)}...</span>
                        <button onClick={() => copyToClipboard((modalData.activity as any).txHash, "Hash")} className="p-1 hover:bg-muted/30 rounded">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Market Impact */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Market Impact Analysis
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Impact Level</p>
                    <p className={cn("font-medium", getImpactLevel(modalData.activity.value).color)}>
                      {getImpactLevel(modalData.activity.value).level}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Potential Slippage</p>
                    <p className="font-medium text-foreground">
                      {modalData.activity.value >= 10e6 ? "High (>2%)" : modalData.activity.value >= 1e6 ? "Medium (1-2%)" : "Low (<1%)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="flex flex-wrap gap-2">
                <a href={`${chain.explorerUrl}/tx/${(modalData.activity as any).txHash || ""}`} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-sm">
                  <ExternalLink className="h-4 w-4" /> View on Explorer
                </a>
                {modalData.activity.wallet && (
                  <a href={`${chain.explorerUrl}/address/${modalData.activity.wallet}`} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted/20 text-foreground hover:bg-muted/30 transition-all text-sm">
                    <Wallet className="h-4 w-4" /> View Wallet
                  </a>
                )}
              </div>
            </div>
          )}

          {modalData?.type === "stats" && modalData.stats && (
            <div className="space-y-4 py-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Total Volume</p>
                  <p className="text-2xl font-bold text-foreground">{formatValue(modalData.stats.totalVolume)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Transaction Count</p>
                  <p className="text-2xl font-bold text-foreground">{modalData.stats.count}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Average Size</p>
                  <p className="text-xl font-bold text-foreground">{formatValue(modalData.stats.avgSize)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Largest Transaction</p>
                  <p className="text-xl font-bold text-primary">{formatValue(modalData.stats.largestTx)}</p>
                </div>
              </div>

              {/* Buy/Sell Ratio */}
              <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-3">Buy/Sell Distribution</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-success">Buys</span>
                      <span className="text-success">{formatValue(modalData.stats.buys)}</span>
                    </div>
                    <Progress value={(modalData.stats.buys / (modalData.stats.buys + modalData.stats.sells || 1)) * 100} className="h-2 [&>div]:bg-success" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-danger">Sells</span>
                      <span className="text-danger">{formatValue(modalData.stats.sells)}</span>
                    </div>
                    <Progress value={(modalData.stats.sells / (modalData.stats.buys + modalData.stats.sells || 1)) * 100} className="h-2 [&>div]:bg-danger" />
                  </div>
                </div>
              </div>

              {/* Net Flow Analysis */}
              <div className={cn(
                "p-4 rounded-lg border",
                modalData.stats.netFlow >= 0 ? "bg-success/5 border-success/30" : "bg-danger/5 border-danger/30"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {modalData.stats.netFlow >= 0 ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-danger" />}
                  <span className="font-medium text-foreground">Net Flow</span>
                </div>
                <p className={cn("text-2xl font-bold", modalData.stats.netFlow >= 0 ? "text-success" : "text-danger")}>
                  {modalData.stats.netFlow >= 0 ? "+" : ""}{formatValue(Math.abs(modalData.stats.netFlow))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {modalData.stats.netFlow >= 0 ? "Accumulation phase - more buying than selling" : "Distribution phase - more selling than buying"}
                </p>
              </div>

              {/* Insights */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Key Insights
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Whale activity suggests {modalData.stats.netFlow >= 0 ? "bullish" : "bearish"} sentiment
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Average transaction size of {formatValue(modalData.stats.avgSize)} indicates {modalData.stats.avgSize > 1e6 ? "institutional" : "large retail"} activity
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {modalData.stats.count} whale transactions tracked in this period
                  </li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
