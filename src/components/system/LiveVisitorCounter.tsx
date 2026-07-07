import { useEffect, useState, useRef } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function LiveVisitorCounter() {
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    // Track this visit in the database
    if (!tracked.current) {
      tracked.current = true;
      supabase.rpc("increment_daily_visits" as any).then(() => {});
    }

    // Fetch today's total
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("daily_visits" as any)
      .select("count")
      .eq("visit_date", today)
      .single()
      .then(({ data }) => {
        if (data && (data as any).count) {
          setTodayCount((data as any).count);
        }
      });

    // Real-time presence for live count
    const channel = supabase.channel("visitors:global", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setLiveCount(Object.keys(state).length);
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

  if (liveCount === null && todayCount === null) return null;

  return (
    <div
      className="fixed bottom-28 left-3 md:bottom-20 md:left-4 z-[100] select-none"
      aria-live="polite"
    >
      <div className="flex flex-col gap-1">
        {liveCount !== null && liveCount > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur px-3 py-1.5 shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs font-medium tabular-nums">
              {liveCount.toLocaleString()} <span className="text-muted-foreground">online</span>
            </span>
          </div>
        )}
        {todayCount !== null && todayCount > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur px-3 py-1.5 shadow-md">
            <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs font-medium tabular-nums">
              {todayCount.toLocaleString()} <span className="text-muted-foreground">today</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
