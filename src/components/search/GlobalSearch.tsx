import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, TrendingUp, Zap, Layers, BarChart3, Wallet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTokenSearch, SearchToken } from "@/hooks/useTokenSearch";

interface SearchResult {
  type: 'token' | 'tool' | 'chain' | 'feature';
  title: string;
  symbol?: string;
  price?: string;
  change24h?: number;
  url: string;
  icon: React.ReactNode;
  description?: string;
}

// Static tools/features that can be searched
const staticSearchItems: SearchResult[] = [
  {
    type: 'tool',
    title: 'AI Price Predictions',
    description: 'Daily crypto forecasts',
    url: '/predictions',
    icon: <span className="text-primary">🤖</span>
  },
  {
    type: 'tool',
    title: 'Crypto Strength Meter',
    description: 'Real-time strength analysis',
    url: '/strength',
    icon: <Zap className="w-4 h-4 text-warning" />
  },
  {
    type: 'tool',
    title: 'Wallet Scanner',
    description: 'Analyze any wallet address',
    url: '/portfolio',
    icon: <Wallet className="w-4 h-4 text-success" />
  },
  {
    type: 'feature',
    title: 'Market Sentiment',
    description: 'Fear & Greed Index',
    url: '/sentiment',
    icon: <BarChart3 className="w-4 h-4 text-secondary" />
  },
  {
    type: 'chain',
    title: 'Ethereum Analytics',
    description: 'ETH gas fees, TVL, DeFi',
    url: '/chain/ethereum',
    icon: <span className="text-secondary">Ξ</span>
  },
  {
    type: 'chain',
    title: 'Solana Analytics',
    description: 'SOL blockchain data',
    url: '/chain/solana',
    icon: <span className="text-success">◎</span>
  },
  {
    type: 'chain',
    title: 'Bitcoin Analytics',
    description: 'BTC on-chain metrics',
    url: '/chain/bitcoin',
    icon: <span className="text-warning">₿</span>
  },
  {
    type: 'feature',
    title: 'Token Explorer',
    description: 'Search 1000+ tokens',
    url: '/explorer',
    icon: <Search className="w-4 h-4 text-primary" />
  },
  {
    type: 'feature',
    title: 'Crypto Factory',
    description: 'Events, news, narratives',
    url: '/factory',
    icon: <TrendingUp className="w-4 h-4 text-success" />
  },
  {
    type: 'feature',
    title: 'Dashboard',
    description: 'Market overview',
    url: '/dashboard',
    icon: <Layers className="w-4 h-4 text-primary" />
  },
];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Use token search hook for API-based token search
  const { data: tokenSearchData, isLoading } = useTokenSearch(query, 'ethereum');

  // Combine token results with static results
  const getResults = useCallback((): SearchResult[] => {
    const results: SearchResult[] = [];
    const searchQuery = query.toLowerCase().trim();

    if (searchQuery.length < 2) return [];

    // Add token results from API
    if (tokenSearchData?.tokens) {
      tokenSearchData.tokens.slice(0, 5).forEach((token: SearchToken) => {
        results.push({
          type: 'token',
          title: token.name,
          symbol: token.symbol,
          price: token.price ? `$${token.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : undefined,
          change24h: token.change24h,
          url: `/price-prediction/${token.coingeckoId || token.symbol.toLowerCase()}/daily`,
          icon: token.logo ? (
            <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {token.symbol.charAt(0)}
            </div>
          ),
        });
      });
    }

    // Add matching static results
    staticSearchItems.forEach((item) => {
      if (
        item.title.toLowerCase().includes(searchQuery) ||
        item.description?.toLowerCase().includes(searchQuery)
      ) {
        results.push(item);
      }
    });

    return results.slice(0, 10);
  }, [query, tokenSearchData]);

  const results = getResults();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].url);
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery("");
  };

  const typeLabels: Record<string, string> = {
    token: 'Token',
    tool: 'AI Tool',
    chain: 'Blockchain',
    feature: 'Feature',
  };

  const typeColors: Record<string, string> = {
    token: 'bg-primary/20 text-primary',
    tool: 'bg-success/20 text-success',
    chain: 'bg-warning/20 text-warning',
    feature: 'bg-secondary/20 text-secondary',
  };

  return (
    <div className="relative flex-1 max-w-md lg:max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tokens, tools, chains..."
          className="w-full py-2 pl-10 pr-8 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground text-sm transition-all"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          ref={resultsRef}
          className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-border">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Found {results.length} results
                </div>
              </div>
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.title}-${index}`}
                  onClick={() => handleResultClick(result.url)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 border-b border-border/50 last:border-b-0 transition-colors text-left",
                    index === selectedIndex
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                    typeColors[result.type]
                  )}>
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">
                      {result.title}
                      {result.symbol && (
                        <span className="text-muted-foreground ml-1">({result.symbol})</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {result.description || typeLabels[result.type]}
                    </div>
                  </div>
                  {result.type === 'token' && result.price && (
                    <div className="text-right">
                      <div className="font-semibold text-foreground text-sm">{result.price}</div>
                      {result.change24h !== undefined && (
                        <div className={cn(
                          "text-xs",
                          result.change24h >= 0 ? "text-success" : "text-danger"
                        )}>
                          {result.change24h >= 0 ? "+" : ""}{result.change24h.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )}
                  {result.type !== 'token' && (
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      typeColors[result.type]
                    )}>
                      {typeLabels[result.type]}
                    </span>
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="text-muted-foreground mb-2">No results for "{query}"</div>
              <div className="text-sm text-muted-foreground/70">
                Try: Bitcoin, Predictions, Solana, Wallet
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
