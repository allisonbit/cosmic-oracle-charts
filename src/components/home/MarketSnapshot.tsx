import { TrendingUp, TrendingDown, Flame, Zap, ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { useMarketData } from "@/hooks/useMarketData";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";
import { CoinImage } from "@/components/ui/CoinImage";
import { SITE_URL } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

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

function coinHref(coin: { id?: string; symbol: string }): string {
  return `/price-prediction/${(coin.id || coin.symbol).toLowerCase()}/daily`;
}

function MoverRow({ coin, positive }: { coin: CryptoPrice; positive: boolean }) {
  return (
    <Link
      to={coinHref(coin)}
      className="editorial-row group"
    >
      <CoinImage symbol={coin.symbol} image={coin.image} size={22} />
      <div className="flex-1 min-w-0">
        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
          {coin.symbol}
        </span>
        <span className="text-xs text-muted-foreground ml-2 truncate hidden sm:inline">{coin.name}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-mono text-sm font-medium">{fmtPrice(coin.price)}</div>
        <div className={cn("text-xs font-medium flex items-center justify-end gap-0.5 mt-0.5", positive ? "text-success" : "text-danger")}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? "+" : ""}{coin.change24h.toFixed(2)}%
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
    <section className="py-10 md:py-14" aria-labelledby="market-snapshot-heading">
      <div className="container mx-auto px-4">
        <div className="section-header mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="section-label">Live Market Data</span>
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

        <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
          {/* Top coins table */}
          <div className="lg:col-span-2">
            <div className="section-header mb-3">
              <span className="section-label flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary" />
                Top by Market Cap
              </span>
              <Link to="/explorer" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-2 px-1 md:px-2 section-label">#</th>
                    <th className="text-left py-2 px-1 md:px-2 section-label">Coin</th>
                    <th className="text-right py-2 px-1 md:px-2 section-label">Price</th>
                    <th className="text-right py-2 px-1 md:px-2 section-label">24h</th>
                    <th className="text-right py-2 px-1 md:px-2 section-label hidden sm:table-cell">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {topCoins.length > 0
                    ? topCoins.map((coin) => (
                        <tr key={coin.symbol} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-1 md:px-2 text-muted-foreground text-xs md:text-sm">{coin.rank}</td>
                          <td className="py-3 px-1 md:px-2">
                            <Link to={coinHref(coin)} className="flex items-center gap-2">
                              <CoinImage symbol={coin.symbol} image={coin.image} size={22} />
                              <span className="font-bold text-primary text-xs md:text-sm">{coin.symbol}</span>
                              <span className="text-muted-foreground text-[10px] md:text-sm hidden sm:inline">{coin.name}</span>
                              {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 text-warning" />}
                            </Link>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-right font-mono text-xs md:text-sm">{fmtPrice(coin.price)}</td>
                          <td className={cn("py-3 px-1 md:px-2 text-right font-medium text-xs md:text-sm", coin.change24h >= 0 ? "text-success" : "text-danger")}>
                            <div className="flex items-center justify-end gap-1">
                              {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {coin.change24h >= 0 ? "+" : ""}{(coin.change24h ?? 0).toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-3 px-1 md:px-2 text-right text-muted-foreground text-xs md:text-sm hidden sm:table-cell">
                            {fmtUsd(coin.volume)}
                          </td>
                        </tr>
                      ))
                    : Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td colSpan={5} className="py-3 px-2">
                            <div className="h-5 w-full bg-muted animate-pulse rounded" />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right rail: trending + sentiment */}
          <div className="space-y-8">
            <div>
              <div className="section-header mb-3">
                <span className="section-label flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-warning" />
                  Trending
                </span>
              </div>
              {trending.length > 0 ? (
                <div>
                  {trending.map((coin, index) => (
                    <Link
                      key={coin.symbol}
                      to={`/price-prediction/${coin.symbol.toLowerCase()}/daily`}
                      className="editorial-row group"
                    >
                      <span className="text-muted-foreground text-xs w-4 flex-shrink-0">{index + 1}</span>
                      <span className="font-bold text-primary text-sm flex-1">{coin.symbol}</span>
                      <span className={cn("font-medium text-sm", coin.priceChange >= 0 ? "text-success" : "text-danger")}>
                        {coin.priceChange >= 0 ? "+" : ""}{coin.priceChange?.toFixed(1) || "0"}%
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-5 w-full bg-muted animate-pulse rounded" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="section-header mb-3">
                <span className="section-label flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-secondary" />
                  Market Sentiment
                </span>
              </div>
              {fearGreed !== null ? (
                <>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                      style={{ width: `${fearGreed}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Fear &amp; Greed</span>
                    <span className={cn("font-bold", fearGreed >= 60 ? "text-success" : fearGreed >= 40 ? "text-warning" : "text-danger")}>
                      {fearGreed} · {fearGreed >= 60 ? "Greed" : fearGreed >= 40 ? "Neutral" : "Fear"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-2 bg-muted animate-pulse rounded-full" />
              )}
              {global && (
                <div className="mt-4 pt-4 border-t border-border/30 flex gap-6 text-xs">
                  <div>
                    <div className="section-label mb-0.5">Market Cap</div>
                    <div className="font-bold">{fmtUsd(global.totalMarketCap)}</div>
                  </div>
                  <div>
                    <div className="section-label mb-0.5">BTC Dom.</div>
                    <div className="font-bold text-primary">{(global.btcDominance ?? 0).toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gainers / Losers */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 mt-10 pt-8 border-t border-border/30">
          <div>
            <div className="section-header mb-2">
              <span className="section-label flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-success" />
                Top Gainers (24h)
              </span>
            </div>
            {gainers.length > 0
              ? gainers.map((coin) => <MoverRow key={coin.symbol} coin={coin} positive />)
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse border-b border-border/20" />
                ))}
          </div>
          <div>
            <div className="section-header mb-2">
              <span className="section-label flex items-center gap-1.5">
                <TrendingDown className="w-3 h-3 text-danger" />
                Top Losers (24h)
              </span>
            </div>
            {losers.length > 0
              ? losers.map((coin) => <MoverRow key={coin.symbol} coin={coin} positive={false} />)
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse border-b border-border/20" />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
