import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, TrendingUp, ChevronDown } from "lucide-react";
import { coingeckoFetch } from "@/lib/coingecko";
import { cn } from "@/lib/utils";

export interface SelectedToken {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface TokenSearchInputProps {
  onSelect: (token: SelectedToken) => void;
  selected: SelectedToken | null;
  label?: string;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
  large?: string;
  market_cap_rank?: number;
}

export function TokenSearchInput({
  onSelect,
  selected,
  label = "Select Token",
  placeholder = "Search by name, symbol, or contract...",
  className,
}: TokenSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const data = await coingeckoFetch<{ coins: SearchResult[] }>({
        path: "search",
        params: { query: query.trim() },
        ttlMs: 60_000,
      });
      setResults(
        (data?.coins ?? []).slice(0, 10).map((c: any) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol?.toUpperCase(),
          thumb: c.thumb,
          large: c.large,
          market_cap_rank: c.market_cap_rank,
        }))
      );
      setSearching(false);
    }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(async (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    setLoadingPrice(true);
    const data = await coingeckoFetch<Record<string, any>>({
      path: "simple/price",
      params: {
        ids: result.id,
        vs_currencies: "usd",
        include_24hr_change: true,
        include_market_cap: true,
      },
      ttlMs: 15_000,
    });
    setLoadingPrice(false);
    const p = data?.[result.id];
    onSelect({
      id: result.id,
      name: result.name,
      symbol: result.symbol,
      thumb: result.thumb,
      price: p?.usd ?? 0,
      change24h: p?.usd_24h_change ?? 0,
      marketCap: p?.usd_market_cap ?? 0,
    });
  }, [onSelect]);

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.001) return `$${p.toFixed(4)}`;
    return `$${p.toPrecision(4)}`;
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
          {label}
        </label>
      )}

      {selected && !open ? (
        <button
          type="button"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-full flex items-center gap-3 border border-border p-3 hover:border-primary/50 transition-all text-left"
        >
          {selected.thumb && <img src={selected.thumb} alt={`${selected.name} logo`} className="w-6 h-6" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{selected.name}</span>
              <span className="text-xs text-muted-foreground">{selected.symbol}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold">{loadingPrice ? "..." : formatPrice(selected.price)}</span>
              <span className={cn("font-bold", selected.change24h >= 0 ? "text-success" : "text-danger")}>
                {selected.change24h >= 0 ? "+" : ""}{selected.change24h.toFixed(1)}%
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-background border border-border pl-9 pr-8 py-3 text-sm focus:outline-none focus:border-primary transition-all"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg max-h-72 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0"
            >
              {r.thumb && <img src={r.thumb} alt={`${r.name} logo`} className="w-5 h-5" />}
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm">{r.name}</span>
                <span className="text-xs text-muted-foreground ml-1.5">{r.symbol}</span>
              </div>
              {r.market_cap_rank && (
                <span className="text-[10px] text-muted-foreground font-mono">#{r.market_cap_rank}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && !searching && results.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg p-4 text-center text-sm text-muted-foreground">
          No tokens found for "{query}"
        </div>
      )}

      {loadingPrice && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Fetching live price...
        </div>
      )}
    </div>
  );
}
