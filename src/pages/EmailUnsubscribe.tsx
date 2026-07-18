import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "loading" | "valid" | "already" | "invalid" | "done" | "error";

export default function EmailUnsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } }
        );
        const data = await res.json();
        if (data.valid) setState("valid");
        else if (data.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch { setState("error"); }
    })();
  }, [token]);

  const confirm = async () => {
    setState("loading");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (!error && data?.success) setState("done");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <Layout showTicker={false}>
      <Helmet>
        <title>Unsubscribe · Oracle Bull</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="p-8 text-center">
          {state === "loading" && (
            <><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" /><p>Processing…</p></>
          )}
          {state === "valid" && (
            <>
              <h1 className="text-2xl font-bold mb-2">Confirm unsubscribe</h1>
              <p className="text-muted-foreground mb-6">Stop receiving these emails from Oracle Bull?</p>
              <Button onClick={confirm}>Confirm unsubscribe</Button>
            </>
          )}
          {state === "done" && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">You're unsubscribed</h1>
              <p className="text-muted-foreground mb-6">You won't receive any more emails of this type.</p>
              <Link to="/" className="text-primary hover:underline">Back to home →</Link>
            </>
          )}
          {state === "already" && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Already unsubscribed</h1>
              <Link to="/" className="text-primary hover:underline">Back to home →</Link>
            </>
          )}
          {(state === "invalid" || state === "error") && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Invalid or expired link</h1>
              <Link to="/" className="text-primary hover:underline">Back to home →</Link>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}