import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Search } from "lucide-react";

type Row = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
type SummaryResp = { totals?: { rows?: Row[] }; daily?: { rows?: Row[] } };

async function call<T = any>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const { data, error } = await supabase.functions.invoke(`gsc-dashboard?${qs}`, { method: "GET" });
  if (error) throw error;
  return data as T;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Card>
  );
}

export default function GSCDashboard() {
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResp | null>(null);
  const [queries, setQueries] = useState<Row[]>([]);
  const [pages, setPages] = useState<Row[]>([]);
  const [inspectUrl, setInspectUrl] = useState("https://oraclebull.com/");
  const [inspectResult, setInspectResult] = useState<any>(null);
  const [inspecting, setInspecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const [s, q, p] = await Promise.all([
          call<SummaryResp>({ action: "summary", days: String(days) }),
          call<{ rows?: Row[] }>({ action: "top-queries", days: String(days) }),
          call<{ rows?: Row[] }>({ action: "top-pages", days: String(days) }),
        ]);
        if (cancelled) return;
        setSummary(s); setQueries(q.rows ?? []); setPages(p.rows ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load GSC data");
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [days]);

  const totals = summary?.totals?.rows?.[0];

  async function runInspect() {
    setInspecting(true); setInspectResult(null);
    try { setInspectResult(await call({ action: "inspect", url: inspectUrl })); }
    catch (e) { setInspectResult({ error: e instanceof Error ? e.message : String(e) }); }
    finally { setInspecting(false); }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Google Search Console</h1>
          <p className="text-muted-foreground text-sm mt-1">Live coverage & search performance for oraclebull.com</p>
        </div>
        <div className="flex gap-2">
          {[7, 28, 90].map((d) => (
            <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {loading && (<div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading GSC data…</div>)}
      {error && (<Card className="p-4 border-red-200 bg-red-50 text-red-800 text-sm">{error}</Card>)}

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Clicks" value={totals.clicks?.toLocaleString() ?? 0} />
          <Metric label="Impressions" value={totals.impressions?.toLocaleString() ?? 0} />
          <Metric label="Avg CTR" value={`${((totals.ctr ?? 0) * 100).toFixed(2)}%`} />
          <Metric label="Avg Position" value={(totals.position ?? 0).toFixed(1)} />
        </div>
      )}

      <Card className="p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Search className="h-4 w-4" /> URL Inspection</h2>
        <div className="flex gap-2">
          <Input value={inspectUrl} onChange={(e) => setInspectUrl(e.target.value)} placeholder="https://oraclebull.com/…" />
          <Button onClick={runInspect} disabled={inspecting}>{inspecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Inspect"}</Button>
        </div>
        {inspectResult && (
          <div className="mt-3 space-y-2 text-sm">
            {inspectResult?.inspectionResult?.indexStatusResult && (
              <div className="flex flex-wrap gap-2">
                <Badge>Verdict: {inspectResult.inspectionResult.indexStatusResult.verdict}</Badge>
                <Badge variant="outline">Coverage: {inspectResult.inspectionResult.indexStatusResult.coverageState}</Badge>
                <Badge variant="outline">Robots: {inspectResult.inspectionResult.indexStatusResult.robotsTxtState}</Badge>
                <Badge variant="outline">Indexing: {inspectResult.inspectionResult.indexStatusResult.indexingState}</Badge>
              </div>
            )}
            <pre className="text-xs bg-muted p-3 rounded max-h-64 overflow-auto">{JSON.stringify(inspectResult, null, 2)}</pre>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Top Queries</h2>
          <div className="space-y-1 max-h-[500px] overflow-auto">
            {queries.map((r, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span className="truncate mr-2">{r.keys?.[0]}</span>
                <span className="text-muted-foreground shrink-0">{r.clicks} clicks · {r.impressions} imp · #{r.position.toFixed(1)}</span>
              </div>
            ))}
            {!queries.length && !loading && <div className="text-muted-foreground text-sm">No query data yet.</div>}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Top Pages</h2>
          <div className="space-y-1 max-h-[500px] overflow-auto">
            {pages.map((r, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-1 border-b last:border-0 gap-2">
                <a href={r.keys?.[0]} target="_blank" rel="noreferrer" className="truncate hover:underline flex items-center gap-1">
                  {r.keys?.[0]?.replace("https://oraclebull.com", "") || "/"} <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-muted-foreground shrink-0">{r.clicks} · {r.impressions} · #{r.position.toFixed(1)}</span>
              </div>
            ))}
            {!pages.length && !loading && <div className="text-muted-foreground text-sm">No page data yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}