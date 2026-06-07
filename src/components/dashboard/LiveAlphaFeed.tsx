import { Link } from "react-router-dom";
import { Radio, Waves, Zap, Activity, Flame, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoinImage } from "@/components/ui/CoinImage";
import { DataBadge } from "@/components/ui/DataBadge";
import { useAlphaFeed, AlphaEvent, AlphaEventType } from "@/hooks/useAlphaFeed";
import { formatCompactUsd } from "@/lib/coinFormat";
import { formatRelativeTime, useNowTick } from "@/lib/relativeTime";

// ── LiveAlphaFeed — the dashboard's headline "market pulse" stream ─────────────
// Fixed-height, newest-on-top, capped list. New rows fade in with a stable key
// so only genuinely-new events animate (no full-list layout shift / no marquee).

const TYPE_META: Record<AlphaEventType, { label: string; icon: typeof Zap; cls: string }> = {
  trade:       { label: "Large Trade", icon: Zap,      cls: "bg-warning/10 text-warning" },
  whale:       { label: "Whale",       icon: Waves,    cls: "bg-secondary/10 text-secondary" },
  funding:     { label: "Funding",     icon: Activity, cls: "bg-primary/10 text-primary" },
  liquidation: { label: "Liquidation", icon: Flame,    cls: "bg-danger/10 text-danger" },
  signal:      { label: "AI Signal",   icon: Brain,    cls: "bg-success/10 text-success" },
};

function FeedRow({ event, now }: { event: AlphaEvent; now: number }) {
  const meta = TYPE_META[event.type];
  const Icon = meta.icon;
  return (
    <Link
      to={event.href}
      className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors animate-fade-in group"
    >
      {/* Type chip */}
      <span className={cn("flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0", meta.cls)}>
        <Icon className="w-3.5 h-3.5" />
      </span>

      {/* Coin */}
      <CoinImage symbol={event.symbol} image={event.image} size={22} className="flex-shrink-0" />
      <span className="font-display font-bold text-xs sm:text-sm text-foreground w-12 sm:w-14 flex-shrink-0">
        {event.symbol}
      </span>

      {/* Headline */}
      <span className="flex-1 min-w-0 truncate text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {event.sentence}
      </span>

      {/* Value */}
      {event.value !== undefined && event.value > 0 && (
        <span className="hidden sm:inline font-mono text-xs text-foreground flex-shrink-0">
          {formatCompactUsd(event.value)}
        </span>
      )}

      {/* Honesty + time */}
      <DataBadge variant={event.honesty === "live" ? "live" : "modeled"} className="hidden md:inline-flex flex-shrink-0" />
      <span className="text-[10px] text-muted-foreground w-12 text-right flex-shrink-0 tabular-nums">
        {formatRelativeTime(event.timestamp, now)}
      </span>
    </Link>
  );
}

export function LiveAlphaFeed() {
  const { events, isLoading, lastUpdated } = useAlphaFeed();
  const now = useNowTick(1000);

  return (
    <section
      className="holo-card p-4 sm:p-6"
      aria-labelledby="alpha-feed-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          <h2 id="alpha-feed-heading" className="font-display text-base sm:text-lg font-bold tracking-tight">
            Live Alpha Feed
          </h2>
          <span className="text-gradient-cosmic font-display text-base sm:text-lg font-bold hidden sm:inline">
            · Market Pulse
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Radio className="w-3.5 h-3.5 text-success" aria-hidden="true" />
          <span>{lastUpdated ? `updated ${formatRelativeTime(lastUpdated, now)}` : "connecting…"}</span>
        </div>
      </div>

      {/* Helper text — SEO + clarity */}
      <p className="text-xs text-muted-foreground mb-3">
        Real-time fusion of whale moves, large exchange trades, funding-rate flips, liquidation clusters and AI
        momentum signals across major assets. <span className="text-foreground font-medium">Live</span> items are
        sourced from exchange APIs; <span className="text-foreground font-medium">Modeled</span> items are derived
        estimates.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3" aria-hidden="true">
        {(Object.keys(TYPE_META) as AlphaEventType[]).map((t) => {
          const m = TYPE_META[t];
          const Icon = m.icon;
          return (
            <span key={t} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", m.cls)}>
              <Icon className="w-3 h-3" /> {m.label}
            </span>
          );
        })}
      </div>

      {/* Feed */}
      <div
        className="space-y-1 max-h-[420px] overflow-y-auto scrollbar-hide"
        role="log"
        aria-label="Live market events"
        aria-live="polite"
      >
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-muted/20 animate-pulse" />
          ))
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Watching the market — events will stream in shortly.
          </p>
        ) : (
          events.map((event) => <FeedRow key={event.id} event={event} now={now} />)
        )}
      </div>
    </section>
  );
}
