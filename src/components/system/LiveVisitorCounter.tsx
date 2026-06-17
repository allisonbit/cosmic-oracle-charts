import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real-time visitor counter using Supabase Realtime presence.
 *
 * Every browser tab joins the shared "visitors" channel and tracks itself.
 * The count reflects ALL connected visitors right now — completely independent
 * of GA4/Cloudflare/ad-blockers. This is ground-truth: if a browser renders
 * the site, it's counted.
 */
export function LiveVisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const channel = supabase.channel("visitors:global", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            path: window.location.pathname,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (count === null) return null;

  return (
    <div
      className="fixed bottom-24 left-3 md:bottom-6 md:left-4 z-30 select-none"
      aria-live="polite"
      aria-label={`${count} visitors online now`}
    >
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur px-3 py-1.5 shadow-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-xs font-medium tabular-nums">
          {count.toLocaleString()} <span className="text-muted-foreground">online</span>
        </span>
      </div>
    </div>
  );
}