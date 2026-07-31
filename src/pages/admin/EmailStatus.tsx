import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Row = {
  message_id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

const RANGES = { "24h": 1, "7d": 7, "30d": 30 } as const;
type RangeKey = keyof typeof RANGES;

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-blue-100 text-blue-800 border-blue-200",
  bounced: "bg-red-100 text-red-800 border-red-200",
  complained: "bg-orange-100 text-orange-800 border-orange-200",
  suppressed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  dlq: "bg-red-100 text-red-800 border-red-200",
};

export default function EmailStatus() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [rows, setRows] = useState<Row[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - RANGES[range] * 86400_000).toISOString();
      const { data, error } = await supabase
        .from("email_send_log")
        .select("message_id, template_name, recipient_email, status, error_message, created_at")
        .gte("created_at", since)
        .not("message_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error) setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [range]);

  // Dedupe by message_id -> latest row per email
  const latest = useMemo(() => {
    const seen = new Map<string, Row>();
    for (const r of rows) if (!seen.has(r.message_id)) seen.set(r.message_id, r);
    return Array.from(seen.values());
  }, [rows]);

  const templates = useMemo(
    () => Array.from(new Set(latest.map((r) => r.template_name))).sort(),
    [latest],
  );

  const filtered = latest.filter(
    (r) =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (templateFilter === "all" || r.template_name === templateFilter),
  );

  const stats = useMemo(() => {
    const s = { total: latest.length, sent: 0, failed: 0, bounced: 0, complained: 0, suppressed: 0 };
    for (const r of latest) {
      if (r.status === "sent") s.sent++;
      else if (r.status === "failed" || r.status === "dlq") s.failed++;
      else if (r.status === "bounced") s.bounced++;
      else if (r.status === "complained") s.complained++;
      else if (r.status === "suppressed") s.suppressed++;
    }
    return s;
  }, [latest]);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Email Delivery Status</h1>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(RANGES) as RangeKey[]).map((k) => (
          <Button key={k} size="sm" variant={range === k ? "default" : "outline"} onClick={() => setRange(k)}>
            Last {k}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ["Total", stats.total, "all"],
          ["Sent", stats.sent, "sent"],
          ["Bounced", stats.bounced, "bounced"],
          ["Complained", stats.complained, "complained"],
          ["Failed", stats.failed, "failed"],
        ].map(([label, val, key]) => (
          <Card
            key={String(label)}
            className={`p-4 cursor-pointer ${statusFilter === key ? "ring-2 ring-primary" : ""}`}
            onClick={() => setStatusFilter(String(key))}
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
            <div className="text-2xl font-bold mt-1">{val as number}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <label className="text-sm text-muted-foreground">Template:</label>
        <select
          value={templateFilter}
          onChange={(e) => setTemplateFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">All</option>
          {templates.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Template</th>
              <th className="text-left p-3">Recipient</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Timestamp</th>
              <th className="text-left p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No emails match.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.message_id} className="border-t">
                <td className="p-3 font-mono text-xs">{r.template_name}</td>
                <td className="p-3">{r.recipient_email}</td>
                <td className="p-3"><Badge className={STATUS_COLORS[r.status] ?? ""} variant="outline">{r.status}</Badge></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 text-xs text-red-600 max-w-[280px] truncate" title={r.error_message ?? ""}>{r.error_message ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="text-xs text-muted-foreground">
        Rows deduplicated by message_id, showing latest status per email. Bounce and complaint statuses are populated by the provider webhook.
      </p>
    </div>
  );
}
