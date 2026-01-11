import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, Globe, Coins, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGlobalTokenSearch, GlobalToken } from "@/hooks/useGlobalTokenSearch";
import { cn } from "@/lib/utils";

interface GlobalTokenSearchProps {
  onSelect: (token: GlobalToken) => void;
  onSearchResults: (tokens: GlobalToken[]) => void;
  placeholder?: string;
}

export function GlobalTokenSearch({ onSelect, onSearchResults, placeholder }: GlobalTokenSearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { searchTokens, searchResults, isSearching, clearSearch } = useGlobalTokenSearch();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        const results = await searchTokens(query);
        onSearchResults(results);
        setShowDropdown(true);
      } else if (query.length === 0) {
        clearSearch();
        onSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchTokens, clearSearch, onSearchResults]);

  const handleSelect = (token: GlobalToken) => {
    onSelect(token);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery('');
    clearSearch();
    onSearchResults([]);
    setShowDropdown(false);
  };

  const isContractSearch = query.startsWith('0x') || query.length > 30;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search any token globally (name, symbol, or contract address)..."}
          className="pl-10 pr-20 bg-muted/50 border-border/50 focus:border-primary/50"
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {query && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Type Indicator */}
      {query.length >= 2 && (
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {isContractSearch ? (
            <>
              <FileText className="w-3 h-3" />
              Searching by contract address across all chains...
            </>
          ) : (
            <>
              <Globe className="w-3 h-3" />
              Searching globally by name/symbol...
            </>
          )}
        </div>
      )}

      {/* Dropdown Results */}
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto bg-background border border-border rounded-lg shadow-xl">
          <div className="p-2 border-b border-border/50 text-xs text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {searchResults.length} tokens found
            </span>
            <span>Click to add to predictions</span>
          </div>
          {searchResults.slice(0, 15).map((token, idx) => (
            <button
              key={`${token.id}-${idx}`}
              onClick={() => handleSelect(token)}
              className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between border-b border-border/20 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-sm">{token.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="uppercase">{token.symbol}</span>
                    {token.chain && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                        {token.chain}
                      </Badge>
                    )}
                    {token.rank && token.rank <= 500 && (
                      <span className="text-primary">#{token.rank}</span>
                    )}
                  </div>
                </div>
              </div>
              {token.price && token.price > 0 && (
                <div className="text-right">
                  <div className="font-mono text-sm">
                    ${token.price >= 1 ? token.price.toFixed(2) : token.price.toPrecision(4)}
                  </div>
                  {token.change24h !== undefined && (
                    <div className={cn("text-xs", token.change24h >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
          {searchResults.length > 15 && (
            <div className="p-2 text-center text-xs text-muted-foreground">
              +{searchResults.length - 15} more results
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {showDropdown && query.length >= 2 && !isSearching && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-background border border-border rounded-lg shadow-xl text-center">
          <div className="text-muted-foreground text-sm">No tokens found</div>
          <div className="text-xs text-muted-foreground mt-1">
            Try a different name, symbol, or paste a contract address
          </div>
        </div>
      )}
    </div>
  );
}
