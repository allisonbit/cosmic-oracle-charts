import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, TrendingUp, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutcomeRow {
  coin_id: string;
  symbol: string;
  timeframe: string;
  bias: string;
  confidence: number;
  hit: boolean;
  resolved_at: string;
}

export default function AccuracyCoin() {
  const { coinId = "" } = useParams<{ coinId: string }>();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["prediction-outcomes-coin", coinId],
    queryFn: async (): Promise<OutcomeRow[]> => {
      const { data, error } = await supabase
        .from("prediction_outcomes")
        .select("coin_id, symbol, timeframe, bias, confidence, hit, resolved_at")
        .eq("coin_id", coinId)
        .order("resolved_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as OutcomeRow[];
    },
    staleTime: 5 * 60_000,
    enabled: !!coinId,
  });

  const stats = useMemo(() => {
    const list = rows ?? [];
    const byTf = new Map<string, OutcomeRow[]>();
    for (const r of list) {
      const arr = byTf.get(r.timeframe) ?? [];
      arr.push(r);
      byTf.set(r.timeframe, arr);
    }
    const total = list.length;
    const hits = list.filter((r) => r.hit).length;
    return {
      total,
      hits,
      rate: total ? (hits / total) * 100 : 0,
      byTf: Array.from(byTf.entries()).map(([tf, arr]) => ({
        tf,
        total: arr.length,
        hits: arr.filter((r) => r.hit).length,
        rate: (arr.filter((r) => r.hit).length / arr.length) * 100,
      })),
    };
  }, [rows]);

  const symbol = rows?.[0]?.symbol ?? coinId.toUpperCase();
  const title = `${symbol} Prediction Accuracy — Oracle Bull Track Record`;
  const description = `Verifiable hit rate for every ${symbol} AI prediction Oracle Bull has published. Broken down by daily, weekly, and monthly timeframes.`;
  const canonical = `https://oraclebull.com/accuracy/${coinId}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${symbol} AI Prediction Accuracy`,
    description,
    url: canonical,
    creator: { "@type": "Organization", name: "Oracle Bull" },
    variableMeasured: ["Hit rate", "Sample size", "Average confidence"],
  };

  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="container mx-auto px-4 py-10">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link> /{" "}
          <Link to="/accuracy" className="hover:underline">Accuracy</Link> / {symbol}
        </nav>

        <Link to="/accuracy" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to leaderboard
        </Link>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-medium mb-3">
            <Trophy className="w-3.5 h-3.5" /> Public Track Record
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {symbol} Prediction Accuracy
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Every {symbol} prediction Oracle Bull has published, graded against the actual market price once its timeframe elapsed.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI label="Predictions Resolved" value={stats.total.toLocaleString()} icon={<Target className="w-4 h-4" />} />
          <KPI label="Correct Calls" value={stats.hits.toLocaleString()} icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} />
          <KPI label="Overall Hit Rate" value={`${stats.rate.toFixed(1)}%`} highlight />
          <KPI label="Timeframes Tracked" value={String(stats.byTf.length)} />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3">By Timeframe</h2>
        <div className="overflow-x-auto -mx-4 px-4 mb-8">
          <table className="w-full bg-white border border-slate-200 rounded-xl text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Timeframe</th>
                <th className="text-right px-4 py-3 font-semibold">Hit Rate</th>
                <th className="text-right px-4 py-3 font-semibold">Sample</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>}
              {!isLoading && stats.byTf.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">No resolved predictions for {symbol} yet.</td></tr>
              )}
              {stats.byTf.map((r) => (
                <tr key={r.tf} className="border-t border-slate-100">
                  <td className="px-4 py-3 capitalize font-medium">{r.tf}</td>
                  <td className={cn("px-4 py-3 text-right tabular-nums font-semibold",
                    r.rate >= 70 ? "text-emerald-700" : r.rate >= 50 ? "text-slate-900" : "text-rose-700")}>
                    {r.rate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{r.hits}/{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3">Recent Resolutions</h2>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full bg-white border border-slate-200 rounded-xl text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Resolved</th>
                <th className="text-left px-4 py-3 font-semibold">Timeframe</th>
                <th className="text-left px-4 py-3 font-semibold">Bias</th>
                <th className="text-right px-4 py-3 font-semibold">Confidence</th>
                <th className="text-right px-4 py-3 font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).slice(0, 50).map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{new Date(r.resolved_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize">{r.timeframe}</td>
                  <td className="px-4 py-3 capitalize">{r.bias}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{(r.confidence || 0).toFixed(0)}%</td>
                  <td className={cn("px-4 py-3 text-right font-semibold", r.hit ? "text-emerald-700" : "text-rose-700")}>
                    {r.hit ? "Hit" : "Miss"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-10">
          <Link to={`/price-prediction/${coinId}/daily`} className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            See current {symbol} prediction <TrendingUp className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </Layout>
  );
}

function KPI({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl p-4 border", highlight ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200")}>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">{icon}{label}</div>
      <div className="text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}
