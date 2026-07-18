import { useState } from "react";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Homepage signup for the 08:00 UTC daily digest.
 * Public INSERT — nothing can read the list back from the client.
 */
export function DigestSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Enter a valid email");
      return;
    }
    setStatus("loading");
    const { error } = await supabase
      .from("digest_subscribers")
      .insert({ email: value });
    if (error && !/duplicate|unique/i.test(error.message)) {
      toast.error("Could not subscribe. Try again.");
      setStatus("idle");
      return;
    }
    setStatus("done");
    toast.success("Subscribed — first digest arrives tomorrow at 08:00 UTC");
    setEmail("");
  };

  if (status === "done") {
    return (
      <div className={`inline-flex items-center gap-2 text-sm text-primary ${compact ? "" : "py-3"}`}>
        <CheckCircle2 className="w-4 h-4" /> You're subscribed. Check tomorrow's inbox.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`flex ${compact ? "flex-row" : "flex-col sm:flex-row"} gap-2 w-full max-w-md`}>
      <label htmlFor="digest-email" className="sr-only">Email address</label>
      <Input
        id="digest-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11"
        disabled={status === "loading"}
      />
      <Button type="submit" disabled={status === "loading"} className="h-11 whitespace-nowrap">
        {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bell className="w-4 h-4 mr-2" />Get Daily Digest</>}
      </Button>
    </form>
  );
}