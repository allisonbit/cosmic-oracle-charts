import { TrendingUp, TrendingDown, Minus, Target, Shield, Activity, Bookmark, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataBadge } from "@/components/ui/DataBadge";
import { TradeButtons } from "@/components/trading/TradeButtons";
import { useSaveSetup, TradeSetup } from "@/hooks/useTradeSetups";
import { useCanonicalSetup } from "@/hooks/useCanonicalSetup";
import { formatPrice } from "@/lib/coinFormat";
import { formatRelativeTime, useNowTick } from "@/lib/relativeTime";

interface TradeSetupCardProps {
  coinId: string;
  symbol: string;
  name: string;
  timeframe: string;
  contractAddress?: string;
  chain?: string;
  image?: string;
  // Live prediction fallback (used until/if the persisted setup exists)
  fallback?: {
    bias: "bullish" | "bearish" | "neutral";
    confidence: number;
    currentPrice: number;
    entryLow: number;
    entryHigh: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    takeProfit3: number;
  };
}

const STATUS_META: Record<TradeSetup["status"], { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  active:      { label: "Active · Locked",    cls: "bg-primary/10 text-primary border-primary/20",  icon: Activity },
  hit_tp1:     { label: "WIN · TP1 ✓",        cls: "bg-success/10 text-success border-success/20",  icon: CheckCircle2 },
  hit_tp2:     { label: "WIN · TP2 ✓",        cls: "bg-success/10 text-success border-success/20",  icon: CheckCircle2 },
  hit_tp3:     { label: "WIN · TP3 ✓",        cls: "bg-success/15 text-success border-success/30",  icon: CheckCircle2 },
  stopped:     { label: "LOSS · Stopped",     cls: "bg-danger/10 text-danger border-danger/20",     icon: XCircle },
  invalidated: { label: "Replaced · Divergence", cls: "bg-warning/10 text-warning border-warning/20", icon: XCircle },
  expired:     { label: "Expired",            cls: "bg-muted text-muted-foreground border-border",  icon: Clock },
};

export function TradeSetupCard({ coinId, symbol, name, timeframe, contractAddress, chain, image }: TradeSetupCardProps) {
  // Single source of truth — identical to the home "high-conviction" cards.
  const canonical = useCanonicalSetup(coinId, symbol, timeframe as any, { contractAddress, chain });
  const setup = canonical.setup;
  const saveSetup = useSaveSetup();
  const now = useNowTick(1000);

  const { bias, confidence, entryLow, entryHigh, stopLoss, tp1, tp2, tp3, lastPrice, persisted } = canonical;
  const pnl = canonical.pnlPercent;
  const status = canonical.status;

  const BiasIcon = bias === "bullish" ? TrendingUp : bias === "bearish" ? TrendingDown : Minus;
  const biasColor = bias === "bullish" ? "text-success" : bias === "bearish" ? "text-danger" : "text-warning";
  const sm = STATUS_META[status];
  const StatusIcon = sm.icon;

  const rr = (tp1 - lastPrice) && (lastPrice - stopLoss)
    ? Math.abs((tp1 - entryHigh) / (entryHigh - stopLoss))
    : 0;

  return (
    <section className="border-t border-border/30 pt-5" aria-labelledby="trade-setup-heading">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h2 id="trade-setup-heading" className="font-display text-base sm:text-lg font-bold flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          {name} Trade Setup
        </h2>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold", sm.cls)}>
            <StatusIcon className="w-3 h-3" /> {sm.label}
          </span>
          <DataBadge variant={persisted ? "live" : "estimated"} dot={persisted} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {persisted
          ? status === "active"
            ? "🔒 Levels locked. Entry, stop and targets stay fixed until the trade hits its target (counts as a win) or its stop — then the scanner opens the next setup. A bias divergence can replace it early."
            : "This setup has resolved — its result is recorded in the track record below. The scanner is opening the next setup for this coin."
          : "Live setup from the latest analysis. It locks and is monitored to its outcome once tracking is active."}
      </p>

      {/* Bias + P&L row — inline stat strip */}
      <div className="grid grid-cols-2 sm:flex sm:items-stretch sm:divide-x sm:divide-border/30 border-y border-border/20 py-4 mb-4 gap-y-3">
        <div className="sm:px-5 sm:first:pl-0">
          <div className="section-label mb-1">Direction</div>
          <div className={cn("flex items-center gap-1 font-display font-bold", biasColor)}>
            <BiasIcon className="w-4 h-4" /> {bias.toUpperCase()}
          </div>
        </div>
        <div className="sm:px-5">
          <div className="section-label mb-1">Confidence</div>
          <div className="font-display font-bold text-foreground">{confidence}%</div>
        </div>
        <div className="sm:px-5">
          <div className="section-label mb-1">Live P&amp;L</div>
          <div className={cn("font-mono font-bold", pnl >= 0 ? "text-success" : "text-danger")}>
            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%
          </div>
        </div>
        <div className="sm:px-5">
          <div className="section-label mb-1">Risk / Reward</div>
          <div className="font-mono font-bold text-primary">1:{rr ? rr.toFixed(1) : "—"}</div>
        </div>
      </div>

      {/* Levels ladder */}
      <div className="space-y-1.5">
        <LevelRow label="Take Profit 3" value={tp3} color="text-success" icon={Target} reached={["hit_tp3"].includes(status)} />
        <LevelRow label="Take Profit 2" value={tp2} color="text-success" icon={Target} reached={["hit_tp2", "hit_tp3"].includes(status)} />
        <LevelRow label="Take Profit 1" value={tp1} color="text-success" icon={Target} reached={["hit_tp1", "hit_tp2", "hit_tp3"].includes(status)} />
        <LevelRow label="Entry Zone" value={`${formatPrice(entryLow)} – ${formatPrice(entryHigh)}`} color="text-primary" icon={Activity} highlight />
        <LevelRow label="Current" value={lastPrice} color="text-foreground" icon={Activity} />
        <LevelRow label="Stop Loss" value={stopLoss} color="text-danger" icon={Shield} reached={status === "stopped"} />
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <TradeButtons
            symbol={symbol}
            name={name}
            contractAddress={contractAddress}
            chain={chain}
            price={lastPrice}
            logo={image}
            variant="compact"
          />
        </div>
        {persisted && setup && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => saveSetup.mutate(setup)}
            disabled={saveSetup.isPending}
          >
            <Bookmark className="w-3.5 h-3.5" /> Save Setup
          </Button>
        )}
      </div>

      {/* Updated stamp */}
      {setup && (
        <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Generated {formatRelativeTime(new Date(setup.generated_at).getTime(), now)} · updated {formatRelativeTime(new Date(setup.updated_at).getTime(), now)}
        </div>
      )}
    </section>
  );
}

function LevelRow({
  label, value, color, icon: Icon, reached, highlight,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: typeof Target;
  reached?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2 text-sm border-b border-border/20 last:border-b-0",
      highlight && "border-l-2 border-l-primary pl-2.5",
      reached && "border-l-2 border-l-success pl-2.5",
    )}>
      <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <Icon className={cn("w-3.5 h-3.5", color)} />
        {label}
        {reached && <CheckCircle2 className="w-3 h-3 text-success" />}
      </span>
      <span className={cn("font-mono font-semibold", color)}>
        {typeof value === "number" ? formatPrice(value) : value}
      </span>
    </div>
  );
}
