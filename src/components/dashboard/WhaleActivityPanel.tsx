import { useState, useMemo } from "react";
import { 
  Fish, ArrowUpRight, ArrowDownRight, RefreshCw, ExternalLink, 
  AlertTriangle, Activity, TrendingUp, TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhaleTracker } from "@/hooks/useWhaleTracker";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function WhaleActivityPanel() {
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const { data, isLoading, error, refetch, isFetching } = useWhaleTracker(selectedChain);

  const formatValue = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatAmount = (amount: number, asset: string): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M ${asset}`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K ${asset}`;
    return `${amount.toFixed(2)} ${asset}`;
  };

  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px]">MED</Badge>;
      default:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px]">LOW</Badge>;
    }
  };

  const netflow = data?.netflow || 0;
  const inflow = data?.inflow || 0;
  const outflow = data?.outflow || 0;

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
            <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            WHALE ACTIVITY
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Real-time on-chain whale tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger className="h-7 w-24 text-xs bg-muted/50 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
              <SelectItem value="optimism">Optimism</SelectItem>
              <SelectItem value="base">Base</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isFetching && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-danger/10 border border-danger/20 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-danger" />
          <span className="text-[10px] text-danger">Failed to load. Showing estimates.</span>
        </div>
      )}

      {/* Netflow Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-muted/30 text-center">
          <div className="text-[10px] text-muted-foreground mb-0.5">Netflow 24h</div>
          <div className={cn("text-sm font-bold", netflow >= 0 ? 'text-success' : 'text-danger')}>
            {netflow >= 0 ? '+' : ''}{formatValue(netflow)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-danger/10 border border-danger/20 text-center">
          <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
            <ArrowDownRight className="w-2.5 h-2.5" />
            Inflow
          </div>
          <div className="text-sm font-bold text-danger">{formatValue(inflow)}</div>
        </div>
        <div className="p-2 rounded-lg bg-success/10 border border-success/20 text-center">
          <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
            <ArrowUpRight className="w-2.5 h-2.5" />
            Outflow
          </div>
          <div className="text-sm font-bold text-success">{formatValue(outflow)}</div>
        </div>
      </div>

      {/* Whale Movements */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <Skeleton className="w-12 h-5 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : (
          data?.transactions.slice(0, 8).map((tx, i) => (
            <div 
              key={tx.id || i}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0",
                tx.type === "buy" ? "bg-success/20 text-success" : 
                tx.type === "sell" ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"
              )}>
                {tx.type}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs flex items-center gap-1">
                  {formatAmount(tx.amount, tx.asset)}
                  {getImpactBadge(tx.impact)}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {tx.from} → {tx.to} • {getTimeAgo(tx.timestamp)}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={cn("font-medium text-xs flex items-center gap-0.5 justify-end", 
                  tx.type === "buy" ? "text-success" : tx.type === "sell" ? "text-danger" : "text-primary"
                )}>
                  {tx.type === "buy" ? <TrendingUp className="w-3 h-3" /> : 
                   tx.type === "sell" ? <TrendingDown className="w-3 h-3" /> : 
                   <Activity className="w-3 h-3" />}
                  {formatValue(tx.value)}
                </div>
                {tx.hash && (
                  <a 
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-primary/60 hover:text-primary flex items-center gap-0.5 justify-end"
                  >
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Data Source */}
      {data?.source && (
        <div className="mt-3 pt-2 border-t border-border text-[10px] text-muted-foreground/60 text-center">
          Data from {data.source === 'alchemy' ? 'Alchemy APIs' : 'estimates'} • 
          Updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
        </div>
      )}
    </div>
  );
}
