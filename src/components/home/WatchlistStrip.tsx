import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Star, RefreshCw } from "lucide-react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useWatchlist, watchlistAdd, watchlistRemove } from "@/lib/watchlist";
import { CoinImage } from "@/components/ui/CoinImage";
import { cn } from "@/lib/utils";

function fmt(p: number) {
  if (!p) return "—";
  if (p >= 1000) return `$${Math.round(p).toLocaleString("en-US")}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(4)}`;
}

export function WatchlistStrip() {
  const watchlist = useWatchlist();
  const { data, isLoading } = useCryptoPrices();
  const [adding, setAdding] = useState(false);

  // Watchlist stores CoinGecko ids ("bitcoin") while prices are keyed by
  // symbol — index by lowercase symbol AND lowercase name so "bitcoin"→Bitcoin
  // resolves. A few ids differ from both (binancecoin→BNB): alias them.
  const ID_ALIASES: Record<string, string> = { binancecoin: "bnb", ripple: "xrp" };
  const priceMap = useMemo(() => {
    const m = new Map<string, { price: number; change24h: number; image?: string; name: string; symbol: string; id: string }>();
    (data?.prices ?? []).forEach(p => {
      const entry = { price: p.price, change24h: p.change24h, image: p.image, name: p.name, symbol: p.symbol, id: p.symbol.toLowerCase() };
      m.set(p.symbol.toLowerCase(), entry);
      m.set(p.name.toLowerCase(), entry);
    });
    return m;
  }, [data?.prices]);

  const resolve = (id: string) => priceMap.get(id) ?? priceMap.get(ID_ALIASES[id] ?? "");

  const tiles = watchlist.map(id => {
    const hit = resolve(id);
    return { id, sym: hit?.symbol ?? id.toUpperCase(), ...(hit ?? { price: 0, change24h: 0, image: undefined, name: id }) };
  });

  // Coins that can be added (top 24 by rank not already on the list).
  const addable = (data?.prices ?? [])
    .filter(p => !watchlist.includes(p.symbol.toLowerCase()))
    .slice(0, 24);

  return (
    <section aria-label="Your watchlist" className="border-b border-border/30 bg-muted/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-label flex items-center gap-1.5">
            <Star className="w-3 h-3 text-warning" />
            Your Watchlist
          </h2>
          <button
            onClick={() => setAdding(a => !a)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            {adding ? "Done" : "Add coins"}
          </button>
        </div>

        {tiles.length === 0 && (
          <p className="text-xs text-muted-foreground py-3">
            Nothing tracked yet — add a few coins to build your personal front page.
          </p>
        )}

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {tiles.map(t => (
            <Link
              key={t.id}
              to={`/price-prediction/${t.id}/daily`}
              className="group relative shrink-0 w-[150px] rounded-lg border border-border/50 bg-card px-3 py-2.5 hover:border-primary/40 transition-colors"
            >
              <button
                aria-label={`Remove ${t.sym}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); watchlistRemove(t.id); }}
                className="absolute -top-1.5 -right-1.5 hidden group-hover:grid place-items-center w-4.5 h-4.5 w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <CoinImage symbol={t.sym} image={t.image} size={18} />
                <span className="text-xs font-bold">{t.sym}</span>
              </div>
              {t.price > 0 ? (
                <>
                  <p className="text-sm font-display font-bold leading-none">{fmt(t.price)}</p>
                  <p className={cn("text-[10px] font-semibold mt-1", t.change24h >= 0 ? "text-success" : "text-danger")}>
                    {t.change24h >= 0 ? "▲" : "▼"} {Math.abs(t.change24h).toFixed(2)}%
                  </p>
                </>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> loading…
                </p>
              )}
            </Link>
          ))}
        </div>

        {adding && (
          <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
            {addable.map(p => (
              <button
                key={p.symbol}
                onClick={() => watchlistAdd(p.symbol.toLowerCase())}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <CoinImage symbol={p.symbol} image={p.image} size={14} />
                {p.symbol}
                <Plus className="w-3 h-3 text-primary" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
