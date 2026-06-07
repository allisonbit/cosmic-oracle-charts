import { useMemo } from "react";
import { Trophy, TrendingUp, TrendingDown, History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataBadge } from "@/components/ui/DataBadge";
import { useSetupHistory, TradeSetup } from "@/hooks/useTradeSetups";

// ── SetupTrackRecord — honest performance of resolved setups for a coin ────────
// Pulls only RESOLVED setups (resolved_at not null) so the win-rate is real, not
// fabricated. Renders nothing until there's at least one resolved setup, so we
// never show a fake "0 trades, 100% win" claim.

function isWin(s: TradeSetup): boolean {
  return s.status === "hit_tp1" || s.status === "hit_tp2" || s.status === "hit_tp3";
}

export function SetupTrackRecord({ coinId, name }: { coinId: string; name: string }) {
  const { data: history } = useSetupHistory(coinId, 20);

  const stats = useMemo(() => {
    const resolved = history ?? [];
    if (resolved.length === 0) return null;
    const wins = resolved.filter(isWin).length;
    const losses = resolved.filter((s) => s.status === "stopped").length;
    const decided = wins + losses;
    const winRate = decided > 0 ? Math.round((wins / decided) * 100) : 0;
    const avgPnl = resolved.reduce((a, s) => a + (Number(s.pnl_percent) || 0), 0) / resolved.length;
    return { resolved, wins, losses, decided, winRate, avgPnl };
  }, [history]);

  // No fabricated record — show nothing until real outcomes exist.
  if (!stats) return null;

  return (
    <section className="holo-card p-4 sm:p-6" aria-labelledby="track-record-heading">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 id="track-record-heading" className="font-display text-base sm:text-lg font-bold flex items-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
          {name} Setup Track Record
        </h2>
        <DataBadge variant="live" dot />
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Real outcomes of past {name} setups — each was generated once and monitored to its target or stop. No cherry-picking.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="Win Rate" value={`${stats.winRate}%`} cls={stats.winRate >= 50 ? "text-success" : "text-danger"} />
        <Stat label="Resolved" value={`${stats.resolved.length}`} cls="text-foreground" />
        <Stat
          label="Avg Result"
          value={`${stats.avgPnl >= 0 ? "+" : ""}${stats.avgPnl.toFixed(1)}%`}
          cls={stats.avgPnl >= 0 ? "text-success" : "text-danger"}
        />
      </div>

      {/* Recent outcomes */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-1">
          <History className="w-3 h-3" /> Recent Outcomes
        </div>
        {stats.resolved.slice(0, 6).map((s) => {
          const win = isWin(s);
          const stopped = s.status === "stopped";
          const Icon = win ? CheckCircle2 : stopped ? XCircle : Clock;
          return (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-1.5 text-xs">
              <span className="flex items-center gap-1.5">
                <Icon className={cn("w-3.5 h-3.5", win ? "text-success" : stopped ? "text-danger" : "text-muted-foreground")} />
                <span className="font-medium capitalize">{s.status.replace("_", " ")}</span>
                <span className="text-muted-foreground">· {s.timeframe}</span>
              </span>
              <span className={cn("font-mono font-semibold", (s.pnl_percent || 0) >= 0 ? "text-success" : "text-danger")}>
                {(s.pnl_percent || 0) >= 0 ? "+" : ""}{(s.pnl_percent || 0).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3 text-center">
      <div className={cn("font-display text-xl font-bold", cls)}>{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
