import { useEffect, useState } from "react";

// ── Shared relative-time helpers ──────────────────────────────────────────────
// Replaces the inline time-ago logic duplicated across RecentTradesPanel,
// WhaleActivityPanel and LiveSignals so every timestamp ticks off one clock.

/** "just now" / "12s ago" / "5m ago" / "3h ago" / "2d ago". Accepts ms epoch. */
export function formatRelativeTime(tsMs: number | null | undefined, now: number = Date.now()): string {
  if (!tsMs) return "—";
  const diff = Math.max(0, now - tsMs);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * useNowTick — returns a `now` timestamp that updates every `intervalMs`.
 * Lets many relative-time labels re-render together off a single timer
 * instead of each component spinning up its own setInterval.
 */
export function useNowTick(intervalMs: number = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
