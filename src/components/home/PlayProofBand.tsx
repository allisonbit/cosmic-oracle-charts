import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Gamepad2, TrendingUp, TrendingDown, Trophy, Target, Flame, ArrowRight, Lock, Sparkles } from "lucide-react";
import { getTodayPick, makePick, computeStats } from "@/lib/dailyGame";
import { useBacktestOutcomes, summarizeBacktest } from "@/hooks/useBacktest";
import { cn } from "@/lib/utils";

/**
 * "Play & Prove" — the two things no other free site does:
 *  1. PLAY: one-tap daily BTC direction game (streaks, no signup).
 *  2. PROVE: the engine's real 90-day backtest, graded from live history.
 * Interactive by design — this band is the retention hook on the front page.
 */
export function PlayProofBand() {
  const queryClient = useQueryClient();
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [justPicked, setJustPicked] = useState(false);

  const todayPick = getTodayPick();
  const stats = useMemo(() => computeStats(), [justPicked, todayPick]);
  const { data: rows } = useBacktestOutcomes();
  const proof = summarizeBacktest(rows);

  const locked = !!todayPick;

  const pick = (dir: "up" | "down") => {
    if (locked) return;
    const ok = makePick(dir, 1);
    if (ok) {
      setDirection(dir);
      setJustPicked(true);
      // CoinOfTheDay's game hint and other game-state consumers can refresh.
      queryClient.invalidateQueries({ queryKey: ["engine-daily-game"] });
    }
  };

  return (
    <section className="border-b border-border/30" aria-labelledby="play-proof-heading">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="section-header mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gamepad2 className="w-3.5 h-3.5 text-primary" />
              <span className="section-label">Play &amp; Prove</span>
            </div>
            <h2 id="play-proof-heading" className="text-2xl md:text-3xl font-display font-bold">
              Call Today's Market. <span className="text-gradient-cosmic">Check Our Track Record.</span>
            </h2>
          </div>
          <Link
            to="/accuracy"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors shrink-0 group"
          >
            Full leaderboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* ── PLAY: daily BTC call ── */}
          <div className="rounded-xl border border-border/60 bg-card p-5 md:p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">Will Bitcoin close up or down today?</p>
                <p className="text-xs text-muted-foreground mt-0.5">One call per day. Streaks, badges, levels — no signup.</p>
              </div>
              {stats.streak > 0 && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2.5 py-1 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  {stats.streak} streak
                </span>
              )}
            </div>

            {locked ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 rounded-lg border border-dashed border-border/60 bg-muted/20">
                <Lock className="w-5 h-5 text-success mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  Locked in: <span className={cn("uppercase", todayPick?.direction === "up" ? "text-success" : "text-danger")}>
                    {todayPick?.direction}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Graded against the real close tomorrow. Come back to keep the streak.</p>
                <Link to="/game" className="mt-3 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  Open the game <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-3">
                <button
                  onClick={() => pick("up")}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 py-6 transition-all",
                    "border-success/30 bg-success/5 hover:border-success hover:bg-success/10",
                  )}
                >
                  <TrendingUp className="w-7 h-7 text-success group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-success uppercase tracking-wide">Up</span>
                  <span className="text-[10px] text-muted-foreground">BTC closes higher</span>
                </button>
                <button
                  onClick={() => pick("down")}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 py-6 transition-all",
                    "border-danger/30 bg-danger/5 hover:border-danger hover:bg-danger/10",
                  )}
                >
                  <TrendingDown className="w-7 h-7 text-danger group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-danger uppercase tracking-wide">Down</span>
                  <span className="text-[10px] text-muted-foreground">BTC closes lower</span>
                </button>
              </div>
            )}

            {stats.totalGraded > 0 && (
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Your record: {stats.totalCorrect}/{stats.totalGraded} correct
                {stats.bestStreak > 0 && <> · best streak {stats.bestStreak}</>}
              </p>
            )}
          </div>

          {/* ── PROVE: live engine backtest ── */}
          <div className="rounded-xl border border-border/60 bg-card p-5 md:p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-bold text-foreground">The engine's public track record</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Same model, replayed over real 90-day history — every call graded.
                </p>
              </div>
              <Trophy className="w-5 h-5 text-warning shrink-0" />
            </div>

            {proof.total > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg bg-muted/30 px-3 py-3 text-center">
                    <p className="stat-value text-xl md:text-2xl">{proof.rate.toFixed(1)}%</p>
                    <p className="section-label mt-1">Hit rate</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 px-3 py-3 text-center">
                    <p className="stat-value text-xl md:text-2xl">{proof.total.toLocaleString()}</p>
                    <p className="section-label mt-1">Calls graded</p>
                  </div>
 <div className="rounded-lg bg-muted/30 px-3 py-3 text-center">
                    <p className="stat-value text-xl md:text-2xl">{proof.coins}</p>
                    <p className="section-label mt-1">Coins tracked</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Honest numbers: {proof.hits.toLocaleString()} hits, {(proof.total - proof.hits).toLocaleString()} misses across{" "}
                  {proof.coins} major coins. No cherry-picking — see every outcome on the leaderboard.
                </p>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 rounded-lg border border-dashed border-border/60 bg-muted/20">
                <Sparkles className="w-5 h-5 text-primary mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-foreground">Running the live backtest…</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Grading ~4,200 calls against real history. First run takes a minute.
                </p>
              </div>
            )}

            <Link
              to="/accuracy"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              <Target className="w-4 h-4" />
              See the full accuracy leaderboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
