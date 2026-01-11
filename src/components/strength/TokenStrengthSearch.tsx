import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  X, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/hooks/useStrengthMeter";

interface TokenStrengthSearchProps {
  allAssets: StrengthData[];
}

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  strengthScore: number;
  priceChange24h: number;
  source: 'local' | 'api';
}

export function TokenStrengthSearch({ allAssets }: TokenStrengthSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Local search from existing assets
  const localResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return allAssets
      .filter(a => 
        a.symbol.toLowerCase().includes(q) || 
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      )
      .map(a => ({ ...a, source: 'local' as const }))
      .slice(0, 5);
  }, [query, allAssets]);

  // Search external API for tokens not in local list
  const searchExternalTokens = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Check if it looks like a contract address
      const isAddress = searchQuery.startsWith('0x') && searchQuery.length >= 10;
      
      let searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      const coins = data.coins || [];
      
      // Get price data for found coins
      const results: SearchResult[] = await Promise.all(
        coins.slice(0, 8).map(async (coin: any) => {
          try {
            const priceRes = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_24hr_change=true`
            );
            const priceData = await priceRes.json();
            const change = priceData[coin.id]?.usd_24h_change || 0;
            
            // Calculate synthetic strength score
            const strengthScore = Math.min(100, Math.max(0, 50 + change * 2));
            
            return {
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol.toUpperCase(),
              logo: coin.large || coin.thumb || 'https://via.placeholder.com/32',
              strengthScore: Math.round(strengthScore),
              priceChange24h: change,
              source: 'api' as const,
            };
          } catch {
            return {
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol.toUpperCase(),
              logo: coin.large || coin.thumb || 'https://via.placeholder.com/32',
              strengthScore: 50,
              priceChange24h: 0,
              source: 'api' as const,
            };
          }
        })
      );
      
      // Filter out local results
      const localIds = new Set(localResults.map(r => r.id));
      setApiResults(results.filter(r => !localIds.has(r.id)));
    } catch (error) {
      console.error('Token search error:', error);
      setApiResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchExternalTokens(query);
      } else {
        setApiResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const allResults = [...localResults, ...apiResults];
  const getStrengthColor = (score: number) => {
    if (score >= 55) return 'text-success';
    if (score >= 45) return 'text-warning';
    return 'text-danger';
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="w-5 h-5 text-primary" />
          Token Strength Search
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search any token by name, symbol, or contract address
        </p>
      </CardHeader>
      <CardContent>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search BTC, Ethereum, 0x..."
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setApiResults([]);
                setHasSearched(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mt-4 space-y-2">
          {isSearching && (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Searching tokens...
            </div>
          )}

          {!isSearching && allResults.length > 0 && (
            allResults.map((result) => (
              <Link 
                key={result.id} 
                to={`/price-prediction/${result.id}/daily`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <img 
                    src={result.logo} 
                    alt={result.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{result.symbol}</span>
                      {result.source === 'api' && (
                        <Badge variant="outline" className="text-xs">External</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{result.name}</p>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-lg font-bold", getStrengthColor(result.strengthScore))}>
                      {result.strengthScore}
                    </div>
                    <div className={cn(
                      "text-xs flex items-center justify-end gap-0.5",
                      result.priceChange24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {result.priceChange24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {result.priceChange24h >= 0 ? '+' : ''}{result.priceChange24h.toFixed(2)}%
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))
          )}

          {!isSearching && hasSearched && allResults.length === 0 && query.length >= 2 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No tokens found for "{query}"</p>
              <p className="text-xs mt-1">Try a different name, symbol, or contract address</p>
            </div>
          )}

          {query.length > 0 && query.length < 2 && (
            <p className="text-center py-4 text-muted-foreground text-sm">
              Type at least 2 characters to search
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
