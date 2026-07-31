import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!token) { setState("error"); return; }
    (async () => {
      const { data, error } = await supabase.functions.invoke("digest-unsubscribe", {
        body: { token },
      });
      setState(!error && data?.ok ? "done" : "error");
    })();
  }, [token]);

  return (
    <Layout showTicker={false}>
      <Helmet>
        <title>Unsubscribe · Oracle Bull Daily Digest</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="p-8 text-center">
          {state === "loading" && (
            <>
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
              <p>Processing your request…</p>
            </>
          )}
          {state === "done" && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">You're unsubscribed</h1>
              <p className="text-muted-foreground mb-6">You won't receive any more daily digest emails.</p>
              <Link to="/" className="text-primary hover:underline">Back to home →</Link>
            </>
          )}
          {state === "error" && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Invalid or expired link</h1>
              <p className="text-muted-foreground mb-6">Please contact support if this keeps happening.</p>
              <Link to="/" className="text-primary hover:underline">Back to home →</Link>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}