import { useState } from "react";
import { 
  Waves, TrendingUp, TrendingDown, Clock, AlertTriangle, 
  BarChart3, Target, ExternalLink, Copy, Check, ChevronRight,
  Activity, DollarSign, Wallet, Eye, Filter, RefreshCw, Info,
  ArrowUpRight, ArrowDownRight, Globe, Search, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WhaleAlert {
  symbol: string;
  type: "accumulation" | "distribution";
  amount: string;
  time: string;
  volume?: number;
  price?: number;
  change24h?: number;
  txHash?: string;
  fromWallet?: string;
  toWallet?: string;
  exchange?: string;
  usdValue?: number;
}

interface EnhancedWhaleTrackerProps {
  whaleAlerts: WhaleAlert[];
}

export function EnhancedWhaleTracker({ whaleAlerts }: EnhancedWhaleTrackerProps) {
  const [selectedAlert, setSelectedAlert] = useState<WhaleAlert | null>(null);
  const [filter, setFilter] = useState<'all' | 'accumulation' | 'distribution'>('all');
  const [copied, setCopied] = useState(false);

  const accumulationCount = whaleAlerts.filter(w => w.type === "accumulation").length;
  const distributionCount = whaleAlerts.filter(w => w.type === "distribution").length;
  const totalVolume = whaleAlerts.reduce((sum, w) => sum + (w.volume || 0), 0);

  const filteredAlerts = whaleAlerts.filter(a => 
    filter === 'all' || a.type === filter
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const generateMockTxHash = () => `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
  const generateMockWallet = () => `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`;

  const getWhaleInsight = (alert: WhaleAlert) => {
    if (alert.type === "accumulation") {
      return {
        title: "Bullish Signal Detected",
        description: "Large wallets are accumulating this asset. This often indicates smart money positioning before an upward move.",
        action: "Monitor for price breakout confirmation. Consider this a potential entry signal.",
        risk: "medium"
      };
    }
    return {
      title: "Distribution Pattern",
      description: "Whales are moving assets to exchanges or selling. This could signal upcoming selling pressure.",
      action: "Exercise caution with new entries. Consider tightening stop-losses on existing positions.",
      risk: "high"
    };
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="holo-card p-5 text-center">
          <Waves className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-3xl font-display font-bold">{whaleAlerts.length}</div>
          <div className="text-xs text-muted-foreground">Active Movements</div>
          <div className="mt-2 text-xs text-primary">Last 24 hours</div>
        </div>
        <div className="holo-card p-5 text-center hover:border-success/50 transition-colors cursor-pointer" onClick={() => setFilter('accumulation')}>
          <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
          <div className="text-3xl font-display font-bold text-success">{accumulationCount}</div>
          <div className="text-xs text-muted-foreground">Accumulation Events</div>
          <div className="mt-2 text-xs text-success flex items-center justify-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Bullish signals
          </div>
        </div>
        <div className="holo-card p-5 text-center hover:border-danger/50 transition-colors cursor-pointer" onClick={() => setFilter('distribution')}>
          <TrendingDown className="w-8 h-8 text-danger mx-auto mb-2" />
          <div className="text-3xl font-display font-bold text-danger">{distributionCount}</div>
          <div className="text-xs text-muted-foreground">Distribution Events</div>
          <div className="mt-2 text-xs text-danger flex items-center justify-center gap-1">
            <ArrowDownRight className="w-3 h-3" /> Bearish signals
          </div>
        </div>
        <div className="holo-card p-5 text-center">
          <DollarSign className="w-8 h-8 text-warning mx-auto mb-2" />
          <div className="text-3xl font-display font-bold">${(totalVolume / 1e9).toFixed(1)}B</div>
          <div className="text-xs text-muted-foreground">Total Volume Tracked</div>
          <div className="mt-2 text-xs text-muted-foreground">Across all alerts</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'accumulation', 'distribution'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === 'all' ? 'All Alerts' : f}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </div>

      {/* Whale Alerts List */}
      <div className="holo-card p-6">
        <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          LIVE WHALE ALERTS
          <span className="ml-auto text-xs text-muted-foreground">{filteredAlerts.length} alerts</span>
        </h2>
        <div className="space-y-3">
          {filteredAlerts.map((alert, i) => {
            const mockTxHash = generateMockTxHash();
            const mockFromWallet = generateMockWallet();
            const mockToWallet = generateMockWallet();
            const insight = getWhaleInsight(alert);
            
            return (
              <button 
                key={`${alert.symbol}-${i}`}
                onClick={() => setSelectedAlert({
                  ...alert,
                  txHash: mockTxHash,
                  fromWallet: mockFromWallet,
                  toWallet: mockToWallet,
                  usdValue: parseFloat(alert.amount.replace('B', '')) * 1e9
                })}
                className={cn(
                  "w-full p-4 rounded-lg border flex items-center justify-between animate-fade-in text-left transition-all group",
                  alert.type === "accumulation" ? "bg-success/10 border-success/30 hover:border-success/50" : "bg-danger/10 border-danger/30 hover:border-danger/50"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    alert.type === "accumulation" ? "bg-success/20" : "bg-danger/20"
                  )}>
                    {alert.type === "accumulation" ? 
                      <TrendingUp className="w-6 h-6 text-success" /> : 
                      <TrendingDown className="w-6 h-6 text-danger" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-lg">{alert.symbol}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded font-bold",
                        alert.type === "accumulation" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                      )}>
                        {alert.type.toUpperCase()}
                      </span>
                      {Math.abs(parseFloat(alert.amount.replace('B', ''))) > 2 && (
                        <Zap className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Large {alert.type === "accumulation" ? "buy" : "sell"} detected • {insight.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> {mockFromWallet}
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> {mockToWallet}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-bold text-lg">${alert.amount}</div>
                    <div className="text-xs text-muted-foreground">{alert.time}</div>
                    {alert.change24h !== undefined && (
                      <div className={cn("text-xs", alert.change24h >= 0 ? "text-success" : "text-danger")}>
                        {alert.change24h >= 0 ? "+" : ""}{alert.change24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* External Links */}
      <div className="holo-card p-6">
        <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-primary" />
          WHALE TRACKING TOOLS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Whale Alert', url: 'https://whale-alert.io/', desc: 'Live whale transactions' },
            { name: 'WhaleMap', url: 'https://whalemap.io/', desc: 'On-chain whale analytics' },
            { name: 'Nansen', url: 'https://www.nansen.ai/', desc: 'Smart money tracking' },
            { name: 'Arkham', url: 'https://platform.arkhamintelligence.com/', desc: 'Wallet intelligence' },
            { name: 'Etherscan Whales', url: 'https://etherscan.io/accounts', desc: 'Top ETH holders' },
            { name: 'DeBank', url: 'https://debank.com/', desc: 'DeFi portfolio tracker' },
            { name: 'CryptoQuant', url: 'https://cryptoquant.com/', desc: 'Exchange flows' },
            { name: 'Glassnode', url: 'https://glassnode.com/', desc: 'On-chain metrics' },
          ].map(link => (
            <Button
              key={link.name}
              variant="outline"
              className="flex flex-col items-start h-auto p-3 gap-1"
              onClick={() => window.open(link.url, '_blank')}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-medium">{link.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{link.desc}</span>
            </Button>
          ))}
        </div>
      </div>

    </div>
  );
}
