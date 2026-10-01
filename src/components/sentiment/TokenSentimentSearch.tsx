import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Loader2, TrendingUp, TrendingDown, Activity, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TokenIcon } from "@/components/ui/token-icon";
import { useNavigate } from "react-router-dom";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

// ── Token Sentiment Scanner (standalone) ─────────────────────────────────────
// Previously proxied a Supabase edge function that fanned out to DexScreener.
// Standalone, it searches the live price set (top 250 by market cap) locally
// and derives each token's sentiment from REAL metrics: 24h change, position
// inside the 24h high/low range, and volume-to-marketcap turnover. Nothing
// fabricated; if a metric is missing it simply isn't scored.

interface LiveCoin {
  symbol: string;
  name: string;
  id: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h?: number;
  low24h?: number;
  image?: string;
  rank?: number;
}

interface SentimentResult {
  token: LiveCoin;
  sentiment: {
    overall: number;
    rangePosition: number | null; // where price sits in the 24h range (0-100)
    turnover: number;             // volume / marketCap ratio (%)
    momentum: string;
  };
}

export function TokenSentimentSearch() {
  const navigate = useNavigate();
  const { data: pricesData, isLoading: pricesLoading } = useCryptoPrices();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allCoins: LiveCoin[] = useMemo(() => (pricesData?.prices ?? []).map(p => ({
    symbol: p.symbol,
    name: p.name,
    id: p.symbol.toLowerCase(),
    price: p.price,
    change24h: p.change24h,
    volume24h: p.volume24h,
    marketCap: p.marketCap,
    high24h: p.high24h,
    low24h: p.low24h,
    image: p.image,
    rank: p.rank,
  })), [pricesData]);

  const results = useMemo<SentimentResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const matches = allCoins
      .filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      .slice(0, 10);

    return matches.map(token => {
      // Range position: 0 = at 24h low, 100 = at 24h high. Null when unknown.
      const rangePosition =
        token.high24h && token.low24h && token.high24h > token.low24h
          ? Math.round(((token.price - token.low24h) / (token.high24h - token.low24h)) * 100)
          : null;
      const turnover = token.marketCap > 0 ? (token.volume24h / token.marketCap) * 100 : 0;

      // Overall score blends real, available signals: direction (±24h change),
      // range position, and turnover strength (capped — 20%+ is very hot).
      const changeScore = token.change24h > 5 ? 85 : token.change24h > 0 ? 65 : token.change24h > -5 ? 40 : 20;
      const rangeScore = rangePosition ?? 50;
      const turnoverScore = Math.min(100, (turnover / 20) * 100);
      const overall = Math.round(changeScore * 0.45 + rangeScore * 0.35 + turnoverScore * 0.2);

      return {
        token,
        sentiment: {
          overall,
          rangePosition,
          turnover,
          momentum: token.change24h > 3 ? "BULLISH" : token.change24h < -3 ? "BEARISH" : "NEUTRAL",
        },
      };
    });
  }, [query, allCoins]);

  useEffect(() => {
    if (query.trim().length >= 2 && results.length > 0) setShowDropdown(true);
    if (query.trim().length < 2) setShowDropdown(false);
  }, [query, results]);

  const getSentimentColor = (score: number) =>
    score >= 65 ? "text-success" : score >= 45 ? "text-warning" : "text-danger";

  const getSentimentBg = (score: number) =>
    score >= 65 ? "border-success" : score >= 45 ? "border-warning" : "border-danger";

  const getSentimentLabel = (score: number) =>
    score >= 75 ? "Very Bullish" : score >= 60 ? "Bullish" : score >= 45 ? "Neutral" : score >= 30 ? "Bearish" : "Very Bearish";

  const formatPrice = (p: number) =>
    p >= 1 ? `$${(p ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${(p ?? 0).toPrecision(4)}`;

  const formatVol = (v: number) =>
    v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${(v ?? 0).toFixed(0)}`;

  return (
    <div className="border-t border-border/30 pt-5 mb-6" ref={containerRef}>
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-primary" />
        <h3 className="section-label">Token Sentiment Scanner</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-mono">Live</span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a token by name or symbol (BTC, SOL, PEPE...)"
          className="pl-10 pr-10 bg-background/50 border-border/50 font-mono text-sm"
        />
        {pricesLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
        {!pricesLoading && query && (
          <button onClick={() => { setQuery(""); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 z-50 border border-border rounded-lg bg-card shadow-xl max-h-[420px] overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No token matches “{query}” in the live top-250 set.
            </p>
          ) : (
            results.map(({ token, sentiment }) => (
              <button
                key={token.symbol}
                onClick={() => {
                  navigate(`/price-prediction/${token.symbol.toLowerCase()}/daily`);
                  setShowDropdown(false);
                  setQuery("");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b border-border/40 last:border-b-0"
              >
                <TokenIcon coinId={token.id} symbol={token.symbol} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{token.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{token.symbol}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono">{formatPrice(token.price)}</span>
                    <span className={cn("font-medium", token.change24h >= 0 ? "text-success" : "text-danger")}>
                      {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                    </span>
                    {sentiment.rangePosition !== null && (
                      <span className="hidden sm:inline">Range pos: {sentiment.rangePosition}%</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={cn("text-sm font-bold", getSentimentColor(sentiment.overall))}>
                    {getSentimentLabel(sentiment.overall)}
                  </div>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    <div className={cn("w-16 h-1.5 rounded-full border overflow-hidden", getSentimentBg(sentiment.overall))}>
                      <div
                        className={cn("h-full", sentiment.overall >= 65 ? "bg-success" : sentiment.overall >= 45 ? "bg-warning" : "bg-danger")}
                        style={{ width: `${sentiment.overall}%` }}
                      />
                    </div>
                    <span className={cn("text-[10px] font-mono w-7", getSentimentColor(sentiment.overall))}>{sentiment.overall}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Hint */}
      <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
        <ArrowDownUp className="w-3 h-3" />
        Sentiment blends real signals: 24h direction, position in the 24h range, and volume turnover.
      </p>
    </div>
  );
}
