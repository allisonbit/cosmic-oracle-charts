import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, TrendingUp, ArrowUpDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Timeframe = "all" | "daily" | "weekly" | "monthly";
type SortKey = "hitRate" | "total" | "avgConfidence" | "coin";

interface OutcomeRow {
  coin_id: string;
  symbol: string;
  timeframe: string;
  bias: string;
  confidence: number;
  hit: boolean;
  resolved_at: string;
}

interface Stats {
  coinId: string;
  symbol: string;
  total: number;
  hits: number;
  hitRate: number;
  avgConfidence: number;
  lastResolved: string;
}

export default function Accuracy() {
  const [tf, setTf] = useState<Timeframe>("all");
  const [sortKey, setSortKey] = useState<SortKey>("hitRate");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["prediction-outcomes"],
    queryFn: async (): Promise<OutcomeRow[]> => {
      const { data, error } = await supabase
        .from("prediction_outcomes")
        .select("coin_id, symbol, timeframe, bias, confidence, hit, resolved_at")
        .order("resolved_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as OutcomeRow[];
    },
    staleTime: 5 * 60_000,
  });

  const stats = useMemo<Stats[]>(() => {
    const list = (rows ?? []).filter((r) => tf === "all" || r.timeframe === tf);
    const byCoin = new Map<string, OutcomeRow[]>();
    for (const r of list) {
      const arr = byCoin.get(r.coin_id) ?? [];
      arr.push(r);
      byCoin.set(r.coin_id, arr);
    }
    const out: Stats[] = [];
    for (const [coinId, arr] of byCoin) {
      const hits = arr.filter((r) => r.hit).length;
      out.push({
        coinId,
        symbol: arr[0].symbol,
        total: arr.length,
        hits,
        hitRate: (hits / arr.length) * 100,
        avgConfidence: arr.reduce((s, r) => s + (r.confidence || 0), 0) / arr.length,
        lastResolved: arr.reduce((max, r) => (r.resolved_at > max ? r.resolved_at : max), arr[0].resolved_at),
      });
    }
    out.sort((a, b) => {
      if (sortKey === "coin") return a.symbol.localeCompare(b.symbol);
      if (sortKey === "total") return b.total - a.total;
      if (sortKey === "avgConfidence") return b.avgConfidence - a.avgConfidence;
      // hitRate — tie-break by sample size for stability
      return b.hitRate - a.hitRate || b.total - a.total;
    });
    return out;
  }, [rows, tf, sortKey]);

  const overall = useMemo(() => {
    const list = (rows ?? []).filter((r) => tf === "all" || r.timeframe === tf);
    const total = list.length;
    const hits = list.filter((r) => r.hit).length;
    return { total, hits, rate: total ? (hits / total) * 100 : 0 };
  }, [rows, tf]);

  const title = "Crypto Prediction Accuracy Leaderboard — Oracle Bull AI Track Record";
  const description = "Public, verifiable track record of Oracle Bull's AI crypto predictions. Hit rate, sample size, and average confidence per coin. Updated hourly.";

  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link> / Accuracy
        </nav>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-medium mb-3">
            <Trophy className="w-3.5 h-3.5" /> Public Track Record
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Crypto Prediction Accuracy Leaderboard
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Every AI prediction Oracle Bull publishes is resolved against the real market price once its timeframe
            elapses. This page lists the resulting hit rate per coin — no cherry-picking, no edits.
            The data refreshes hourly via an automated resolver job.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI label="Predictions Resolved" value={overall.total.toLocaleString()} icon={<Target className="w-4 h-4" />} />
          <KPI label="Correct Calls"        value={overall.hits.toLocaleString()} icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} />
          <KPI label="Overall Hit Rate"     value={`${overall.rate.toFixed(1)}%`} highlight />
          <KPI label="Coins Tracked"        value={String(stats.length)}          icon={<Clock className="w-4 h-4" />} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "daily", "weekly", "monthly"] as Timeframe[]).map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition capitalize",
                tf === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
              )}
            >
              {t === "all" ? "All Timeframes" : t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full bg-white border border-slate-200 rounded-xl text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <SortHeader label="Coin"            active={sortKey === "coin"}          onClick={() => setSortKey("coin")} align="left" />
                <SortHeader label="Hit Rate"        active={sortKey === "hitRate"}       onClick={() => setSortKey("hitRate")} />
                <SortHeader label="Sample"          active={sortKey === "total"}         onClick={() => setSortKey("total")} />
                <SortHeader label="Avg Confidence" active={sortKey === "avgConfidence"} onClick={() => setSortKey("avgConfidence")} />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading outcomes…</td></tr>
              )}
              {!isLoading && stats.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No resolved predictions yet for this timeframe. The first batch resolves once their horizon elapses.
                </td></tr>
              )}
              {stats.map((s, i) => (
                <tr key={s.coinId} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={`/price-prediction/${s.coinId}`} className="font-medium text-slate-900 hover:text-blue-600">
                      {s.symbol}
                    </Link>
                    <span className="block text-xs text-slate-500">{s.coinId}</span>
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-right tabular-nums font-semibold",
                    s.hitRate >= 70 ? "text-emerald-700" : s.hitRate >= 50 ? "text-slate-900" : "text-rose-700",
                  )}>
                    {s.hitRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                    {s.hits}/{s.total}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                    {s.avgConfidence.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-12 prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">How We Score Predictions</h2>
          <p>
            Every prediction has a directional <strong>bias</strong> (bullish, bearish, or neutral) and a target
            <strong> price band</strong>. When the prediction&apos;s timeframe elapses, our resolver job fetches the
            actual market price and compares:
          </p>
          <ul>
            <li><strong>Bullish</strong> — counts as a hit if the price reached the upper target.</li>
            <li><strong>Bearish</strong> — counts as a hit if the price reached the lower target.</li>
            <li><strong>Neutral</strong> — counts as a hit if the price stayed inside the predicted band.</li>
          </ul>
          <p>
            Outcomes are stored permanently in our database — they cannot be edited or removed. The leaderboard updates
            within an hour of each prediction expiring. A machine-readable feed is available at{" "}
            <code>/accuracy.json</code> for partners and researchers.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">Why This Matters</h2>
          <p>
            Most crypto prediction sites quietly delete bad calls and only highlight wins. Oracle Bull commits to the
            opposite: every prediction is recorded, every outcome is published, every coin&apos;s sample size and
            confidence is visible. Use this page to size your trust in any given signal — small samples can be lucky,
            but consistent performance across hundreds of resolutions cannot.
          </p>
          <p className="text-xs text-slate-500 italic">
            Not financial advice. Past performance does not predict future returns.
            See our <Link to="/risk-disclaimer" className="underline">Risk Disclaimer</Link>.
          </p>
        </section>
      </main>
    </Layout>
  );
}

function KPI({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl p-4 border",
      highlight ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200",
    )}>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">{icon}{label}</div>
      <div className={cn("text-2xl font-bold", highlight ? "text-blue-700" : "text-slate-900")}>{value}</div>
    </div>
  );
}

function SortHeader({ label, active, onClick, align = "right" }: { label: string; active: boolean; onClick: () => void; align?: "left" | "right" }) {
  return (
    <th className={cn("px-4 py-3 font-semibold", align === "right" ? "text-right" : "text-left")}>
      <button onClick={onClick} className={cn(
        "inline-flex items-center gap-1 hover:text-slate-900 transition",
        active ? "text-slate-900" : "text-slate-600",
      )}>
        {label} <ArrowUpDown className="w-3 h-3 opacity-60" />
      </button>
    </th>
  );
}