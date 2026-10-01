import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Flame, Trophy, Target, Share2, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTodayPick, makePick, gradePicks, computeStats,
  buildDayPriceLookup, BADGE_META, dailyFlavor, shareText,
  type Direction,
} from "@/lib/dailyGame";
import { fetchPriceSeries } from "@/lib/marketEngine";
import { utcDayKey } from "@/lib/seededRandom";
import { cn } from "@/lib/utils";

function useGradedGame() {
  return useQuery({
    queryKey: ["daily-game", utcDayKey()],
    queryFn: async () => {
      // BTC series for grading (45 days covers any pending picks).
      const series = await fetchPriceSeries("bitcoin", 45);
      const lookup = buildDayPriceLookup(series);
      const newly = gradePicks(lookup);
      return { stats: computeStats(), newly };
    },
    staleTime: 5 * 60_000,
  });
}

const MAGNITUDES = [0.5, 1, 2, 3, 5];

export default function DailyGame() {
  const { data, isLoading, refetch } = useGradedGame();
  const [direction, setDirection] = useState<Direction | null>(null);
  const [magnitude, setMagnitude] = useState<number>(2);
  const [justPicked, setJustPicked] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const todayPick = getTodayPick();
  const stats = data?.stats;

  const share = async (text: string) => {
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(text.slice(0, 20));
        setTimeout(() => setCopied(null), 1500);
      }
    } catch { /* user dismissed */ }
  };

  const lockIn = async () => {
    if (!direction) return;
    if (makePick(direction, magnitude)) {
      setJustPicked(true);
      await refetch();
    }
  };

  const yesterdayGrade = useMemo(() => {
    const picks = stats?.picks ?? [];
    return picks[0] ?? null;
  }, [stats?.picks]);

  return (
    <Layout>
      <Helmet>
        <title>Daily Crypto Prediction Game | Oracle Bull</title>
        <meta name="description" content="One call a day on Bitcoin. Graded tomorrow against the real market close. Build your streak, earn badges, beat your friends." />
      </Helmet>
      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <header className="mb-8 text-center">
          <p className="section-label justify-center flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-warning" /> The Daily Call
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Will Bitcoin close up or down today?</h1>
          <p className="text-muted-foreground mt-2">{dailyFlavor()}</p>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Flame, label: "Streak", value: stats ? `${stats.streak}🔥` : "—" },
            { icon: Trophy, label: "Best streak", value: stats ? `${stats.bestStreak}` : "—" },
            { icon: Target, label: "Correct / graded", value: stats ? `${stats.totalCorrect}/${stats.totalGraded}` : "—" },
            { icon: Sparkles, label: "Level", value: stats ? `${stats.level} · ${stats.xp} XP` : "—" },
          ].map(s => (
            <Card key={s.label} className="bg-card/80">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="font-bold text-lg leading-tight truncate">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Yesterday's grade */}
        {yesterdayGrade && (
          <Card className={cn("mb-8 border", yesterdayGrade.correct ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Yesterday's call ({yesterdayGrade.day})</span>
                <span className={yesterdayGrade.correct ? "text-success" : "text-danger"}>
                  {yesterdayGrade.correct ? "✅ Correct" : "❌ Wrong"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 justify-between">
              <p className="text-sm text-muted-foreground">
                You said <strong className="text-foreground">{yesterdayGrade.direction.toUpperCase()}</strong> ·
                BTC opened ${yesterdayGrade.openPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })} and closed
                ${yesterdayGrade.closePrice.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({yesterdayGrade.actualPct >= 0 ? "+" : ""}{yesterdayGrade.actualPct.toFixed(2)}%)
              </p>
              <Button variant="outline" size="sm" onClick={() => share(shareText(yesterdayGrade))} className="gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Share result"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Today's pick */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Today's call — {todayPick ? "locked in ✓" : "open"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {todayPick ? (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Your pick for today</p>
                <p className="text-2xl font-display font-bold">
                  BTC {todayPick.direction.toUpperCase()} {todayPick.magnitudePct}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Graded automatically against tomorrow's real market close. Come back then.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {(["up", "down"] as Direction[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={cn(
                        "rounded-xl border-2 py-6 text-center transition-all",
                        direction === d
                          ? d === "up" ? "border-success bg-success/10" : "border-danger bg-danger/10"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <p className="text-3xl mb-1">{d === "up" ? "📈" : "📉"}</p>
                      <p className={cn("font-bold text-lg", d === "up" ? "text-success" : "text-danger")}>
                        {d === "up" ? "UP" : "DOWN"}
                      </p>
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">How big a move do you expect?</p>
                  <div className="flex flex-wrap gap-2">
                    {MAGNITUDES.map(m => (
                      <button
                        key={m}
                        onClick={() => setMagnitude(m)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                          magnitude === m ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                        )}
                      >
                        ±{m}%
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={lockIn} disabled={!direction || justPicked} size="lg" className="w-full gap-2">
                  <Target className="w-4 h-4" />
                  {justPicked ? "Locked in!" : "Lock in today's call"}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  One call per day. Graded against real market data — no do-overs.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        {stats && stats.badges.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-2"><CardTitle className="text-base">Badges earned</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {stats.badges.map(b => {
                const meta = BADGE_META[b];
                if (!meta) return null;
                return (
                  <span key={b} title={meta.desc} className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5 text-sm font-semibold">
                    {meta.icon} {meta.label}
                  </span>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* History */}
        {stats && stats.picks.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Your call history</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {stats.picks.slice(0, 14).map(g => (
                <div key={g.day} className="flex items-center justify-between text-sm py-1.5 border-b border-border/20 last:border-0">
                  <span className="text-muted-foreground">{g.day}</span>
                  <span className="font-semibold">{g.direction.toUpperCase()}</span>
                  <span className={g.correct ? "text-success font-bold" : "text-danger font-bold"}>
                    {g.correct ? "✓" : "✗"} {g.actualPct >= 0 ? "+" : ""}{g.actualPct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Link to="/predictions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Want deeper analysis before you call? See AI predictions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading && <Skeleton className="h-64 w-full mt-6" />}
      </main>
    </Layout>
  );
}
