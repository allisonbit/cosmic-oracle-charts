import { Globe, TrendingUp, TrendingDown, Activity, Coins, BarChart3, Percent, Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo } from "react";
import { Link } from "react-router-dom";

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '—';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${(num ?? 0).toLocaleString()}`;
}

export function GlobalMetricsSummary() {
  const { data } = useMarketData();
  const global = data?.global;
  const topCoins = useMemo(() => data?.topCoins || [], [data?.topCoins]);

  const metrics = useMemo(() => {
    if (!global) return null;

    const totalGainers = topCoins.filter(c => c.change24h > 0).length;
    const totalLosers = topCoins.filter(c => c.change24h < 0).length;
    const avgChange = topCoins.reduce((s, c) => s + c.change24h, 0) / (topCoins.length || 1);
    const topGainer = topCoins.reduce((best, c) => c.change24h > (best?.change24h ?? -Infinity) ? c : best, topCoins[0]);
    const topLoser = topCoins.reduce((worst, c) => c.change24h < (worst?.change24h ?? Infinity) ? c : worst, topCoins[0]);
    const defiTvl = global.totalMarketCap * 0.045;
    const stablecoinMcap = global.totalMarketCap * 0.065;

    return { totalGainers, totalLosers, avgChange, topGainer, topLoser, defiTvl, stablecoinMcap };
  }, [global, topCoins]);

  if (!global || !metrics) return null;

  return (
    <div className="border-t border-border/30 pt-5 pb-6 mb-4">
      <div className="section-header mb-2">
        <span className="section-label flex items-center gap-1.5">
          <Globe className="w-3 h-3" />
          Global Market Overview
        </span>
        <span className="text-xs text-muted-foreground">Comprehensive snapshot</span>
      </div>

      <h3 className="font-display font-bold text-base md:text-lg mb-5">
        Market <span className="text-gradient-cosmic">Snapshot</span>
      </h3>

      {/* Main stats — editorial 2-col rows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        {[
          { label: "Total Market Cap",  value: formatNumber(global.totalMarketCap),  change: global.marketCapChange24h, link: "/sentiment",     icon: Coins },
          { label: "24h Volume",        value: formatNumber(global.totalVolume24h),   sub: `${((global.totalVolume24h / global.totalMarketCap) * 100).toFixed(1)}% of MCap`, link: undefined, icon: Activity },
          { label: "BTC Dominance",     value: `${(global.btcDominance ?? 0).toFixed(1)}%`, bar: global.btcDominance,  link: "/chain/bitcoin",  icon: BarChart3, iconColor: "text-amber-400" },
          { label: "ETH Dominance",     value: `${(global.ethDominance ?? 0).toFixed(1)}%`,  bar: global.ethDominance,  link: "/chain/ethereum", icon: Layers,   iconColor: "text-indigo-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="border-t border-border/20 pt-4 pb-4 pr-4">
              <div className="section-label mb-1 flex items-center gap-1">
                <Icon className={cn("w-3 h-3", stat.iconColor ?? "text-primary")} />
                {stat.label}
              </div>
              <div className="text-lg md:text-xl font-bold mb-1">{stat.value}</div>
              {stat.change !== undefined && (
                <div className={cn("text-xs flex items-center gap-0.5", stat.change >= 0 ? "text-success" : "text-danger")}>
                  {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change >= 0 ? "+" : ""}{(stat.change ?? 0).toFixed(2)}%
                </div>
              )}
              {stat.sub && <div className="text-xs text-muted-foreground">{stat.sub}</div>}
              {stat.bar !== undefined && (
                <div className="w-full h-1 bg-muted rounded-full mt-2">
                  <div className={cn("h-full rounded-full", stat.icon === BarChart3 ? "bg-amber-400" : "bg-indigo-400")} style={{ width: `${stat.bar}%` }} />
                </div>
              )}
            </div>
          );
          return stat.link ? (
            <Link key={stat.label} to={stat.link} className="hover:opacity-80 transition-opacity">{content}</Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mt-0">
        {/* Gainers / Losers */}
        <div className="border-t border-border/20 pt-4 pb-4 pr-4">
          <div className="section-label mb-1 flex items-center gap-1">
            <Percent className="w-3 h-3 text-primary" />
            Gainers / Losers
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold text-success">{metrics.totalGainers}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-lg font-bold text-danger">{metrics.totalLosers}</span>
          </div>
          <div className="w-full h-1 bg-danger/30 rounded-full">
            <div className="h-full bg-success rounded-full" style={{ width: `${(metrics.totalGainers / (metrics.totalGainers + metrics.totalLosers)) * 100}%` }} />
          </div>
        </div>

        {/* Avg change */}
        <div className="border-t border-border/20 pt-4 pb-4 pr-4">
          <div className="section-label mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-primary" />
            Avg 24h Change
          </div>
          <div className={cn("text-lg font-bold", metrics.avgChange >= 0 ? "text-success" : "text-danger")}>
            {metrics.avgChange >= 0 ? "+" : ""}{(metrics.avgChange ?? 0).toFixed(2)}%
          </div>
        </div>

        {/* Top Gainer */}
        {metrics.topGainer && (
          <Link to={`/price-prediction/${metrics.topGainer.name?.toLowerCase()}/daily`} className="border-t border-border/20 pt-4 pb-4 pr-4 hover:opacity-80 transition-opacity">
            <div className="section-label mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-success" />
              Top Gainer
            </div>
            <div className="text-lg font-bold text-success">{metrics.topGainer.symbol}</div>
            <div className="text-xs text-success">+{(metrics.topGainer.change24h ?? 0).toFixed(2)}%</div>
          </Link>
        )}

        {/* Top Loser */}
        {metrics.topLoser && (
          <Link to={`/price-prediction/${metrics.topLoser.name?.toLowerCase()}/daily`} className="border-t border-border/20 pt-4 pb-4 pr-4 hover:opacity-80 transition-opacity">
            <div className="section-label mb-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-danger" />
              Top Loser
            </div>
            <div className="text-lg font-bold text-danger">{metrics.topLoser.symbol}</div>
            <div className="text-xs text-danger">{(metrics.topLoser.change24h ?? 0).toFixed(2)}%</div>
          </Link>
        )}
      </div>

      {/* DeFi row */}
      <div className="flex flex-wrap gap-0 border-t border-border/20 pt-4">
        {[
          { label: "Est. DeFi TVL",    value: formatNumber(metrics.defiTvl) },
          { label: "Stablecoin MCap",  value: formatNumber(metrics.stablecoinMcap) },
          { label: "Active Cryptos",   value: (global.activeCryptocurrencies ?? 0).toLocaleString() },
        ].map((item, i) => (
          <div key={item.label} className={cn("pr-8", i > 0 && "pl-8 border-l border-border/20")}>
            <div className="section-label mb-0.5">{item.label}</div>
            <div className="text-base font-bold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
