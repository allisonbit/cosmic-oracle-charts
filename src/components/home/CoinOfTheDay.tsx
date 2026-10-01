import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { fetchMarkets, pickCoinOfTheDay } from "@/lib/marketEngine";
import { CoinImage } from "@/components/ui/CoinImage";
import { Skeleton } from "@/components/ui/skeleton";

function fmt(p: number) {
  if (!p) return "—";
  if (p >= 1000) return `$${Math.round(p).toLocaleString("en-US")}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toPrecision(4)}`;
}

export function CoinOfTheDay() {
  const { data: coins, isLoading } = useQuery({
    queryKey: ["engine-cotd"],
    queryFn: () => fetchMarkets(100),
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  const coin = pickCoinOfTheDay(coins ?? []);
  if (!coin) return null; // honest: no data, no section

  const up = coin.change24h >= 0;

  return (
    <section aria-label="Coin of the day" className="border-y border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-warning/5">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:grid place-items-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="section-label mb-1">Coin of the Day</p>
              <div className="flex items-center gap-3">
                <CoinImage symbol={coin.symbol} image={coin.image} size={32} />
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-lg leading-tight truncate">{coin.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Rank #{coin.rank} · {fmt(coin.price)}{" "}
                    <span className={up ? "text-success font-semibold" : "text-danger font-semibold"}>
                      {up ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden md:block text-right">
              <p className="section-label mb-0.5">7d</p>
              <p className={`text-sm font-bold flex items-center gap-1 justify-end ${coin.change7d >= 0 ? "text-success" : "text-danger"}`}>
                {coin.change7d >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {coin.change7d >= 0 ? "+" : ""}{coin.change7d.toFixed(1)}%
              </p>
            </div>
            <Link
              to={`/price-prediction/${coin.id}/daily`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Full analysis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
