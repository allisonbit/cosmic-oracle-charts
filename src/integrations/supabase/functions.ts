// Lightweight Supabase Edge Function caller.
//
// `supabase.functions.invoke()` pulls in the entire @supabase/supabase-js client
// (auth + realtime + storage + postgrest ≈ 450KB). Public/SEO pages only need to
// call edge functions, so this fetch-based shim lets them skip the heavy client
// entirely — it stays only in the lazy authenticated chunks that use `.from()`.
//
// Returns the same { data, error } shape as supabase.functions.invoke().

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qynszkirmcrldqmiplwh.supabase.co";
const ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "missing-key";

export interface InvokeResult<T = any> {
  data: T | null;
  error: { message: string; status?: number } | null;
}

export async function invokeFunction<T = any>(
  name: string,
  options?: { body?: unknown; headers?: Record<string, string> }
): Promise<InvokeResult<T>> {
  try {
    const privyToken = globalThis.__privyAccessToken;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${privyToken || ANON_KEY}`,
      ...(options?.headers || {}),
    };

    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(options?.body ?? {}),
    });

    if (!res.ok) {
      let message = `Edge function "${name}" returned ${res.status}`;
      try {
        const j = await res.json();
        if (j && typeof j.error === "string") message = j.error;
      } catch {
        /* non-JSON error body */
      }
      return { data: null, error: { message, status: res.status } };
    }

    const data = (await res.json().catch(() => null)) as T | null;
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : "Network error" },
    };
  }
}

// Namespaced alias so call sites can read naturally: functionsClient.invoke(...)
export const functionsClient = { invoke: invokeFunction };
