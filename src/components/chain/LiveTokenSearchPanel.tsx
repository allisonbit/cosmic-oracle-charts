import { useState, useCallback } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { Search, ExternalLink, Copy, TrendingUp, TrendingDown, Coins, CheckCircle, Activity, BarChart3, DollarSign, Flame, ChevronRight, RefreshCw, Droplets, ArrowUpDown, Clock, Loader2, X, Zap, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveTokenSearch, useTrendingTokens, LiveToken } from "@/hooks/useLiveTokenSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveTokenSearchPanelProps {
  chain: ChainConfig;
}

export function LiveTokenSearchPanel({ chain }: LiveTokenSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<LiveToken | null>(null);
  const [activeTab, setActiveTab] = useState("trending");

  const { data: searchResults, isLoading: isSearching, refetch: refetchSearch } = useLiveTokenSearch(searchQuery, chain.id);
  const { data: trendingData, isLoading: isTrendingLoading, refetch: refetchTrending } = useTrendingTokens(chain.id, 50);

  const tokens = searchQuery.length >= 2 ? (searchResults?.tokens || []) : (trendingData?.tokens || []);
  const isLoading = searchQuery.length >= 2 ? isSearching : isTrendingLoading;

  const copyAddress = useCallback((address: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Address copied!");
    setTimeout(() => setCopiedAddress(null), 2000);
  }, []);

  const formatNumber = (num: number | undefined) => {
    if (!num) return "$0";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return "$0.00";
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toExponential(2)}`;
  };

  const formatCompact = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getDexScreenerUrl = (token: LiveToken) => {
    const chainMapping: Record<string, string> = {
      ethereum: "ethereum",
      polygon: "polygon",
      arbitrum: "arbitrum",
      avalanche: "avalanche",
      optimism: "optimism",
      base: "base",
      bnb: "bsc",
      solana: "solana",
    };
    const dexChain = chainMapping[token.chain] || chainMapping[chain.id] || chain.id;
    if (token.pairAddress) {
      return `https://dexscreener.com/${dexChain}/${token.pairAddress}`;
    }
    if (token.contractAddress) {
      return `https://dexscreener.com/${dexChain}/${token.contractAddress}`;
    }
    return `https://dexscreener.com/${dexChain}`;
  };

  const getExplorerUrl = (token: LiveToken) => {
    if (!token.contractAddress) return chain.explorerUrl;
    return `${chain.explorerUrl}/token/${token.contractAddress}`;
  };

  return (
    <>
      <div className="holo-card p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, hsl(${chain.color} / 0.3), hsl(${chain.color} / 0.1))` }}>
              <Coins className="h-6 w-6" style={{ color: `hsl(${chain.color})` }} />
            </div>
            <div>
              <h3 className="text-lg font-display text-foreground flex items-center gap-2">
                {chain.name} Token Explorer
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  LIVE
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Search any token by name, symbol, or contract address</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
            Live
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, symbol, or paste contract address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-muted/20 border-border/50 h-12 text-base"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/40 rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            {searchQuery.length >= 2 
              ? `${tokens.length} results for "${searchQuery}"`
              : `${tokens.length} trending tokens on ${chain.name}`
            }
          </p>
          {!searchQuery && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Flame className="h-3 w-3" />
              Trending Now
            </div>
          )}
        </div>

        {/* Token List */}
        <ScrollArea className="h-[500px]">
          {isLoading && tokens.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {searchQuery.length >= 2 
                  ? `No tokens found for "${searchQuery}" on ${chain.name}`
                  : "Start typing to search tokens..."
                }
              </p>
              <p className="text-xs mt-1">Try searching by token name, symbol, or contract address</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tokens.map((token, i) => (
                <button
                  key={`${token.contractAddress || token.symbol}-${i}`}
                  onClick={() => setSelectedToken(token)}
                  className="w-full p-3 rounded-xl bg-muted/10 border border-border/30 hover:bg-muted/20 hover:border-primary/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Token Icon */}
                    <div className="relative">
                      {token.logo ? (
                        <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-display text-sm text-primary">{token.symbol.slice(0, 2)}</span>
                        </div>
                      )}
                      {token.verified && (
                        <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-success bg-background rounded-full" />
                      )}
                    </div>

                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-foreground">{token.symbol}</span>
                        {token.isTrending && <Flame className="h-3 w-3 text-warning" />}
                        {token.rank && token.rank <= 100 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">#{token.rank}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                    </div>

                    {/* Price & Change */}
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatPrice(token.price)}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1 text-xs",
                        token.change24h >= 0 ? "text-success" : "text-danger"
                      )}>
                        {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {token.change24h >= 0 ? "+" : ""}{token.change24h?.toFixed(2)}%
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="text-center">
                        <p className="text-foreground font-medium">{formatNumber(token.volume24h)}</p>
                        <p>Vol</p>
                      </div>
                      {token.liquidity && (
                        <div className="text-center">
                          <p className="text-foreground font-medium">{formatNumber(token.liquidity)}</p>
                          <p>Liq</p>
                        </div>
                      )}
                      {token.txns24h && (
                        <div className="text-center">
                          <p className="text-foreground font-medium">{formatCompact(token.txns24h)}</p>
                          <p>Txns</p>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
          <a
            href={`https://dexscreener.com/${chain.dexScreenerId || chain.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs"
          >
            DexScreener <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={`https://www.geckoterminal.com/${chain.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs"
          >
            GeckoTerminal <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={`https://defillama.com/chain/${chain.defiLlamaId || chain.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs"
          >
            DeFi Llama <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Token Detail Modal */}
      <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DialogContent className="sm:max-w-xl bg-background/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedToken?.logo ? (
                <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-display text-lg text-primary">{selectedToken?.symbol.slice(0, 2)}</span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-display">{selectedToken?.symbol}</span>
                  {selectedToken?.verified && (
                    <Badge variant="outline" className="text-[10px] text-success border-success/30">
                      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Verified
                    </Badge>
                  )}
                  {selectedToken?.rank && (
                    <Badge variant="outline" className="text-[10px]">#{selectedToken.rank}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-normal">{selectedToken?.name}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedToken && (
            <div className="space-y-5 py-4">
              {/* Price Section */}
              <div className="flex items-end justify-between p-4 rounded-xl bg-muted/10 border border-border/30">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                  <p className="text-3xl font-display text-foreground">{formatPrice(selectedToken.price)}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                    selectedToken.change24h >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                  )}>
                    {selectedToken.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-medium">{selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h?.toFixed(2)}%</span>
                    <span className="text-xs opacity-70">24h</span>
                  </div>
                  {selectedToken.change1h !== undefined && (
                    <div className={cn(
                      "flex items-center justify-end gap-1 text-xs",
                      selectedToken.change1h >= 0 ? "text-success" : "text-danger"
                    )}>
                      <Clock className="h-3 w-3" />
                      {selectedToken.change1h >= 0 ? "+" : ""}{selectedToken.change1h.toFixed(2)}% 1h
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs">Volume 24h</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{formatNumber(selectedToken.volume24h)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs">Market Cap</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{formatNumber(selectedToken.marketCap)}</p>
                </div>
                {selectedToken.liquidity && (
                  <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Droplets className="h-4 w-4" />
                      <span className="text-xs">Liquidity</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{formatNumber(selectedToken.liquidity)}</p>
                  </div>
                )}
                {selectedToken.txns24h !== undefined && (
                  <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-xs">Transactions 24h</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{formatCompact(selectedToken.txns24h)}</p>
                  </div>
                )}
                {selectedToken.buys24h !== undefined && selectedToken.sells24h !== undefined && (
                  <>
                    <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                      <div className="flex items-center gap-2 text-success mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Buys 24h</span>
                      </div>
                      <p className="text-lg font-semibold text-success">{formatCompact(selectedToken.buys24h)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                      <div className="flex items-center gap-2 text-danger mb-1">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs">Sells 24h</span>
                      </div>
                      <p className="text-lg font-semibold text-danger">{formatCompact(selectedToken.sells24h)}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Contract Address */}
              {selectedToken.contractAddress && (
                <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-2">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-foreground bg-muted/30 px-2 py-1 rounded flex-1 truncate font-mono">
                      {selectedToken.contractAddress}
                    </code>
                    <button
                      onClick={(e) => copyAddress(selectedToken.contractAddress, e)}
                      className="p-2 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      {copiedAddress === selectedToken.contractAddress ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Chain & DEX Info */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {selectedToken.chain || chain.id}
                </Badge>
                {selectedToken.dexId && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedToken.dexId}
                  </Badge>
                )}
                {selectedToken.quoteToken && (
                  <Badge variant="outline" className="text-xs">
                    Pair: {selectedToken.quoteToken}
                  </Badge>
                )}
              </div>

              {/* Action Links */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={getDexScreenerUrl(selectedToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-sm font-medium"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Chart
                </a>
                <a
                  href={getExplorerUrl(selectedToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Explorer
                </a>
              </div>

              {/* More Links */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.geckoterminal.com/${chain.id}/pools/${selectedToken.pairAddress || selectedToken.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs"
                >
                  <ExternalLink className="h-3 w-3" /> GeckoTerminal
                </a>
                <a
                  href={`https://dextools.io/app/en/${chain.id}/pair-explorer/${selectedToken.pairAddress || selectedToken.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs"
                >
                  <ExternalLink className="h-3 w-3" /> DexTools
                </a>
                {selectedToken.coingeckoId && (
                  <a
                    href={`https://www.coingecko.com/en/coins/${selectedToken.coingeckoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-all text-xs"
                  >
                    <ExternalLink className="h-3 w-3" /> CoinGecko
                  </a>
                )}
                <a
                  href={`https://tokensniffer.com/token/${chain.id}/${selectedToken.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/20 text-warning hover:bg-warning/30 transition-all text-xs"
                >
                  <Zap className="h-3 w-3" /> Audit Score
                </a>
              </div>

              <p className="text-[10px] text-center text-muted-foreground">
                Always verify contract addresses before trading. Not financial advice.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
