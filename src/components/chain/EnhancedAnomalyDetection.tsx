import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { 
  AlertTriangle, Shield, Eye, Skull, Users, Activity, AlertOctagon, 
  CheckCircle, XCircle, Zap, ExternalLink, Info, ChevronRight,
  Copy, Target, TrendingDown, DollarSign, Bot, Waves, Search
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AnomalyDetectionProps {
  chain: ChainConfig;
  anomalyData?: AnomalyDetectionData;
  isLoading: boolean;
}

export interface AnomalyDetectionData {
  washTrading: {
    detected: number;
    suspectedPairs: { pair: string; volume: number; suspicionScore: number }[];
    totalFakeVolume: number;
  };
  mevBots: {
    identified: number;
    activity24h: number;
    topBots: { address: string; profit24h: number; type: string }[];
  };
  rugPullWarning: {
    highRisk: { token: string; score: number; reasons: string[] }[];
    mediumRisk: { token: string; score: number; reasons: string[] }[];
    recentRugs: { token: string; date: string; loss: number }[];
  };
  sybilDetection: {
    suspectedClusters: number;
    flaggedAddresses: number;
    recentAirdrops: { name: string; sybilRate: number; flagged: number }[];
  };
  fakeVolume: {
    cexFakeVolume: number;
    dexFakeVolume: number;
    realVolumeRatio: number;
    flaggedExchanges: { name: string; fakePercentage: number }[];
  };
  recentAlerts: {
    type: string;
    severity: "high" | "medium" | "low";
    message: string;
    timestamp: number;
  }[];
}

interface ModalData {
  type: "washTrading" | "mevBots" | "rugPull" | "sybil" | "fakeVolume" | "alert";
  title: string;
  data: any;
}

export function EnhancedAnomalyDetection({ chain, anomalyData, isLoading }: AnomalyDetectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const formatNumber = (n: number, decimals = 2) => {
    if (n >= 1e9) return (n / 1e9).toFixed(decimals) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(decimals) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(decimals) + "K";
    return n.toFixed(decimals);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-400 bg-red-400/10 border-red-400/30";
      case "medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      default: return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertOctagon className="h-4 w-4" />;
      case "medium": return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const openDetailModal = (type: ModalData["type"], title: string, data: any) => {
    setModalData({ type, title, data });
    setModalOpen(true);
  };

  if (isLoading || !anomalyData) {
    return (
      <div className="holo-card p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const threatLevel = anomalyData.recentAlerts.filter(a => a.severity === "high").length > 2 
    ? "Critical" 
    : anomalyData.recentAlerts.filter(a => a.severity === "high").length > 0 
    ? "Elevated" 
    : "Normal";

  return (
    <div className="holo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/20">
          <Shield className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h3 className="font-display text-lg text-foreground">🛡️ Enhanced Anomaly Detection</h3>
          <p className="text-sm text-muted-foreground">Real-time threat monitoring & protection on {chain.name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className={cn(
            threatLevel === "Critical" && "text-red-400 border-red-400/30",
            threatLevel === "Elevated" && "text-yellow-400 border-yellow-400/30",
            threatLevel === "Normal" && "text-green-400 border-green-400/30"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full mr-2 animate-pulse",
              threatLevel === "Critical" && "bg-red-400",
              threatLevel === "Elevated" && "bg-yellow-400",
              threatLevel === "Normal" && "bg-green-400"
            )} />
            {threatLevel} Threat Level
          </Badge>
        </div>
      </div>

      {/* Recent Alerts - Clickable */}
      {anomalyData.recentAlerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-red-400" />
            Recent Alerts
            <Badge variant="outline" className="text-red-400 text-[10px]">{anomalyData.recentAlerts.length}</Badge>
          </h4>
          <div className="space-y-2">
            {anomalyData.recentAlerts.slice(0, 3).map((alert, i) => (
              <button
                key={i}
                onClick={() => openDetailModal("alert", "Alert Details", alert)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] text-left",
                  getSeverityColor(alert.severity)
                )}
              >
                {getSeverityIcon(alert.severity)}
                <span className="flex-1 text-sm">{alert.message}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Detection Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Wash Trading Detection - Clickable */}
        <button
          onClick={() => openDetailModal("washTrading", "Wash Trading Detection", anomalyData.washTrading)}
          className="text-left bg-background/40 border border-border/30 rounded-lg p-4 hover:border-orange-400/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Waves className="h-4 w-4 text-orange-400" />
              Wash Trading Detection
            </h4>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-400 transition-colors" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Detected Pairs</span>
            <span className="text-2xl font-bold text-orange-400">{anomalyData.washTrading.detected}</span>
          </div>
          <div className="mb-4">
            <span className="text-xs text-muted-foreground">Est. Fake Volume (24h)</span>
            <div className="text-lg font-bold text-red-400">${formatNumber(anomalyData.washTrading.totalFakeVolume)}</div>
          </div>
          <div className="space-y-2">
            {anomalyData.washTrading.suspectedPairs.slice(0, 2).map((pair, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{pair.pair}</span>
                <div className="flex items-center gap-2">
                  <Progress value={pair.suspicionScore} className="w-12 h-1 [&>div]:bg-orange-400" />
                  <span className="text-orange-400 text-xs w-8 text-right">{pair.suspicionScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </button>

        {/* MEV Bot Identification - Clickable */}
        <button
          onClick={() => openDetailModal("mevBots", "MEV Bot Identification", anomalyData.mevBots)}
          className="text-left bg-background/40 border border-border/30 rounded-lg p-4 hover:border-yellow-400/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-yellow-400" />
              MEV Bot Identification
            </h4>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-yellow-400 transition-colors" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Identified Bots</span>
            <span className="text-2xl font-bold text-yellow-400">{anomalyData.mevBots.identified}</span>
          </div>
          <div className="mb-4">
            <span className="text-xs text-muted-foreground">24h Bot Activity</span>
            <div className="text-lg font-bold text-foreground">{formatNumber(anomalyData.mevBots.activity24h)} txns</div>
          </div>
          <div className="space-y-2">
            {anomalyData.mevBots.topBots.slice(0, 2).map((bot, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-xs">{bot.address.slice(0, 8)}...</span>
                  <Badge variant="outline" className="text-xs">{bot.type}</Badge>
                </div>
                <span className="text-green-400">${formatNumber(bot.profit24h)}</span>
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* Rug Pull Warning System - Clickable */}
      <button
        onClick={() => openDetailModal("rugPull", "Rug Pull Warning System", anomalyData.rugPullWarning)}
        className="w-full text-left mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5 hover:border-red-500/50 transition-all group"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Skull className="h-4 w-4 text-red-400" />
            Rug Pull Early Warning
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-red-400 border-red-400/30">
              {anomalyData.rugPullWarning.highRisk.length} High Risk
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-400 transition-colors" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">High Risk ({anomalyData.rugPullWarning.highRisk.length})</span>
            </div>
            {anomalyData.rugPullWarning.highRisk.slice(0, 1).map((token, i) => (
              <div key={i} className="text-xs">
                <span className="text-foreground">{token.token}</span>
                <span className="text-red-400 ml-2">{token.score}%</span>
              </div>
            ))}
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Medium Risk ({anomalyData.rugPullWarning.mediumRisk.length})</span>
            </div>
            {anomalyData.rugPullWarning.mediumRisk.slice(0, 1).map((token, i) => (
              <div key={i} className="text-xs">
                <span className="text-foreground">{token.token}</span>
                <span className="text-yellow-400 ml-2">{token.score}%</span>
              </div>
            ))}
          </div>
          <div className="bg-muted/20 border border-border/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Recent Rugs ({anomalyData.rugPullWarning.recentRugs.length})</span>
            </div>
            {anomalyData.rugPullWarning.recentRugs.slice(0, 1).map((rug, i) => (
              <div key={i} className="text-xs">
                <span className="text-foreground">{rug.token}</span>
                <span className="text-red-400 ml-2">-${formatNumber(rug.loss)}</span>
              </div>
            ))}
          </div>
        </div>
      </button>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sybil Detection - Clickable */}
        <button
          onClick={() => openDetailModal("sybil", "Sybil Attack Detection", anomalyData.sybilDetection)}
          className="text-left bg-background/40 border border-border/30 rounded-lg p-4 hover:border-purple-400/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              Sybil Attack Detection
            </h4>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-muted-foreground block">Suspected Clusters</span>
              <span className="text-xl font-bold text-purple-400">{anomalyData.sybilDetection.suspectedClusters}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Flagged Addresses</span>
              <span className="text-xl font-bold text-foreground">{formatNumber(anomalyData.sybilDetection.flaggedAddresses, 0)}</span>
            </div>
          </div>
          <div className="space-y-1">
            {anomalyData.sybilDetection.recentAirdrops.slice(0, 2).map((airdrop, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{airdrop.name}</span>
                <span className="text-red-400">{airdrop.sybilRate}% sybils</span>
              </div>
            ))}
          </div>
        </button>

        {/* Fake Volume - Clickable */}
        <button
          onClick={() => openDetailModal("fakeVolume", "Fake Volume Detection", anomalyData.fakeVolume)}
          className="text-left bg-background/40 border border-border/30 rounded-lg p-4 hover:border-cyan-400/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              Fake Volume Detection
            </h4>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Real Volume Ratio</span>
              <span className={cn(
                "font-medium",
                anomalyData.fakeVolume.realVolumeRatio > 70 ? "text-green-400" : 
                anomalyData.fakeVolume.realVolumeRatio > 40 ? "text-yellow-400" : "text-red-400"
              )}>
                {anomalyData.fakeVolume.realVolumeRatio}%
              </span>
            </div>
            <Progress value={anomalyData.fakeVolume.realVolumeRatio} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground block">CEX Fake</span>
              <span className="text-lg font-bold text-red-400">${formatNumber(anomalyData.fakeVolume.cexFakeVolume)}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">DEX Fake</span>
              <span className="text-lg font-bold text-orange-400">${formatNumber(anomalyData.fakeVolume.dexFakeVolume)}</span>
            </div>
          </div>
        </button>
      </div>

      {/* External Links */}
      <div className="mt-6 pt-4 border-t border-border/30 flex flex-wrap gap-2">
        <a href="https://tokensniffer.com" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs">
          <Shield className="h-3 w-3" /> TokenSniffer
        </a>
        <a href="https://gopluslabs.io" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs">
          <Shield className="h-3 w-3" /> GoPlus Security
        </a>
        <a href="https://rugdoc.io" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs">
          <Skull className="h-3 w-3" /> RugDoc
        </a>
        <a href="https://eigenphi.io" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs">
          <Bot className="h-3 w-3" /> EigenPhi MEV
        </a>
        <a href="https://flashbots.net" target="_blank" rel="noopener noreferrer" 
           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs">
          <Zap className="h-3 w-3" /> Flashbots
        </a>
      </div>

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                modalData?.type === "washTrading" && "bg-orange-400/20",
                modalData?.type === "mevBots" && "bg-yellow-400/20",
                modalData?.type === "rugPull" && "bg-red-400/20",
                modalData?.type === "sybil" && "bg-purple-400/20",
                modalData?.type === "fakeVolume" && "bg-cyan-400/20",
                modalData?.type === "alert" && "bg-red-400/20"
              )}>
                {modalData?.type === "washTrading" && <Waves className="h-5 w-5 text-orange-400" />}
                {modalData?.type === "mevBots" && <Bot className="h-5 w-5 text-yellow-400" />}
                {modalData?.type === "rugPull" && <Skull className="h-5 w-5 text-red-400" />}
                {modalData?.type === "sybil" && <Users className="h-5 w-5 text-purple-400" />}
                {modalData?.type === "fakeVolume" && <Eye className="h-5 w-5 text-cyan-400" />}
                {modalData?.type === "alert" && <AlertOctagon className="h-5 w-5 text-red-400" />}
              </div>
              {modalData?.title}
            </DialogTitle>
          </DialogHeader>

          {modalData?.type === "washTrading" && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-orange-400/10 border border-orange-400/30">
                  <p className="text-xs text-muted-foreground mb-1">Detected Pairs</p>
                  <p className="text-3xl font-bold text-orange-400">{modalData.data.detected}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-400/10 border border-red-400/30">
                  <p className="text-xs text-muted-foreground mb-1">Total Fake Volume</p>
                  <p className="text-3xl font-bold text-red-400">${formatNumber(modalData.data.totalFakeVolume)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-3">Suspected Pairs</h4>
                <div className="space-y-3">
                  {modalData.data.suspectedPairs.map((pair: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20">
                      <div>
                        <p className="font-medium text-foreground">{pair.pair}</p>
                        <p className="text-xs text-muted-foreground">Volume: ${formatNumber(pair.volume)}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={pair.suspicionScore} className="w-20 h-2 [&>div]:bg-orange-400" />
                          <span className="text-sm font-bold text-orange-400">{pair.suspicionScore}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Suspicion Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> What is Wash Trading?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Wash trading is a form of market manipulation where trades are executed with no change in beneficial ownership, 
                  artificially inflating volume and creating false impressions of market activity.
                </p>
              </div>
            </div>
          )}

          {modalData?.type === "mevBots" && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                  <p className="text-xs text-muted-foreground mb-1">Identified Bots</p>
                  <p className="text-3xl font-bold text-yellow-400">{modalData.data.identified}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">24h Activity</p>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(modalData.data.activity24h)} txns</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-3">Top MEV Bots</h4>
                <div className="space-y-3">
                  {modalData.data.topBots.map((bot: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5 text-yellow-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm text-foreground">{bot.address.slice(0, 10)}...{bot.address.slice(-6)}</p>
                            <button onClick={() => copyToClipboard(bot.address)} className="p-1 hover:bg-muted/30 rounded">
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">{bot.type}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">${formatNumber(bot.profit24h)}</p>
                        <p className="text-xs text-muted-foreground">24h Profit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href={`${chain.explorerUrl}`} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-sm">
                  <ExternalLink className="h-4 w-4" /> View on Explorer
                </a>
                <a href="https://eigenphi.io" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted/20 text-foreground hover:bg-muted/30 transition-all text-sm">
                  <Bot className="h-4 w-4" /> EigenPhi MEV Analytics
                </a>
              </div>
            </div>
          )}

          {modalData?.type === "rugPull" && (
            <div className="space-y-4 py-4">
              {/* High Risk Tokens */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> High Risk Tokens ({modalData.data.highRisk.length})
                </h4>
                <div className="space-y-3">
                  {modalData.data.highRisk.map((token: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-background/50 border border-red-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{token.token}</span>
                        <Badge className="bg-red-500/20 text-red-400">{token.score}% Risk</Badge>
                      </div>
                      <ul className="space-y-1">
                        {token.reasons.map((reason: string, j: number) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium Risk */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Medium Risk Tokens ({modalData.data.mediumRisk.length})
                </h4>
                <div className="space-y-2">
                  {modalData.data.mediumRisk.map((token: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-foreground">{token.token}</span>
                      <span className="text-yellow-400 text-sm">{token.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Rugs */}
              <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-3">Recent Rug Pulls</h4>
                <div className="space-y-2">
                  {modalData.data.recentRugs.map((rug: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-background/50">
                      <div>
                        <span className="text-sm text-foreground">{rug.token}</span>
                        <span className="text-xs text-muted-foreground ml-2">{rug.date}</span>
                      </div>
                      <span className="text-red-400 font-bold">-${formatNumber(rug.loss)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href="https://tokensniffer.com" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-sm">
                  <Shield className="h-4 w-4" /> Check Token Safety
                </a>
                <a href="https://rugdoc.io" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted/20 text-foreground hover:bg-muted/30 transition-all text-sm">
                  <Skull className="h-4 w-4" /> RugDoc Reviews
                </a>
              </div>
            </div>
          )}

          {modalData?.type === "sybil" && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-purple-400/10 border border-purple-400/30">
                  <p className="text-xs text-muted-foreground mb-1">Suspected Clusters</p>
                  <p className="text-3xl font-bold text-purple-400">{modalData.data.suspectedClusters}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Flagged Addresses</p>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(modalData.data.flaggedAddresses, 0)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-3">Recent Airdrop Analysis</h4>
                <div className="space-y-3">
                  {modalData.data.recentAirdrops.map((airdrop: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{airdrop.name}</span>
                        <Badge variant="outline" className="text-red-400 border-red-400/30">
                          {airdrop.sybilRate}% Sybils
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(airdrop.flagged, 0)} addresses flagged
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> What is a Sybil Attack?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sybil attacks involve creating multiple fake identities to manipulate systems. In crypto, this often means 
                  creating many wallets to farm airdrops or manipulate governance votes.
                </p>
              </div>
            </div>
          )}

          {modalData?.type === "fakeVolume" && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Real Volume Ratio</span>
                  <span className={cn(
                    "text-2xl font-bold",
                    modalData.data.realVolumeRatio > 70 ? "text-green-400" : 
                    modalData.data.realVolumeRatio > 40 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {modalData.data.realVolumeRatio}%
                  </span>
                </div>
                <Progress value={modalData.data.realVolumeRatio} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-red-400/10 border border-red-400/30">
                  <p className="text-xs text-muted-foreground mb-1">CEX Fake Volume</p>
                  <p className="text-2xl font-bold text-red-400">${formatNumber(modalData.data.cexFakeVolume)}</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-400/10 border border-orange-400/30">
                  <p className="text-xs text-muted-foreground mb-1">DEX Fake Volume</p>
                  <p className="text-2xl font-bold text-orange-400">${formatNumber(modalData.data.dexFakeVolume)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/10 border border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-3">Flagged Exchanges</h4>
                <div className="space-y-2">
                  {modalData.data.flaggedExchanges.map((ex: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm text-foreground">{ex.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={ex.fakePercentage} className="w-20 h-2 [&>div]:bg-red-400" />
                        <span className="text-red-400 text-sm font-medium">{ex.fakePercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {modalData?.type === "alert" && (
            <div className="space-y-4 py-4">
              <div className={cn(
                "p-4 rounded-lg border",
                getSeverityColor(modalData.data.severity)
              )}>
                <div className="flex items-center gap-3 mb-3">
                  {getSeverityIcon(modalData.data.severity)}
                  <Badge className={getSeverityColor(modalData.data.severity)}>
                    {modalData.data.severity.toUpperCase()} SEVERITY
                  </Badge>
                </div>
                <p className="text-lg text-foreground mb-2">{modalData.data.message}</p>
                <p className="text-sm text-muted-foreground">
                  Detected at: {new Date(modalData.data.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-medium text-foreground mb-2">Recommended Actions</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Verify the source and authenticity of the alert
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Check related transactions on the block explorer
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Review your exposure to affected tokens or protocols
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
