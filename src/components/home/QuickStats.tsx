import { TrendingUp, TrendingDown, Activity, Globe, Users, BarChart3 } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function QuickStats() {
  const { data, isLoading } = useMarketData();

  const stats = [
    {
      label: "Total Market Cap",
      value: data?.global?.totalMarketCap 
        ? `$${(data.global.totalMarketCap / 1e12).toFixed(2)}T`
        : null,
      change: data?.global?.marketCapChange24h ?? null,
      icon: Globe,
      link: "/dashboard",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "24h Trading Volume",
      value: data?.global?.totalVolume24h
        ? `$${(data.global.totalVolume24h / 1e9).toFixed(0)}B`
        : null,
      icon: Activity,
      link: "/dashboard",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "BTC Dominance",
      value: data?.global?.btcDominance
        ? `${data.global.btcDominance.toFixed(1)}%`
        : null,
      icon: BarChart3,
      link: "/price-prediction/bitcoin/daily",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Active Cryptocurrencies",
      value: data?.global?.activeCryptocurrencies?.toLocaleString() || null,
      icon: Users,
      link: "/explorer",
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <section className="py-6 md:py-8 border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="group holo-card p-4 md:p-5 animate-fade-in hover:border-primary/30 hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stat.bgColor)}>
                    <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                  </div>
                  <span className="text-muted-foreground text-[10px] md:text-xs">{stat.label}</span>
                </div>
                <div className="text-xl md:text-2xl font-display font-bold text-foreground">
                  {isLoading || stat.value === null ? (
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
                    {stat.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change.toFixed(1)}% <span className="text-muted-foreground ml-1">24h</span>
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
