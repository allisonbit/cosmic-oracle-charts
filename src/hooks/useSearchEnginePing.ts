import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Pings Google, Bing, and IndexNow once per session to ensure
 * search engines know about our latest content.
 */
export function useSearchEnginePing() {
  useEffect(() => {
    const key = "__oracle_se_ping_v1";
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, Date.now().toString());
    } catch {
      return; // SSR or private browsing
    }

    // Fire and forget - don't block UI
    supabase.functions.invoke("ping-search-engines").catch(() => {
      // Silent fail - this is a background optimization
    });
  }, []);
}
