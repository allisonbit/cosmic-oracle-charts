import { useState, useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { TokenHeat } from "@/hooks/useChainData";
import { 
  TrendingUp, TrendingDown, Flame, ExternalLink, Search, Info, 
  BarChart3, Activity, DollarSign, Zap, Shield, Volume2, Users,
  Copy, ChevronRight, Filter, SortDesc, Eye, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TokenHeatScannerProps {
  chain: ChainConfig;
  tokenHeat: TokenHeat[] | undefined;
  isLoading: boolean;
}

interface TokenDetailData extends TokenHeat {
  heatLevel: string;
  heatScore: number;
}

export function EnhancedTokenHeatScanner({ chain, tokenHeat, isLoading }: TokenHeatScannerProps) {
  const [selectedToken, setSelectedToken] = useState<TokenDetailData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"heat" | "price" | "volume" | "momentum">("heat");

  const getHeatLevel = (token: TokenHeat) => {
    const score = (token.momentum + token.volumeSpike + token.socialScore) / 3;
    if (score > 70) return { level: "hot", score };
    if (score > 40) return { level: "warm", score };
    return { level: "cool", score };
  };

  const getHeatColor = (level: string) => {
    switch (level) {
      case "hot": return "danger";
      case "warm": return "warning";
      default: return "primary";
    }
  };

  const handleTokenClick = (token: TokenHeat) => {
    const heat = getHeatLevel(token);
    setSelectedToken({
      ...token,
      heatLevel: heat.level,
      heatScore: heat.score,
    });
    setModalOpen(true);
  };

  const filteredTokens = tokenHeat?.filter(token => 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTokens = useMemo(() => {
    if (!filteredTokens) return [];
    return [...filteredTokens].sort((a, b) => {
      switch (sortBy) {
        case "heat":
          return getHeatLevel(b).score - getHeatLevel(a).score;
        case "price":
          return b.price - a.price;
        case "volume":
          return b.volumeSpike - a.volumeSpike;
        case "momentum":
          return b.momentum - a.momentum;
        default:
          return 0;
      }
    });
  }, [filteredTokens, sortBy]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toExponential(2)}`;
  };

  const getRiskLevel = (token: TokenHeat) => {
    const heat = getHeatLevel(token);
    if (heat.level === "hot" && token.volatility > 80) return { level: "High", color: "text-danger" };
    if (heat.level === "warm" || token.volatility > 50) return { level: "Medium", color: "text-warning" };
    return { level: "Low", color: "text-success" };
  };

  const getSignalStrength = (token: TokenHeat) => {
    const score = token.momentum * 0.4 + token.volumeSpike * 0.3 + token.socialScore * 0.3;
    if (score > 75) return { strength: "Strong Buy", color: "text-success" };
    if (score > 50) return { strength: "Buy", color: "text-success/80" };
    if (score > 30) return { strength: "Hold", color: "text-warning" };
    return { strength: "Watch", color: "text-muted-foreground" };
  };

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-display text-foreground flex items-center gap-2">
            🔥 Enhanced Token Heat Scanner
            <Badge variant="outline" className="text-[10px] text-success border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse mr-1" />
              Live
            </Badge>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time momentum analysis on {chain.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-lg bg-muted/30 border border-border/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-28 sm:w-36"
            />
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30 border border-border/30">
            <SortDesc className="h-3 w-3 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent text-foreground focus:outline-none cursor-pointer"
            >
              <option value="heat">Heat Score</option>
              <option value="momentum">Momentum</option>
              <option value="volume">Volume</option>
              <option value="price">Price</option>
            </select>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <span>Hot</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Warm</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Cool</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-danger/10 border border-danger/30 text-center">
          <Flame className="h-4 w-4 text-danger mx-auto mb-1" />
          <p className="text-lg font-bold text-danger">{sortedTokens.filter(t => getHeatLevel(t).level === "hot").length}</p>
          <p className="text-[10px] text-muted-foreground">Hot</p>
        </div>
        <div className="p-2 rounded-lg bg-warning/10 border border-warning/30 text-center">
          <Activity className="h-4 w-4 text-warning mx-auto mb-1" />
          <p className="text-lg font-bold text-warning">{sortedTokens.filter(t => getHeatLevel(t).level === "warm").length}</p>
          <p className="text-[10px] text-muted-foreground">Warm</p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-center">
          <Target className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-primary">{sortedTokens.filter(t => getHeatLevel(t).level === "cool").length}</p>
          <p className="text-[10px] text-muted-foreground">Cool</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
          <BarChart3 className="h-4 w-4 text-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{sortedTokens.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-muted/20 animate-pulse" />
          ))
        ) : sortedTokens && sortedTokens.length > 0 ? (
          sortedTokens.map((token) => {
            const heat = getHeatLevel(token);
            const heatColor = getHeatColor(heat.level);
            const signal = getSignalStrength(token);

            return (
              <button
                key={token.symbol}
                onClick={() => handleTokenClick(token)}
                className={cn(
                  "relative p-3 sm:p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer group text-left w-full",
                  heat.level === "hot" && "border-danger/50 bg-danger/10",
                  heat.level === "warm" && "border-warning/50 bg-warning/10",
                  heat.level === "cool" && "border-primary/50 bg-primary/10"
                )}
                style={{
                  animation: heat.level === "hot" ? "pulse 2s ease-in-out infinite" : undefined,
                }}
              >
                {/* Glow effect */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                    heat.level === "hot" && "shadow-[0_0_30px_hsl(0_84%_60%/0.4)]",
                    heat.level === "warm" && "shadow-[0_0_30px_hsl(38_92%_50%/0.4)]",
                    heat.level === "cool" && "shadow-[0_0_30px_hsl(190_100%_50%/0.4)]"
                  )}
                />

                {/* Heat Score Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Badge variant="outline" className={cn(
                    "text-[8px] px-1.5 py-0",
                    heat.level === "hot" && "text-danger border-danger/30",
                    heat.level === "warm" && "text-warning border-warning/30",
                    heat.level === "cool" && "text-primary border-primary/30"
                  )}>
                    {heat.score.toFixed(0)}
                  </Badge>
                </div>

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <span className="font-display text-xs sm:text-sm text-foreground truncate">{token.symbol}</span>
                    {heat.level === "hot" && <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-danger animate-pulse flex-shrink-0" />}
                  </div>

                  {/* Price */}
                  <p className="text-sm sm:text-lg font-display text-foreground mb-0.5 sm:mb-1 truncate">
                    {formatPrice(token.price)}
                  </p>

                  {/* Change */}
                  <div className={cn(
                    "flex items-center gap-1 text-xs sm:text-sm mb-2",
                    token.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%</span>
                  </div>

                  {/* Signal */}
                  <div className={cn("text-[10px] font-medium", signal.color)}>
                    {signal.strength}
                  </div>

                  {/* Mini Metrics */}
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    <div className="text-center">
                      <div className={cn("h-1 rounded-full mb-0.5", heatColor === "danger" ? "bg-danger" : heatColor === "warning" ? "bg-warning" : "bg-primary")} 
                           style={{ width: `${token.momentum}%` }} />
                      <span className="text-[8px] text-muted-foreground">Mom</span>
                    </div>
                    <div className="text-center">
                      <div className={cn("h-1 rounded-full mb-0.5", heatColor === "danger" ? "bg-danger" : heatColor === "warning" ? "bg-warning" : "bg-primary")} 
                           style={{ width: `${token.volumeSpike}%` }} />
                      <span className="text-[8px] text-muted-foreground">Vol</span>
                    </div>
                    <div className="text-center">
                      <div className={cn("h-1 rounded-full mb-0.5", heatColor === "danger" ? "bg-danger" : heatColor === "warning" ? "bg-warning" : "bg-primary")} 
                           style={{ width: `${token.socialScore}%` }} />
                      <span className="text-[8px] text-muted-foreground">Soc</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
            No tokens found
          </div>
        )}
      </div>

      {/* External Links */}
      <div className="mt-4 pt-4 border-t border-border/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {chain.dexScreenerId && (
            <a href={`https://dexscreener.com/${chain.dexScreenerId}`} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-xs font-medium">
              <ExternalLink className="h-3 w-3" /> DexScreener
            </a>
          )}
          <a href={`https://www.geckoterminal.com/${chain.dexScreenerId || chain.id}`} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-colors text-xs">
            <ExternalLink className="h-3 w-3" /> GeckoTerminal
          </a>
          <a href={`https://dextools.io/app/en/${chain.dexScreenerId || chain.id}`} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-colors text-xs">
            <BarChart3 className="h-3 w-3" /> DexTools
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground">Click any token for detailed analysis</p>
      </div>

    </div>
  );
}
