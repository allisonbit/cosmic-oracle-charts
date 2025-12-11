import { ChainConfig } from "@/lib/chainConfig";
import { AlertTriangle, Shield, Eye, Skull, Users, Activity, AlertOctagon, CheckCircle, XCircle, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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

export function AnomalyDetection({ chain, anomalyData, isLoading }: AnomalyDetectionProps) {
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

  return (
    <div className="holo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/20">
          <Shield className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h3 className="font-display text-lg text-foreground">Anomaly Detection System</h3>
          <p className="text-sm text-muted-foreground">Real-time threat monitoring</p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="text-green-400 border-green-400/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
            Scanning Active
          </Badge>
        </div>
      </div>

      {/* Recent Alerts */}
      {anomalyData.recentAlerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Alerts</h4>
          <div className="space-y-2">
            {anomalyData.recentAlerts.slice(0, 3).map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                {getSeverityIcon(alert.severity)}
                <span className="flex-1 text-sm">{alert.message}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wash Trading Detection */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-400" />
            Wash Trading Detection
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Detected Pairs</span>
              <span className="text-2xl font-bold text-orange-400">{anomalyData.washTrading.detected}</span>
            </div>
            <div className="mb-4">
              <span className="text-xs text-muted-foreground">Est. Fake Volume (24h)</span>
              <div className="text-lg font-bold text-red-400">${formatNumber(anomalyData.washTrading.totalFakeVolume)}</div>
            </div>
            <div className="space-y-2">
              {anomalyData.washTrading.suspectedPairs.slice(0, 3).map((pair, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{pair.pair}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={pair.suspicionScore} className="w-16 h-1 [&>div]:bg-orange-400" />
                    <span className="text-orange-400 text-xs w-10 text-right">{pair.suspicionScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            MEV Bot Identification
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Identified Bots</span>
              <span className="text-2xl font-bold text-yellow-400">{anomalyData.mevBots.identified}</span>
            </div>
            <div className="mb-4">
              <span className="text-xs text-muted-foreground">24h Bot Activity</span>
              <div className="text-lg font-bold text-foreground">{formatNumber(anomalyData.mevBots.activity24h)} txns</div>
            </div>
            <div className="space-y-2">
              {anomalyData.mevBots.topBots.slice(0, 3).map((bot, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-xs">{bot.address.slice(0, 8)}...</span>
                    <Badge variant="outline" className="text-xs">{bot.type}</Badge>
                  </div>
                  <span className="text-green-400">${formatNumber(bot.profit24h)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rug Pull Warning System */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Skull className="h-4 w-4 text-red-400" />
          Rug Pull Early Warning
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">High Risk</span>
            </div>
            <div className="space-y-2">
              {anomalyData.rugPullWarning.highRisk.slice(0, 2).map((token, i) => (
                <div key={i} className="bg-background/40 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{token.token}</span>
                    <span className="text-xs text-red-400">{token.score}% risk</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{token.reasons[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Medium Risk</span>
            </div>
            <div className="space-y-2">
              {anomalyData.rugPullWarning.mediumRisk.slice(0, 2).map((token, i) => (
                <div key={i} className="bg-background/40 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{token.token}</span>
                    <span className="text-xs text-yellow-400">{token.score}% risk</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{token.reasons[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Recent Rugs</span>
            </div>
            <div className="space-y-2">
              {anomalyData.rugPullWarning.recentRugs.slice(0, 2).map((rug, i) => (
                <div key={i} className="bg-background/40 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{rug.token}</span>
                    <span className="text-xs text-red-400">-${formatNumber(rug.loss)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{rug.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sybil Detection & Fake Volume */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            Sybil Attack Detection
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
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
            <div className="text-xs text-muted-foreground mb-2">Recent Airdrop Analysis</div>
            <div className="space-y-2">
              {anomalyData.sybilDetection.recentAirdrops.map((airdrop, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{airdrop.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">{airdrop.sybilRate}% sybils</span>
                    <Badge variant="outline" className="text-xs">{formatNumber(airdrop.flagged, 0)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-cyan-400" />
            Fake Volume Detection
          </h4>
          <div className="bg-background/40 border border-border/30 rounded-lg p-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Real Volume Ratio</span>
                <span className={`font-medium ${anomalyData.fakeVolume.realVolumeRatio > 70 ? "text-green-400" : anomalyData.fakeVolume.realVolumeRatio > 40 ? "text-yellow-400" : "text-red-400"}`}>
                  {anomalyData.fakeVolume.realVolumeRatio}%
                </span>
              </div>
              <Progress value={anomalyData.fakeVolume.realVolumeRatio} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-muted-foreground block">CEX Fake Volume</span>
                <span className="text-lg font-bold text-red-400">${formatNumber(anomalyData.fakeVolume.cexFakeVolume)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">DEX Fake Volume</span>
                <span className="text-lg font-bold text-orange-400">${formatNumber(anomalyData.fakeVolume.dexFakeVolume)}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Flagged Exchanges</div>
            <div className="flex flex-wrap gap-2">
              {anomalyData.fakeVolume.flaggedExchanges.map((ex, i) => (
                <Badge key={i} variant="outline" className="text-xs text-red-400 border-red-400/30">
                  {ex.name}: {ex.fakePercentage}%
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}