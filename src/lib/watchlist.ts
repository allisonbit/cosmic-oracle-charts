// ── watchlist — personal coins, zero accounts ────────────────────────────────
// localStorage-first with a tiny pub/sub so every component re-renders on
// change. `syncBridge` is the seam where a future Supabase project plugs in for
// cross-device sync + leaderboards; the site is fully functional without it.

import { useSyncExternalStore } from "react";

const KEY = "ob-watchlist-v1";
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : ["bitcoin", "ethereum", "solana"];
  } catch {
    return ["bitcoin", "ethereum", "solana"];
  }
}

let cache: string[] | null = null;

function write(ids: string[]) {
  cache = ids;
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* best effort */ }
  listeners.forEach(l => l());
  void syncBridge.push(ids);
}

export function watchlistGet(): string[] {
  if (!cache) cache = read();
  return cache;
}

export function watchlistAdd(id: string) {
  const cur = watchlistGet();
  if (!cur.includes(id)) write([...cur, id]);
}

export function watchlistRemove(id: string) {
  write(watchlistGet().filter(i => i !== id));
}

export function watchlistToggle(id: string) {
  const cur = watchlistGet();
  write(cur.includes(id) ? cur.filter(i => i !== id) : [...cur, id]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** React hook: the live watchlist array (stable identity between changes). */
export function useWatchlist(): string[] {
  return useSyncExternalStore(subscribe, watchlistGet, watchlistGet);
}

// ── syncBridge — optional cloud overlay (future Supabase project) ────────────
// Contract: set `syncBridge.remote` to a real implementation once a backend
// exists; until then push/pull are no-ops and everything stays local.

export interface WatchlistSync {
  /** Mirror local changes to the cloud (fire-and-forget). */
  push: (ids: string[]) => Promise<void>;
  /** Pull cloud state and merge into local (dedup, order-preserving). */
  pull: () => Promise<string[] | null>;
}

export const syncBridge: WatchlistSync = {
  push: async () => { /* cloud not connected — local-only mode */ },
  pull: async () => null,
};
