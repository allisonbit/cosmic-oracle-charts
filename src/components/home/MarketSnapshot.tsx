import { TrendingUp, TrendingDown, Flame, Zap, ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { useMarketData } from "@/hooks/useMarketData";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";
import { CoinImage } from "@/components/ui/CoinImage";
import { SITE_URL } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

// CoinGecko-style "lead with live data" snapshot — the homepage centerpiece.
// Live top-coins table + trending + Fear & Greed + gainers/losers, all from real
// hooks. Also emits the live-prices ItemList JSON-LD (the only schema that needs
// client data), tagged data-schema="route-dynamic" so it never collides with the
// static/prerendered site schema.

function fmtUsd(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return "—";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function fmtPrice(p: number): string {
  if (!p) return "—";
  if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(4)}`;
}

// Build an accurate prediction link: prefer the CoinGecko id, fall back to symbol.
function coinHref(coin: { id?: string; symbol: string }): string {
  return `/price-prediction/${(coin.id || coin.symbol).toLowerCase()}/daily`;
}

function MoverRow({ coin, positive }: { coin: CryptoPrice; positive: boolean }) {
  return (
    <Link
      to={coinHref(coin)}
      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors group/row"
    >
      <div className="flex items-center gap-2 min-w-0">
        <CoinImage symbol={coin.symbol} image={coin.image} size={24} />
        <div className="min-w-0">
          <div className="font-bold text-sm text-foreground group-hover/row:text-primary transition-colors">
            {coin.symbol}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[90px]">{coin.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm font-medium text-foreground">{fmtPrice(coin.price)}</div>
        <div
          className={cn(
            "text-xs font-medium flex items-center justify-end gap-0.5 mt-0.5",
            positive ? "text-success" : "text-danger"
          )}
        >
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? "+" : ""}
          {coin.change24h.toFixed(2)}%
        </div>
      </div>
    </Link>
  );
}

export function MarketSnapshot() {
  const { data: marketData } = useMarketData();
  const { data: pricesData } = useCryptoPrices();

  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 8) || [], [marketData]);
  const trending = useMemo(() => marketData?.trending?.slice(0, 5) || [], [marketData]);
  const global = marketData?.global;
  const fearGreed = marketData?.fearGreedIndex ?? null;

  const { gainers, losers } = useMemo(() => {
    const prices = pricesData?.prices || [];
    if (!prices.length) return { gainers: [], losers: [] };
    const sorted = [...prices].sort((a, b) => b.change24h - a.change24h);
    return { gainers: sorted.slice(0, 4), losers: sorted.slice(-4).reverse() };
  }, [pricesData]);

  // Live-prices ItemList JSON-LD — scoped tag so route changes can clean it up
  // without touching the static site schema.
  useEffect(() => {
    const prices = pricesData?.prices || [];
    if (!prices.length) return;
    document.querySelectorAll('script[data-schema="home-itemlist"]').forEach((el) => el.remove());

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Live Cryptocurrency Prices",
      description: "Real-time cryptocurrency prices and 24h change",
      numberOfItems: Math.min(prices.length, 20),
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: prices.slice(0, 20).map((coin, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "FinancialProduct",
          name: coin.name,
          description: `${coin.symbol} live price and AI forecast`,
          url: `${SITE_URL}${coinHref(coin)}`,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", "home-itemlist");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-schema="home-itemlist"]').forEach((el) => el.remove());
    };
  }, [pricesData]);

  return (
    <section className="py-10 md:py-14 relative" aria-labelledby="market-snapshot-heading">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-success font-bold text-xs tracking-widest uppercase">Live Market Data</span>
            </div>
            <h2 id="market-snapshot-heading" className="text-2xl md:text-3xl font-display font-bold">
              The Crypto Market <span className="text-gradient-cosmic">at a Glance</span>
            </h2>
          </div>
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0 group"
          >
            Full Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
          {/* Top coins table */}
          <div className="lg:col-span-2 holo-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="font-display text-base md:text-lg font-bold">Top Coins by Market Cap</h3>
              <Link to="/explorer" className="text-[10px] md:text-xs text-primary hover:underline ml-auto">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="text-muted-foreground text-[10px] md:text-xs font-display border-b border-border">
                    <th className="text-left py-2 px-1 md:px-2">#</th>
                    <th className="text-left py-2 px-1 md:px-2">Coin</th>
                    <th className="text-right py-2 px-1 md:px-2">Price</th>
                    <th className="text-right py-2 px-1 md:px-2">24h</th>
                    <th className="text-right py-2 px-1 md:px-2 hidden sm:table-cell">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {topCoins.length > 0
                    ? topCoins.map((coin) => (
                        <tr key={coin.symbol} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                          <td className="py-3 px-1 md:px-2 text-muted-foreground text-xs md:text-sm">{coin.rank}</td>
                          <td className="py-3 px-1 md:px-2">
                            <Link to={coinHref(coin)} className="flex items-center gap-2">
                              <CoinImage symbol={coin.symbol} image={coin.image} size={22} />
                              <span className="font-display font-bold text-primary text-xs md:text-sm">{coin.symbol}</span>
                              <span className="text-muted-foreground text-[10px] md:text-sm hidden sm:inline">{coin.name}</span>
                              {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 md:w-4 md:h-4 text-warning" />}
                            </Link>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-right font-medium text-xs md:text-sm">{fmtPrice(coin.price)}</td>
                          <td
                            className={cn(
                              "py-3 px-1 md:px-2 text-right font-medium text-xs md:text-sm",
                              coin.change24h >= 0 ? "text-success" : "text-danger"
                            )}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {coin.change24h >= 0 ? "+" : ""}
                              {(coin.change24h ?? 0).toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-right text-muted-foreground text-xs md:text-sm hidden sm:table-cell">
                            {fmtUsd(coin.volume)}
                          </td>
                        </tr>
                      ))
                    : Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td colSpan={5} className="py-3 px-2">
                            <div className="h-6 w-full bg-muted animate-pulse rounded" />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right rail: trending + market stats + fear & greed */}
          <div className="space-y-5 md:space-y-6">
            <div className="holo-card p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-warning" />
                <h3 className="font-display font-bold text-sm md:text-base">Trending</h3>
              </div>
              <div className="space-y-2.5">
                {trending.length > 0 ? (
                  trending.map((coin, index) => (
                    <Link
                      key={coin.symbol}
                      to={`/price-prediction/${coin.symbol.toLowerCase()}/daily`}
                      className="flex items-center justify-between hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs md:text-sm w-4">{index + 1}</span>
                        <span className="font-display font-bold text-primary text-xs md:text-sm">{coin.symbol}</span>
                      </div>
                      <span className={cn("font-medium text-xs md:text-sm", coin.priceChange >= 0 ? "text-success" : "text-danger")}>
                        {coin.priceChange >= 0 ? "+" : ""}
                        {coin.priceChange?.toFixed(1) || "0"}%
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-5 w-full bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="holo-card p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-secondary" />
                <h3 className="font-display font-bold text-sm md:text-base">Market Sentiment</h3>
              </div>
              {fearGreed !== null ? (
                <>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                      style={{ width: `${fearGreed}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] md:text-sm">
                    <span className="text-muted-foreground">Fear &amp; Greed</span>
                    <span
                      className={cn(
                        "font-bold",
                        fearGreed >= 60 ? "text-success" : fearGreed >= 40 ? "text-warning" : "text-danger"
                      )}
                    >
                      {fearGreed} · {fearGreed >= 60 ? "Greed" : fearGreed >= 40 ? "Neutral" : "Fear"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-3 bg-muted animate-pulse rounded-full" />
              )}
              {global && (
                <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Market Cap</div>
                    <div className="font-bold text-foreground">{fmtUsd(global.totalMarketCap)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">BTC Dom.</div>
                    <div className="font-bold text-primary">{(global.btcDominance ?? 0).toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gainers / Losers */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 mt-5 md:mt-6">
          <div className="holo-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-success/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <h3 className="font-display text-base font-bold">Top Gainers (24h)</h3>
            </div>
            <div className="space-y-1">
              {gainers.length > 0
                ? gainers.map((coin) => <MoverRow key={coin.symbol} coin={coin} positive />)
                : Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
            </div>
          </div>
          <div className="holo-card p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-danger/10 rounded-lg">
                <TrendingDown className="w-4 h-4 text-danger" />
              </div>
              <h3 className="font-display text-base font-bold">Top Losers (24h)</h3>
            </div>
            <div className="space-y-1">
              {losers.length > 0
                ? losers.map((coin) => <MoverRow key={coin.symbol} coin={coin} positive={false} />)
                : Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
