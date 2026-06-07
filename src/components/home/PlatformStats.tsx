import { Globe, Activity, BarChart3, Coins, Layers } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Single, honest platform-stats strip.
// Every number here is either live from the market API or a static fact we can
// stand behind (8 supported chains). No fabricated vanity metrics.
export function PlatformStats() {
  const { data, isLoading } = useMarketData();
  const global = data?.global;

  const stats = [
    {
      label: "Global Market Cap",
      value: global ? `$${(global.totalMarketCap / 1e12).toFixed(2)}T` : null,
      change: global?.marketCapChange24h ?? null,
      icon: Globe,
      link: "/dashboard",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "24h Trading Volume",
      value: global ? `$${(global.totalVolume24h / 1e9).toFixed(0)}B` : null,
      change: null,
      icon: Activity,
      link: "/dashboard",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "BTC Dominance",
      value: global ? `${(global.btcDominance ?? 0).toFixed(1)}%` : null,
      change: null,
      icon: BarChart3,
      link: "/price-prediction/bitcoin/daily",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Coins Tracked",
      value: global?.activeCryptocurrencies
        ? `${global.activeCryptocurrencies.toLocaleString()}+`
        : null,
      change: null,
      icon: Coins,
      link: "/explorer",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      // Static but true: the platform covers 8 major chains (see FAQ / chain pages).
      label: "Blockchains",
      value: "8",
      change: null,
      icon: Layers,
      link: "/chain/ethereum",
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
  ];

  return (
    <section className="py-6 md:py-8 border-y border-border/30" aria-label="Live market statistics">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const showSkeleton = isLoading || stat.value === null;
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="group holo-card p-4 md:p-5 animate-fade-in hover:border-primary/30 hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stat.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                  </div>
                  <span className="text-muted-foreground text-[10px] md:text-xs">{stat.label}</span>
                </div>
                <div className="text-xl md:text-2xl font-display font-bold text-foreground">
                  {showSkeleton ? (
                    <div className="h-7 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
                {stat.change !== undefined && stat.change !== null && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs mt-1.5",
                      stat.change >= 0 ? "text-success" : "text-danger"
                    )}
                  >
                    {stat.change >= 0 ? "+" : ""}
                    {(stat.change ?? 0).toFixed(1)}%
                    <span className="text-muted-foreground ml-1">24h</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
