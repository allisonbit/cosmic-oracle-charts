import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase config is ENV-ONLY — no hardcoded project refs. The build fails
// loudly when these are missing so we never ship a bundle pointed at a dead
// or wrong project. Set these in Vercel (and locally in .env):
//   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=<anon publishable key>
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    "[Oracle Bull] Supabase env vars missing — running in standalone mode. " +
    "Market data, predictions, game and watchlist work fully; auth/portfolio sync is disabled. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable the cloud overlay.",
  );
}

export const supabase = createClient<Database>(
  // Placeholder URL/key keep the client constructible; RLS-protected calls will
  // simply fail and callers already handle errors. The site never blocks on this.
  SUPABASE_URL || "https://standalone.invalid",
  SUPABASE_PUBLISHABLE_KEY || "standalone-mode",
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);