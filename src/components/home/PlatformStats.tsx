import { Globe, Activity, BarChart3, Coins, Layers } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
    },
    {
      label: "24h Trading Volume",
      value: global ? `$${(global.totalVolume24h / 1e9).toFixed(0)}B` : null,
      change: null,
      icon: Activity,
      link: "/dashboard",
      color: "text-secondary",
    },
    {
      label: "BTC Dominance",
      value: global ? `${(global.btcDominance ?? 0).toFixed(1)}%` : null,
      change: null,
      icon: BarChart3,
      link: "/price-prediction/bitcoin/daily",
      color: "text-warning",
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
    },
    {
      label: "Blockchains",
      value: "8",
      change: null,
      icon: Layers,
      link: "/chain/ethereum",
      color: "text-chart-4",
    },
  ];

  return (
    <section className="border-y border-border/30" aria-label="Live market statistics">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row flex-wrap">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const showSkeleton = isLoading || stat.value === null;
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="flex-1 min-w-[45%] sm:min-w-0 py-5 px-4 border-b border-border/20 sm:border-b-0 sm:border-l sm:first:border-l-0 sm:border-border/30 group hover:bg-muted/30 transition-colors"
              >
                <div className="stat-inline">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className={cn("w-3 h-3", stat.color)} />
                    <span className="section-label">{stat.label}</span>
                  </div>
                  {showSkeleton ? (
                    <div className="h-7 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    <span className={cn("stat-value group-hover:text-primary transition-colors", stat.color)}>
                      {stat.value}
                    </span>
                  )}
                  {stat.change !== null && stat.change !== undefined && !showSkeleton && (
                    <span className={cn("text-[10px] font-semibold mt-0.5", stat.change >= 0 ? "text-success" : "text-danger")}>
                      {stat.change >= 0 ? "+" : ""}{stat.change.toFixed(1)}% 24h
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
