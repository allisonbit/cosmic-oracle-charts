import { Link } from "react-router-dom";
import { Globe, Activity, Zap, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDashboardNumber } from "./utils";

export function DashboardStatsRow({ global }: { global: any }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
      {[
        { label: "Market Cap", value: global ? formatDashboardNumber(global.totalMarketCap) : null, icon: Globe, change: global?.marketCapChange24h, link: "/sentiment" },
        { label: "24h Volume", value: global ? formatDashboardNumber(global.totalVolume24h) : null, icon: Activity, link: "/dashboard" },
        { label: "Active Coins", value: global ? (global.activeCryptocurrencies ?? 0).toLocaleString() : null, icon: Zap, link: "/explorer" },
        { label: "BTC Dom", value: global ? `${(global.btcDominance ?? 0).toFixed(1)}%` : null, icon: TrendingUp, link: "/chain/bitcoin" },
      ].map((stat) => (
        <Link 
          key={stat.label} 
          to={stat.link}
          className="holo-card p-2.5 sm:p-3 md:p-4 card-touch group"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground font-display uppercase truncate">{stat.label}</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
            {stat.value ?? <span className="inline-block h-6 w-20 bg-muted animate-pulse rounded" />}
          </div>
          {stat.change !== undefined && (
            <div className={cn(
              "text-[9px] sm:text-[10px] md:text-xs flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1",
              stat.change >= 0 ? "text-success" : "text-danger"
            )}>
              {stat.change >= 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              {stat.change >= 0 ? "+" : ""}{(stat.change ?? 0).toFixed(1)}%
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
