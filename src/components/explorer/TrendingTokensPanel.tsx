import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Flame, Zap, Rocket, 
  AlertTriangle, Clock, ExternalLink, ChevronRight, Eye, Loader2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SearchToken } from "@/hooks/useTokenSearch";
import { ExplorerChain } from "@/lib/explorerChains";
import { useTokenDiscovery, DiscoveryToken } from "@/hooks/useTokenDiscovery";

interface TrendingTokensPanelProps {
  chain: ExplorerChain;
  onTokenSelect: (token: SearchToken) => void;
}

function formatPrice(price: number): string {
  if (price === 0) return 'N/A';
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(0)}`;
}

export function TrendingTokensPanel({ chain, onTokenSelect }: TrendingTokensPanelProps) {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedToken, setSelectedToken] = useState<DiscoveryToken | null>(null);
  
  // Fetch real token discovery data
  const { data: discoveryData, isLoading, refetch, isRefetching } = useTokenDiscovery(chain.id, true);

  // Categorize tokens from real data
  const allTokens = discoveryData?.tokens || [];
  const trendingTokens = allTokens.filter(t => t.category === 'rising' || t.momentum > 60).slice(0, 10);
  const gainers = [...allTokens].filter(t => t.change24h > 0).sort((a, b) => b.change24h - a.change24h).slice(0, 10);
  const losers = [...allTokens].filter(t => t.change24h < 0).sort((a, b) => a.change24h - b.change24h).slice(0, 10);
  const newPairs = allTokens.filter(t => t.category === 'new' || t.volumeSpike > 50).slice(0, 10);

  const handleTokenClick = (token: DiscoveryToken) => {
    setSelectedToken(token);
  };

  const handleViewDetails = () => {
    if (selectedToken) {
      onTokenSelect({
        symbol: selectedToken.symbol,
        name: selectedToken.name,
        contractAddress: '',
        decimals: 18,
        chain: chain.id,
        price: selectedToken.price,
        coingeckoId: selectedToken.coingeckoId,
        logo: selectedToken.logo,
        change24h: selectedToken.change24h,
        verified: true,
      });
      setSelectedToken(null);
    }
  };

  const renderTokenRow = (token: DiscoveryToken, index: number) => (
    <button
      key={`${token.symbol}-${index}`}
      onClick={() => handleTokenClick(token)}
      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group"
    >
      <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
        {token.logo ? (
          <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full bg-muted" onError={(e) => (e.currentTarget.style.display = 'none')} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="font-display font-bold text-primary text-xs">{token.symbol[0]}</span>
          </div>
        )}
        <div className="text-left">
          <div className="font-medium text-sm">{token.symbol}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[100px]">{token.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-muted-foreground">MCap</div>
          <div className="text-xs">{formatNumber(token.marketCap)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{formatPrice(token.price)}</div>
          <div className={cn("text-xs flex items-center justify-end gap-0.5", 
            token.change24h >= 0 ? "text-success" : "text-danger"
          )}>
            {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );

  return (
    <div className="holo-card p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            {chain.name} TOKENS
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isRefetching ? "bg-warning" : "bg-success")} />
            Live
          </div>
        </div>

        <TabsList className="w-full grid grid-cols-4 h-auto mb-4">
          <TabsTrigger value="trending" className="text-xs py-2 gap-1">
            <Flame className="w-3 h-3" /> Hot
          </TabsTrigger>
          <TabsTrigger value="gainers" className="text-xs py-2 gap-1">
            <Rocket className="w-3 h-3" /> Gainers
          </TabsTrigger>
          <TabsTrigger value="losers" className="text-xs py-2 gap-1">
            <AlertTriangle className="w-3 h-3" /> Losers
          </TabsTrigger>
          <TabsTrigger value="new" className="text-xs py-2 gap-1">
            <Zap className="w-3 h-3" /> New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-2 mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : trendingTokens.length > 0 ? (
            trendingTokens.map((token, i) => renderTokenRow(token, i))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No trending tokens found</div>
          )}
        </TabsContent>

        <TabsContent value="gainers" className="space-y-2 mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : gainers.length > 0 ? (
            gainers.map((token, i) => renderTokenRow(token, i))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No gainers found</div>
          )}
        </TabsContent>

        <TabsContent value="losers" className="space-y-2 mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : losers.length > 0 ? (
            losers.map((token, i) => renderTokenRow(token, i))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No losers found</div>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-2 mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : newPairs.length > 0 ? (
            newPairs.map((token, i) => (
              <button
                key={`${token.symbol}-${i}`}
                onClick={() => handleTokenClick(token)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                  {token.logo ? (
                    <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full bg-muted" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-warning" />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-medium text-sm">{token.symbol}</div>
                    <div className="text-xs text-warning flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Vol Spike: {token.volumeSpike.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground">Vol</div>
                    <div className="text-xs">{formatNumber(token.volume24h)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatPrice(token.price)}</div>
                    <div className={cn("text-xs flex items-center justify-end gap-0.5", 
                      token.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                  </div>
                </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No high-activity tokens found</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Token Quick View Modal */}
      <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              {selectedToken?.symbol} - {selectedToken?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 gap-3">
                <div>
                  <div className="text-2xl font-bold">{formatPrice(selectedToken.price)}</div>
                  <div className={cn("flex items-center gap-1", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                    {selectedToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}% (24h)
                  </div>
                </div>
                {selectedToken.logo ? (
                  <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-12 h-12 rounded-full bg-muted" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-display font-bold text-primary text-xl">{selectedToken.symbol[0]}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">Market Cap</div>
                  <div className="font-bold">{formatNumber(selectedToken.marketCap)}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">24h Volume</div>
                  <div className="font-bold">{formatNumber(selectedToken.volume24h)}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">Momentum</div>
                  <div className="font-bold text-primary">{selectedToken.momentum.toFixed(0)}%</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">Volatility</div>
                  <div className="font-bold text-warning">{selectedToken.volatility.toFixed(0)}%</div>
                </div>
              </div>

              {selectedToken.coingeckoId && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">CoinGecko ID</div>
                  <code className="text-xs font-mono text-primary break-all">{selectedToken.coingeckoId}</code>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-1" onClick={() => window.open(`https://www.coingecko.com/en/coins/${selectedToken.coingeckoId}`, '_blank')}>
                  <ExternalLink className="w-4 h-4" /> CoinGecko
                </Button>
                <Button className="gap-1" onClick={handleViewDetails}>
                  <Eye className="w-4 h-4" /> Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
