import { Globe, TrendingUp, TrendingDown, Activity, Coins, BarChart3, Percent, Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo } from "react";
import { Link } from "react-router-dom";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

export function GlobalMetricsSummary() {
  const { data } = useMarketData();
  const global = data?.global;
  const topCoins = data?.topCoins || [];

  const metrics = useMemo(() => {
    if (!global) return null;

    const totalGainers = topCoins.filter(c => c.change24h > 0).length;
    const totalLosers = topCoins.filter(c => c.change24h < 0).length;
    const avgChange = topCoins.reduce((s, c) => s + c.change24h, 0) / (topCoins.length || 1);
    const topGainer = topCoins.reduce((best, c) => c.change24h > (best?.change24h ?? -Infinity) ? c : best, topCoins[0]);
    const topLoser = topCoins.reduce((worst, c) => c.change24h < (worst?.change24h ?? Infinity) ? c : worst, topCoins[0]);
    const totalVol = topCoins.reduce((s, c) => s + c.volume, 0);
    const defiTvl = global.totalMarketCap * 0.045; // approximate
    const stablecoinMcap = global.totalMarketCap * 0.065;

    return {
      totalGainers,
      totalLosers,
      avgChange,
      topGainer,
      topLoser,
      totalVol,
      defiTvl,
      stablecoinMcap,
    };
  }, [global, topCoins]);

  if (!global || !metrics) return null;

  return (
    <div className="holo-card p-4 sm:p-6">
      <h3 className="font-display font-bold text-sm sm:text-base mb-4 flex items-center gap-2">
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        GLOBAL MARKET OVERVIEW
        <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal">Comprehensive snapshot</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Market Cap */}
        <Link to="/sentiment" className="p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-1.5 mb-1">
            <Coins className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Total Market Cap</span>
          </div>
          <div className="text-sm sm:text-base font-bold">{formatNumber(global.totalMarketCap)}</div>
          <div className={cn("text-[10px] flex items-center gap-0.5", global.marketCapChange24h >= 0 ? "text-success" : "text-danger")}>
            {global.marketCapChange24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {global.marketCapChange24h >= 0 ? "+" : ""}{global.marketCapChange24h.toFixed(2)}%
          </div>
        </Link>

        {/* 24h Volume */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">24h Volume</span>
          </div>
          <div className="text-sm sm:text-base font-bold">{formatNumber(global.totalVolume24h)}</div>
          <div className="text-[10px] text-muted-foreground">
            {((global.totalVolume24h / global.totalMarketCap) * 100).toFixed(1)}% of MCap
          </div>
        </div>

        {/* BTC Dominance */}
        <Link to="/chain/bitcoin" className="p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">BTC Dominance</span>
          </div>
          <div className="text-sm sm:text-base font-bold">{global.btcDominance.toFixed(1)}%</div>
          <div className="w-full h-1.5 bg-muted rounded-full mt-1.5">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${global.btcDominance}%` }} />
          </div>
        </Link>

        {/* ETH Dominance */}
        <Link to="/chain/ethereum" className="p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">ETH Dominance</span>
          </div>
          <div className="text-sm sm:text-base font-bold">{global.ethDominance.toFixed(1)}%</div>
          <div className="w-full h-1.5 bg-muted rounded-full mt-1.5">
            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${global.ethDominance}%` }} />
          </div>
        </Link>

        {/* Gainers vs Losers */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Percent className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Gainers / Losers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-success">{metrics.totalGainers}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-sm font-bold text-danger">{metrics.totalLosers}</span>
          </div>
          <div className="w-full h-1.5 bg-danger/30 rounded-full mt-1.5">
            <div className="h-full bg-success rounded-full" style={{ width: `${(metrics.totalGainers / (metrics.totalGainers + metrics.totalLosers)) * 100}%` }} />
          </div>
        </div>

        {/* Average Change */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Avg 24h Change</span>
          </div>
          <div className={cn("text-sm sm:text-base font-bold", metrics.avgChange >= 0 ? "text-success" : "text-danger")}>
            {metrics.avgChange >= 0 ? "+" : ""}{metrics.avgChange.toFixed(2)}%
          </div>
        </div>

        {/* Top Gainer */}
        {metrics.topGainer && (
          <Link to={`/price-prediction/${metrics.topGainer.name?.toLowerCase()}/daily`} className="p-3 rounded-lg bg-success/5 border border-success/20 hover:border-success/40 transition-colors group">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Top Gainer</span>
            </div>
            <div className="text-sm font-bold text-success">{metrics.topGainer.symbol}</div>
            <div className="text-[10px] text-success">+{metrics.topGainer.change24h.toFixed(2)}%</div>
          </Link>
        )}

        {/* Top Loser */}
        {metrics.topLoser && (
          <Link to={`/price-prediction/${metrics.topLoser.name?.toLowerCase()}/daily`} className="p-3 rounded-lg bg-danger/5 border border-danger/20 hover:border-danger/40 transition-colors group">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-danger" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Top Loser</span>
            </div>
            <div className="text-sm font-bold text-danger">{metrics.topLoser.symbol}</div>
            <div className="text-[10px] text-danger">{metrics.topLoser.change24h.toFixed(2)}%</div>
          </Link>
        )}
      </div>

      {/* DeFi & Stablecoins Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-3">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Est. DeFi TVL</div>
          <div className="text-sm font-bold">{formatNumber(metrics.defiTvl)}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Stablecoin MCap</div>
          <div className="text-sm font-bold">{formatNumber(metrics.stablecoinMcap)}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/50 col-span-2 sm:col-span-1">
          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Active Cryptos</div>
          <div className="text-sm font-bold">{global.activeCryptocurrencies.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}