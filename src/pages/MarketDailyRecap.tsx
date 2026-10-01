import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Calendar, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMarkets, fetchGlobal, fetchFearGreed } from "@/lib/marketEngine";
import { CoinImage } from "@/components/ui/CoinImage";
import { cn } from "@/lib/utils";

function fmt(p: number) {
  if (!p) return "—";
  if (p >= 1000) return `$${Math.round(p).toLocaleString("en-US")}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(4)}`;
}

function fmtBig(v: number) {
  if (!v) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

export default function MarketDailyRecap() {
  const { date } = useParams<{ date?: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["engine-recap"],
    queryFn: async () => {
      const [coins, global, fng] = await Promise.all([fetchMarkets(250), fetchGlobal(), fetchFearGreed()]);
      return { coins, global, fng };
    },
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });

  const { gainers, losers } = useMemo(() => {
    const coins = data?.coins ?? [];
    const sorted = [...coins].filter(c => c.volume24h > 1e6).sort((a, b) => b.change24h - a.change24h);
    return { gainers: sorted.slice(0, 6), losers: sorted.slice(-6).reverse() };
  }, [data?.coins]);

  const today = new Date().toISOString().slice(0, 10);
  const shownDate = date ?? today;
  const fng = data?.fng;

  return (
    <Layout>
      <Helmet>
        <title>Crypto Market Recap — {shownDate} | Oracle Bull</title>
        <meta name="description" content={`What moved in crypto on ${shownDate}: top gainers and losers, total market cap, Bitcoin dominance and the Fear & Greed index — generated from live market data.`} />
      </Helmet>
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <header className="mb-8">
          <p className="section-label flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5" /> Daily Recap
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Market recap — {shownDate}</h1>
          <p className="text-muted-foreground mt-2">
            Auto-generated from live CoinGecko data. New recap every day.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : (
          <>
            {/* Global snapshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total market cap", value: fmtBig(data?.global?.totalMarketCap ?? 0), sub: `${(data?.global?.marketCapChange24h ?? 0) >= 0 ? "+" : ""}${(data?.global?.marketCapChange24h ?? 0).toFixed(1)}% 24h` },
                { label: "24h volume", value: fmtBig(data?.global?.totalVolume24h ?? 0), sub: "all coins" },
                { label: "BTC dominance", value: `${(data?.global?.btcDominance ?? 0).toFixed(1)}%`, sub: `ETH ${(data?.global?.ethDominance ?? 0).toFixed(1)}%` },
                { label: "Fear & Greed", value: fng ? `${fng.value}` : "—", sub: fng?.label ?? "" },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-4">
                    <p className="section-label mb-1">{s.label}</p>
                    <p className="text-xl font-display font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Movers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-success">
                    <TrendingUp className="w-4 h-4" /> Top gainers today
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {gainers.map(c => (
                    <Link key={c.id} to={`/price-prediction/${c.id}/daily`} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0 hover:bg-muted/30 rounded px-1 -mx-1 transition-colors">
                      <span className="flex items-center gap-2 min-w-0">
                        <CoinImage symbol={c.symbol} image={c.image} size={20} />
                        <span className="font-semibold text-sm truncate">{c.name}</span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="block text-sm font-mono">{fmt(c.price)}</span>
                        <span className="block text-xs font-bold text-success">+{c.change24h.toFixed(1)}%</span>
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-danger">
                    <TrendingDown className="w-4 h-4" /> Top losers today
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {losers.map(c => (
                    <Link key={c.id} to={`/price-prediction/${c.id}/daily`} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0 hover:bg-muted/30 rounded px-1 -mx-1 transition-colors">
                      <span className="flex items-center gap-2 min-w-0">
                        <CoinImage symbol={c.symbol} image={c.image} size={20} />
                        <span className="font-semibold text-sm truncate">{c.name}</span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="block text-sm font-mono">{fmt(c.price)}</span>
                        <span className="block text-xs font-bold text-danger">{c.change24h.toFixed(1)}%</span>
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* CTA row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/game" className="group rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors">
                <p className="font-display font-bold mb-1">Think you'd have called these moves?</p>
                <p className="text-sm text-muted-foreground mb-3">Play the daily prediction game — one call, graded tomorrow.</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Play today's game <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <Link to="/predictions" className={cn("group rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors")}>
                <p className="font-display font-bold mb-1">Where does the market go from here?</p>
                <p className="text-sm text-muted-foreground mb-3">Technical analysis on 1,000+ tokens, computed from real market data.</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Browse predictions <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          </>
        )}
      </main>
    </Layout>
  );
}
