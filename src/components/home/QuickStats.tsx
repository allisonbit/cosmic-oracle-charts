import { TrendingUp, TrendingDown, Activity, Zap, Globe, Users } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { cn } from "@/lib/utils";

export function QuickStats() {
  const { data, isLoading } = useMarketData();

  const stats = [
    {
      label: "Market Cap",
      value: data?.global?.totalMarketCap 
        ? `$${(data.global.totalMarketCap / 1e12).toFixed(2)}T`
        : "$3.2T",
      change: data?.global?.marketCapChange24h || 2.4,
      icon: Globe,
    },
    {
      label: "24h Volume",
      value: data?.global?.totalVolume24h
        ? `$${(data.global.totalVolume24h / 1e9).toFixed(0)}B`
        : "$120B",
      icon: Activity,
    },
    {
      label: "BTC Dominance",
      value: data?.global?.btcDominance
        ? `${data.global.btcDominance.toFixed(1)}%`
        : "55%",
      icon: Zap,
    },
    {
      label: "Active Cryptos",
      value: data?.global?.activeCryptocurrencies?.toLocaleString() || "10,000+",
      icon: Users,
    },
  ];

  return (
    <section className="py-8 border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="holo-card p-4 md:p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  {stat.label}
                </div>
                <div className="text-xl md:text-2xl font-display font-bold">
                  {isLoading ? (
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
                {stat.change !== undefined && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs md:text-sm mt-1",
                      stat.change >= 0 ? "text-success" : "text-danger"
                    )}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change.toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
