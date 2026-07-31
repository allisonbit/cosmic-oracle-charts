import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const FN_BASE = `https://qynszkirmcrldqmiplwh.supabase.co/functions/v1`;

export default function DigestPreview() {
  const [mode, setMode] = useState<"live" | "sample">("sample");
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const url = useMemo(
    () => `${FN_BASE}/preview-daily-digest${mode === "sample" ? "?sample=1" : ""}`,
    [mode],
  );

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(url, { headers: { accept: "text/html" } });
      const text = await r.text();
      setHtml(text);
    } catch (e: any) {
      toast.error(`Preview failed: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [mode]);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(html); doc.close(); }
    }
  }, [html]);

  const sendTest = async () => {
    if (!testEmail) { toast.error("Enter an email"); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-daily-digest", {
        body: { test_recipient: testEmail },
      });
      if (error) throw error;
      toast.success(`Test queued (message ${(data as any)?.message_id?.slice(0, 8)}…)`);
    } catch (e: any) {
      toast.error(`Test send failed: ${e?.message ?? e}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Daily Digest Preview</h1>
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <Button variant={mode === "sample" ? "default" : "outline"} onClick={() => setMode("sample")}>Sample data</Button>
          <Button variant={mode === "live" ? "default" : "outline"} onClick={() => setMode("live")}>Live data</Button>
          <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Loading…" : "Refresh"}</Button>
        </div>
        <div className="flex gap-2 ml-auto">
          <Input
            type="email"
            placeholder="you@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-64"
          />
          <Button onClick={sendTest} disabled={sending}>{sending ? "Sending…" : "Send test to me"}</Button>
        </div>
      </Card>
      <Card className="p-0 overflow-hidden">
        <iframe
          ref={iframeRef}
          title="Digest preview"
          sandbox=""
          className="w-full"
          style={{ height: "80vh", border: 0, background: "#f8fafc" }}
        />
      </Card>
    </div>
  );
}
