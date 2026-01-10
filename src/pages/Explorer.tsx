import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, Loader2, Globe, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useTokenSearch, SearchToken } from "@/hooks/useTokenSearch";
import { ChainSelector } from "@/components/explorer/ChainSelector";
import { SearchInput } from "@/components/explorer/SearchInput";
import { EnhancedTokenDetailPanel } from "@/components/explorer/EnhancedTokenDetailPanel";
import { TrendingTokensPanel } from "@/components/explorer/TrendingTokensPanel";
import { MarketStatsBar } from "@/components/explorer/MarketStatsBar";
import { TopTokensTable } from "@/components/explorer/TopTokensTable";
import { ALL_CHAINS, getChainById } from "@/lib/explorerChains";
import { ExplorerSchema, ExplorerSEOContent } from "@/components/seo";
import { InArticleAd } from "@/components/ads";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  if (num === 0) return '$0';
  if (num < 0.01) return `$${num.toFixed(6)}`;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPrice(price: number): string {
  if (price === 0) return 'N/A';
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

const ExplorerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [selectedToken, setSelectedToken] = useState<SearchToken | null>(null);
  
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const { data: searchResults, isLoading: searchLoading } = useTokenSearch(debouncedQuery, selectedChain);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allCoins = useMemo(() => marketData?.topCoins || [], [marketData]);
  
  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    selectedToken ? { 
      symbol: selectedToken.symbol, 
      price: selectedToken.price, 
      change24h: selectedToken.change24h,
      volume: 0 
    } : null,
    "coin_forecast",
    !!selectedToken && selectedToken.price > 0
  );

  const forecast = aiData?.forecast;
  const chainData = getChainById(selectedChain) || ALL_CHAINS[0];

  const popularTokens = useMemo(() => allCoins.slice(0, 8), [allCoins]);
  const isSearching = searchQuery.length >= 2;
  const hasResults = searchResults?.tokens && searchResults.tokens.length > 0;

  const handleChainDetected = (chainId: string) => {
    if (chainId && chainId !== selectedChain) {
      setSelectedChain(chainId);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedToken(null);
  };

  const handleTokenSelect = (token: SearchToken) => {
    setSelectedToken(token);
    setSearchQuery("");
  };

  return (
    <Layout>
      <ExplorerSchema chainCount={ALL_CHAINS.length} />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">
            <span className="glow-text">UNIVERSAL</span> <span className="text-gradient-cosmic">TOKEN EXPLORER</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl mx-auto">
            Search any token across 30+ blockchains by contract address, name, symbol, or ENS domain
          </p>
        </div>

        {/* Chain Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <ChainSelector 
            selectedChain={selectedChain} 
            onChainSelect={(chainId) => {
              setSelectedChain(chainId);
              setSelectedToken(null);
            }} 
          />
          <span className="text-xs text-muted-foreground">
            {ALL_CHAINS.length} chains supported
          </span>
        </div>

        {/* Search Input */}
        <div className="max-w-3xl mx-auto mb-10">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={handleClearSearch}
            isLoading={searchLoading}
            onDetectedChain={handleChainDetected}
          />
          
          {/* Popular Tokens */}
          {!isSearching && !selectedToken && (
            <div className="flex flex-wrap gap-2 mt-6 sm:mt-8 justify-center">
              <span className="text-[10px] sm:text-xs text-muted-foreground mr-1 sm:mr-2">Popular:</span>
              {popularTokens.map((token) => (
                <Button
                  key={token.symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(token.symbol)}
                  className="text-[10px] sm:text-xs touch-target tap-highlight-none active:scale-95 px-2 sm:px-3"
                >
                  {token.symbol}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        {isSearching && !selectedToken && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                {searchLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching across {chainData.name}...
                  </span>
                ) : (
                  `Found ${searchResults?.tokens?.length || 0} results for "${debouncedQuery}"`
                )}
              </h3>
              
              {!searchLoading && hasResults && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {searchResults.tokens.map((token, idx) => (
                    <button
                      key={`${token.contractAddress || token.symbol}-${idx}`}
                      onClick={() => handleTokenSelect(token)}
                      className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border active:border-primary/50 transition-all text-left active:scale-[0.98] touch-target tap-highlight-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {token.logo ? (
                            <img 
                              src={token.logo} 
                              alt={token.symbol} 
                              className="w-10 h-10 rounded-full bg-muted"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="font-display font-bold text-primary">{token.symbol[0]}</span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-display font-bold text-primary">{token.symbol}</span>
                              {token.verified && <BadgeCheck className="w-3 h-3 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{token.name}</p>
                            {token.contractAddress && (
                              <p className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-[120px]">
                                {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatPrice(token.price)}</p>
                          {token.change24h !== 0 && (
                            <p className={cn("text-xs font-bold flex items-center justify-end gap-0.5", 
                              token.change24h >= 0 ? "text-success" : "text-danger"
                            )}>
                              {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                            </p>
                          )}
                          {token.rank && (
                            <p className="text-[10px] text-muted-foreground">#{token.rank}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {!searchLoading && !hasResults && debouncedQuery.length >= 2 && (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No tokens found for "{debouncedQuery}"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try a different search term or check other chains
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Token Detail Panel */}
        {selectedToken && !isSearching && (
          <div className="max-w-6xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="mb-4"
            >
              ← Back to search
            </Button>
            <EnhancedTokenDetailPanel 
              token={selectedToken} 
              chain={chainData}
              forecast={forecast}
              aiLoading={aiLoading}
            />
          </div>
        )}

        {/* Default View - DexScreener-like Layout */}
        {!selectedToken && !isSearching && !marketLoading && (
          <div className="space-y-6">
            <MarketStatsBar chain={chainData} />
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TrendingTokensPanel chain={chainData} onTokenSelect={handleTokenSelect} />
              </div>
              <div className="lg:col-span-2">
                <TopTokensTable chain={chainData} onTokenSelect={handleTokenSelect} />
              </div>
            </div>
          </div>
        )}

        {marketLoading && !isSearching && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground font-display">Loading market data...</p>
            </div>
          </div>
        )}

        {/* SEO Content Block */}
        {!selectedToken && !isSearching && !marketLoading && (
          <>
            <InArticleAd className="my-8" />
            <ExplorerSEOContent />
          </>
        )}
      </div>
    </Layout>
  );
};

export default ExplorerPage;
