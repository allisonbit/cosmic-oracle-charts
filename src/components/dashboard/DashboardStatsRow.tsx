import { Link } from "react-router-dom";
import { Globe, Activity, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDashboardNumber } from "./utils";

export function DashboardStatsRow({ global }: { global: any }) {
  const stats = [
    { label: "Market Cap",    value: global ? formatDashboardNumber(global.totalMarketCap) : null,                icon: Globe,     change: global?.marketCapChange24h, link: "/sentiment" },
    { label: "24h Volume",   value: global ? formatDashboardNumber(global.totalVolume24h) : null,               icon: Activity,  change: undefined,                  link: "/dashboard" },
    { label: "Active Coins", value: global ? (global.activeCryptocurrencies ?? 0).toLocaleString() : null,      icon: Zap,       change: undefined,                  link: "/explorer" },
    { label: "BTC Dom",      value: global ? `${(global.btcDominance ?? 0).toFixed(1)}%` : null,               icon: TrendingUp, change: undefined,                 link: "/chain/bitcoin" },
  ];

  return (
    <div className="flex flex-wrap items-stretch border-b border-border/30 mb-6 pb-5 gap-y-4">
      {stats.map((stat, i) => (
        <Link
          key={stat.label}
          to={stat.link}
          className={cn(
            "flex flex-col px-5 first:pl-0 group hover:opacity-80 transition-opacity min-w-[25%]",
            i > 0 && "border-l border-border/30"
          )}
        >
          <div className="section-label mb-1 flex items-center gap-1">
            <stat.icon className="w-3 h-3" />
            {stat.label}
          </div>
          <div className="text-xl md:text-2xl font-display font-bold leading-tight">
            {stat.value ?? <span className="inline-block h-6 w-20 bg-muted/40 animate-pulse rounded" />}
          </div>
          {stat.change !== undefined && (
            <div className={cn("text-xs flex items-center gap-0.5 mt-0.5", stat.change >= 0 ? "text-success" : "text-danger")}>
              {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stat.change >= 0 ? "+" : ""}{(stat.change ?? 0).toFixed(1)}%
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
