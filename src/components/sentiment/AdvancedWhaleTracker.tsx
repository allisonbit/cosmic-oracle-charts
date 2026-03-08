import { useState } from "react";
import { 
  Waves, TrendingUp, TrendingDown, Clock, Target, ExternalLink, 
  Copy, Check, ChevronDown, DollarSign, Wallet, ArrowRight,
  Activity, Filter, RefreshCw, Globe, Star, BarChart3, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useWhaleTracker } from "@/hooks/useWhaleTracker";
import { Link } from "react-router-dom";

interface AdvancedWhaleTrackerProps {
  onRefresh?: () => void;
}

interface WhaleTier {
  name: string;
  color: string;
  minValue: number;
  accuracy: number;
}

const WHALE_TIERS: WhaleTier[] = [
  { name: 'Mega Whale', color: 'text-primary', minValue: 10000000, accuracy: 72 },
  { name: 'Large Whale', color: 'text-success', minValue: 1000000, accuracy: 65 },
  { name: 'Medium Whale', color: 'text-warning', minValue: 100000, accuracy: 58 },
  { name: 'Small Whale', color: 'text-muted-foreground', minValue: 50000, accuracy: 45 },
];

export function AdvancedWhaleTracker({ onRefresh }: AdvancedWhaleTrackerProps) {
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [copied, setCopied] = useState(false);
  
  const { data: whaleData, isLoading, refetch } = useWhaleTracker(selectedChain);

  const chains = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
    { id: 'optimism', name: 'Optimism', symbol: 'OP' },
    { id: 'base', name: 'Base', symbol: 'BASE' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhaleTier = (value: number): WhaleTier => {
    return WHALE_TIERS.find(tier => value >= tier.minValue) || WHALE_TIERS[WHALE_TIERS.length - 1];
  };

  const formatValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const transactions = whaleData?.transactions || [];
  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  const buyVolume = transactions.filter(tx => tx.type === 'buy').reduce((sum, tx) => sum + tx.value, 0);
  const sellVolume = transactions.filter(tx => tx.type === 'sell').reduce((sum, tx) => sum + tx.value, 0);
  const netFlow = whaleData?.netflow || (buyVolume - sellVolume);

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="holo-card p-4 text-center">
            <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-display font-bold">{transactions.length}</div>
            <div className="text-xs text-muted-foreground">Movements (24h)</div>
          </div>
          <div className="holo-card p-4 text-center">
            <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-success">{formatValue(buyVolume)}</div>
            <div className="text-xs text-muted-foreground">Accumulation</div>
          </div>
          <div className="holo-card p-4 text-center">
            <TrendingDown className="w-6 h-6 text-danger mx-auto mb-2" />
            <div className="text-2xl font-display font-bold text-danger">{formatValue(sellVolume)}</div>
            <div className="text-xs text-muted-foreground">Distribution</div>
          </div>
          <div className="holo-card p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2" />
            <div className={cn(
              "text-2xl font-display font-bold",
              netFlow >= 0 ? "text-success" : "text-danger"
            )}>
              {netFlow >= 0 ? '+' : ''}{formatValue(netFlow)}
            </div>
            <div className="text-xs text-muted-foreground">Net Flow</div>
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="holo-card p-4 md:p-6">
          <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            CAPITAL FLOW ANALYSIS
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-success">Exchange Outflow</span>
                <span className="text-sm font-bold text-success">{formatValue(buyVolume)}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${(buyVolume / (buyVolume + sellVolume || 1)) * 100}%` }}
                />
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-danger">Exchange Inflow</span>
                <span className="text-sm font-bold text-danger">{formatValue(sellVolume)}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-danger rounded-full transition-all"
                  style={{ width: `${(sellVolume / (buyVolume + sellVolume || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className={cn(
            "text-center p-3 rounded-lg",
            netFlow >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            <span className="font-bold">
              {netFlow >= 0 ? '📈 Accumulation Phase' : '📉 Distribution Phase'}
            </span>
            <span className="text-sm ml-2">
              ({netFlow >= 0 ? 'Bullish' : 'Bearish'} Signal)
            </span>
          </div>
        </div>

        {/* Chain Selector & Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {chains.map(chain => (
              <Button
                key={chain.id}
                variant={selectedChain === chain.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChain(chain.id)}
                className="whitespace-nowrap"
              >
                {chain.name}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['all', 'buy', 'sell'] as const).map(f => (
                <Button
                  key={f}
                  variant={filter === f ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize text-xs"
                >
                  {f === 'all' ? 'All' : f === 'buy' ? '🟢 Buys' : '🔴 Sells'}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="holo-card p-4 md:p-6">
          <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary" />
            LIVE WHALE TRANSACTIONS
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {whaleData?.source === 'alchemy' ? 'Live from Alchemy' : 'Real-time Data'}
            </span>
          </h2>

          <div className="space-y-3">
            {filteredTransactions.map((tx, i) => {
              const tier = getWhaleTier(tx.value);
              const isExpanded = expandedTx === tx.id;
              
              return (
                <div key={tx.id}>
                  <button
                    onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border flex items-center justify-between transition-all text-left group animate-fade-in",
                      tx.type === 'buy' ? "bg-success/10 border-success/30 hover:border-success" :
                      tx.type === 'sell' ? "bg-danger/10 border-danger/30 hover:border-danger" :
                      "bg-muted/30 border-border hover:border-primary/50"
                    )}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        tx.type === 'buy' ? "bg-success/20" : 
                        tx.type === 'sell' ? "bg-danger/20" : "bg-muted"
                      )}>
                        {tx.type === 'buy' ? 
                          <TrendingUp className="w-6 h-6 text-success" /> :
                          tx.type === 'sell' ?
                          <TrendingDown className="w-6 h-6 text-danger" /> :
                          <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold">{tx.asset}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded font-bold", tier.color, "bg-current/10")}>
                            {tier.name}
                          </span>
                          {tx.impact === 'high' && <Zap className="w-3 h-3 text-warning" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Wallet className="w-3 h-3" />
                          <span>{tx.from}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{tx.to}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {getTimeAgo(tx.timestamp)}
                          </span>
                          <span className={cn("flex items-center gap-1", tier.color)}>
                            <Star className="w-3 h-3" /> {tier.accuracy}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatValue(tx.value)}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.amount.toFixed(4)} {tx.asset}
                        </div>
                      </div>
                      <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 mt-2 mb-3 p-4 rounded-lg bg-muted/20 border border-border/30 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
                      <div className={cn("p-3 rounded-xl border text-center", tx.type === 'buy' ? "bg-success/10 border-success/30" : "bg-danger/10 border-danger/30")}>
                        <div className="text-2xl font-bold">{formatValue(tx.value)}</div>
                        <div className="text-sm text-muted-foreground">{tx.amount.toFixed(4)} {tx.asset}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">From</div><div className="text-sm truncate">{tx.from}</div></div>
                        <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">To</div><div className="text-sm truncate">{tx.to}</div></div>
                        <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Chain</div><div className="capitalize">{tx.chain}</div></div>
                        <div className="p-2 rounded bg-muted/30"><div className="text-xs text-muted-foreground">Tier Accuracy</div><div className={cn("font-bold", tier.color)}>{tier.accuracy}%</div></div>
                      </div>
                      {tx.hash && (
                        <div className="p-2 rounded bg-muted/30 flex items-center gap-2">
                          <code className="text-xs font-mono flex-1 truncate">{tx.hash}</code>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(tx.hash)}>
                            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      )}
                      <div className={cn("p-3 rounded-lg border text-sm", tx.type === 'buy' ? "bg-success/10 border-success/30" : "bg-danger/10 border-danger/30")}>
                        {tx.type === 'buy'
                          ? 'Exchange outflow suggests accumulation. Smart money moving to cold storage — typically bullish.'
                          : 'Exchange inflow suggests distribution. Large holders may be preparing to sell.'}
                      </div>
                      <Link to={`/price-prediction/${tx.asset.toLowerCase()}/daily`} className="block text-center text-sm text-primary hover:underline">
                        View {tx.asset} Prediction →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Waves className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No whale transactions found</p>
              </div>
            )}
          </div>
        </div>

        {/* External Links */}
        <div className="holo-card p-4 md:p-6">
          <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            WHALE INTELLIGENCE TOOLS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Whale Alert', url: 'https://whale-alert.io/', desc: 'Live whale transactions' },
              { name: 'Nansen', url: 'https://www.nansen.ai/', desc: 'Smart money tracking' },
              { name: 'Arkham', url: 'https://platform.arkhamintelligence.com/', desc: 'Wallet intelligence' },
              { name: 'DeBank', url: 'https://debank.com/', desc: 'DeFi portfolio tracker' },
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
    </>
  );
}
