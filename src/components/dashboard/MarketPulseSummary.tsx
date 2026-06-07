import { Activity, Waves, Flame, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiquidationData } from "@/hooks/useLiquidationData";
import { useWhaleTracker } from "@/hooks/useWhaleTracker";
import { useMarketData } from "@/hooks/useMarketData";
import { DataBadge } from "@/components/ui/DataBadge";
import { formatCompactUsd } from "@/lib/coinFormat";

// ── MarketPulseSummary — replaces the old static "8+ / 24/7" placeholder card ──
// Every figure here is derived from live hooks already running on the dashboard.
// Whale net-flow is tagged "modeled" (whale-tracker is simulated); liquidation
// skew and market breadth are live exchange/aggregator data.

export function MarketPulseSummary() {
  const liq = useLiquidationData();
  const whale = useWhaleTracker("ethereum");
  const { data: market } = useMarketData();

  const longPct = liq.data?.longPercentage ?? null;
  const netflow = whale.data?.netflow ?? null;

  // Market breadth: share of tracked top coins that are up over 24h.
  const coins = market?.topCoins ?? [];
  const gainers = coins.filter((c: any) => (c.change24h ?? 0) > 0).length;
  const breadth = coins.length ? Math.round((gainers / coins.length) * 100) : null;

  const stats = [
    {
      label: "Long/Short Liquidations",
      icon: Flame,
      honesty: "live" as const,
      render: () =>
        longPct === null ? (
          <Skeleton />
        ) : (
          <span className={cn("font-display font-bold text-lg sm:text-xl", longPct >= 50 ? "text-danger" : "text-success")}>
            {longPct.toFixed(0)}% <span className="text-xs text-muted-foreground font-normal">long</span>
          </span>
        ),
      sub: longPct === null ? "" : longPct >= 55 ? "Longs over-exposed" : longPct <= 45 ? "Shorts over-exposed" : "Balanced",
    },
    {
      label: "Whale Net Flow (24h)",
      icon: Waves,
      honesty: "modeled" as const,
      render: () =>
        netflow === null ? (
          <Skeleton />
        ) : (
          <span className={cn("font-display font-bold text-lg sm:text-xl", netflow >= 0 ? "text-success" : "text-danger")}>
            {netflow >= 0 ? "+" : "−"}{formatCompactUsd(Math.abs(netflow))}
          </span>
        ),
      sub: netflow === null ? "" : netflow >= 0 ? "Accumulation" : "Distribution",
    },
    {
      label: "Market Breadth",
      icon: Scale,
      honesty: "live" as const,
      render: () =>
        breadth === null ? (
          <Skeleton />
        ) : (
          <span className={cn("font-display font-bold text-lg sm:text-xl", breadth >= 50 ? "text-success" : "text-danger")}>
            {breadth}% <span className="text-xs text-muted-foreground font-normal">up</span>
          </span>
        ),
      sub: breadth === null ? "" : `${gainers}/${coins.length} assets advancing`,
    },
    {
      label: "Liquidation Volume (24h)",
      icon: Activity,
      honesty: "live" as const,
      render: () => {
        const total = (liq.data?.totalLongLiquidations ?? 0) + (liq.data?.totalShortLiquidations ?? 0);
        return total === 0 ? <Skeleton /> : (
          <span className="font-display font-bold text-lg sm:text-xl text-warning">{formatCompactUsd(total)}</span>
        );
      },
      sub: "Across major perp venues",
    },
  ];

  return (
    <section className="holo-card p-4 sm:p-6" aria-labelledby="market-pulse-heading">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 id="market-pulse-heading" className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          MARKET PULSE SUMMARY
        </h3>
        <DataBadge variant="live" dot />
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        A live snapshot of positioning, flows and breadth derived from the dashboard's real-time feeds.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-muted/20 p-3 rounded-lg">
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <Icon className="w-3 h-3" /> {s.label}
                </span>
                {s.honesty === "modeled" && <DataBadge variant="modeled" />}
              </div>
              {s.render()}
              {s.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Skeleton() {
  return <div className="h-6 w-20 bg-muted animate-pulse rounded" />;
}
