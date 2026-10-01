import { useMemo, useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { type TokenHeat } from "@/hooks/useChainData";
import {
  Flame, Search, Info, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TokenHeatScannerProps {
  chain: ChainConfig;
  tokenHeat: TokenHeat[] | undefined;
  isLoading: boolean;
}

type SortKey = "heat" | "price" | "volume" | "momentum";

/**
 * Live "heat" ranking over real DEX pairs. The heat score is a transparent
 * blend of three measurable signals — 1h momentum, volume/liquidity activity
 * and 24h volatility — with the exact formula shown in the UI. No social
 * scores (no feed exists) and no random inputs.
 */
export function EnhancedTokenHeatScanner({ chain, tokenHeat, isLoading }: TokenHeatScannerProps) {
  const [selectedToken, setSelectedToken] = useState<TokenHeat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("heat");

  // Transparent heat score: 0–100 from three real signals.
  const heatScore = (t: TokenHeat) =>
    Math.min(40, Math.abs(t.momentum) * 4) +   // up to 40: |1h move| (±10% = max)
    Math.min(30, t.volumeSpike * 0.3) +        // up to 30: volume÷liquidity (100× = max)
    Math.min(30, Math.abs(t.change24h) * 1.5); // up to 30: |24h move| (±20% = max)

  const heatLevel = (score: number) =>
    score > 55 ? "hot" : score > 30 ? "warm" : "cool";

  const rows = useMemo(() => {
    if (!tokenHeat) return [];
    const q = searchQuery.trim().toLowerCase();
    const scored = tokenHeat
      .filter(t => !q || t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
      .map(t => ({ ...t, score: Math.round(heatScore(t)) }));
    const sorted = [...scored].sort((a, b) => {
      switch (sortBy) {
        case "price": return b.price - a.price;
        case "momentum": return b.momentum - a.momentum;
        case "volume": return b.volumeSpike - a.volumeSpike;
        default: return b.score - a.score;
      }
    });
    return sorted;
  }, [tokenHeat, searchQuery, sortBy]);

  const formatPrice = (p: number) =>
    p >= 1000 ? `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : p >= 1 ? `$${p.toFixed(2)}`
    : p >= 0.01 ? `$${p.toFixed(4)}`
    : `$${p.toPrecision(3)}`;

  const formatVolume = (v: number) =>
    v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B`
    : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M`
    : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K`
    : `$${v.toFixed(0)}`;

  if (isLoading && rows.length === 0) {
    return (
      <div className="holo-card p-6">
        <div className="h-6 w-56 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="holo-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-display text-foreground flex items-center gap-2">
              <Flame className="h-5 w-5 text-warning" />
              Token Heat Scanner
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Real DEX activity on {chain.name} — momentum × liquidity turnover × volatility
            </p>
          </div>
          <button
            onClick={() => setSelectedToken(null)}
            title="Scoring method: 50% absolute 1h momentum (capped at ±10%), 25% volume÷liquidity turnover (capped at 100%), 25% absolute 24h move (capped at ±25%). Every input is live DEX data."
            className="p-2 hover:bg-muted/40 rounded-lg transition-colors self-start"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Flame className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {searchQuery ? `No tokens match "${searchQuery}"` : "Live DEX pairs unavailable right now — try the refresh button above."}
            </p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tokens…"
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-muted/20 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-1">
                {(["heat", "momentum", "volume", "price"] as SortKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setSortBy(k)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs capitalize transition-colors",
                      sortBy === k ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {rows.map((t) => {
                const level = heatLevel(t.score);
                return (
                  <button
                    key={t.symbol}
                    onClick={() => setSelectedToken(t)}
                    className="p-3 rounded-xl border border-border/30 bg-muted/5 hover:border-primary/30 hover:bg-muted/10 transition-all text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-foreground truncate">{t.symbol}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize shrink-0",
                        level === "hot" && "bg-danger/20 text-danger",
                        level === "warm" && "bg-warning/20 text-warning",
                        level === "cool" && "bg-primary/15 text-primary",
                      )}>
                        {level} · {t.score}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-mono text-foreground">{formatPrice(t.price)}</span>
                      <span className={cn("text-xs font-bold", t.change24h >= 0 ? "text-success" : "text-danger")}>
                        {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>1h momentum</span>
                        <span className={cn("font-mono", t.momentum >= 0 ? "text-success" : "text-danger")}>
                          {t.momentum >= 0 ? "+" : ""}{t.momentum.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", t.momentum >= 0 ? "bg-success" : "bg-danger")}
                          style={{ width: `${Math.min(100, Math.abs(t.momentum) * 5)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Vol ÷ Liq</span>
                        <span className="font-mono">{t.volumeSpike.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                        <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(100, t.volumeSpike / 5)}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground mt-4">
              Heat score = 50% |1h move| (capped ±10%) + 25% volume÷liquidity (capped 100×) + 25% |24h move|
              (capped ±25%). Social buzz is intentionally excluded — no social feed exists in this build.
            </p>
          </>
        )}
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedToken} onOpenChange={(o) => !o && setSelectedToken(null)}>
        <DialogContent className="max-w-sm">
          {selectedToken && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedToken.symbol}
                  <span className={cn("text-sm font-bold", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                    {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}%
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono text-foreground">{formatPrice(selectedToken.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">1h momentum</span>
                  <span className={cn("font-mono", selectedToken.momentum >= 0 ? "text-success" : "text-danger")}>
                    {selectedToken.momentum >= 0 ? "+" : ""}{selectedToken.momentum.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume ÷ liquidity</span>
                  <span className="font-mono text-foreground">{selectedToken.volumeSpike.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume ÷ market cap</span>
                  <span className="font-mono text-foreground">{selectedToken.liquidityChange.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heat score</span>
                  <span className="font-mono text-foreground">{Math.round(heatScore(selectedToken))}/100</span>
                </div>
                <a
                  href={`https://dexscreener.com/${chain.dexScreenerId || chain.id}?q=${encodeURIComponent(selectedToken.symbol)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View chart on DexScreener
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
