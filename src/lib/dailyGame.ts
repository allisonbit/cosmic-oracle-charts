// ── dailyGame — the come-back-tomorrow loop ──────────────────────────────────
// Visitors lock in a daily call on BTC: direction (UP/DOWN) plus a closing
// range. Tomorrow the site grades it against the real close from the market
// engine. Streaks, badges and levels live in localStorage — zero accounts, zero
// backend — and sync is stubbed for a future Supabase overlay.
//
// Deterministic grading: today's calls are graded against CoinGecko's daily OHLC
// (fetched by the caller), so the same prediction always yields the same result.

import { seededRng, utcDayKey } from "@/lib/seededRandom";

const KEY = "ob-daily-game-v1";

export type Direction = "up" | "down";

export interface DailyPick {
  /** UTC day key (e.g. "2026-09-28") the pick was made on — graded next day. */
  day: string;
  symbol: string; // BTC for v1
  direction: Direction;
  /** Predicted % move magnitude bucket at close (for tie-breaks/score). */
  magnitudePct: number;
  createdAt: number;
}

export interface GradedPick extends DailyPick {
  openPrice: number;
  closePrice: number;
  actualPct: number;
  correct: boolean;
}

export interface GameStats {
  picks: GradedPick[];
  /** Current consecutive correct days (0 if yesterday was wrong or missed). */
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalGraded: number;
  level: number;
  xp: number;
  badges: string[];
}

interface Store {
  picks: DailyPick[];
  graded: GradedPick[];
  bestStreak: number;
  badges: string[];
}

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Store;
      return { picks: s.picks ?? [], graded: s.graded ?? [], bestStreak: s.bestStreak ?? 0, badges: s.badges ?? [] };
    }
  } catch { /* fresh store */ }
  return { picks: [], graded: [], bestStreak: 0, badges: [] };
}

function save(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* best effort */ }
}

/** Has the visitor already locked today's pick? */
export function getTodayPick(): DailyPick | null {
  const s = load();
  return s.picks.find(p => p.day === utcDayKey()) ?? null;
}

/** Lock in today's pick (one per UTC day). Returns false if already picked. */
export function makePick(direction: Direction, magnitudePct: number, symbol = "BTC"): boolean {
  const s = load();
  const day = utcDayKey();
  if (s.picks.some(p => p.day === day)) return false;
  s.picks.push({ day, symbol, direction, magnitudePct: Math.max(0.1, Math.min(15, magnitudePct)), createdAt: Date.now() });
  // Keep it lean.
  if (s.picks.length > 60) s.picks = s.picks.slice(-60);
  save(s);
  return true;
}

export interface DayPrice { open: number; close: number }

/**
 * Grade any ungraded picks whose day has ended, given that day's open/close
 * (caller supplies real OHLC from the market engine). Returns newly graded.
 */
export function gradePicks(dayPrice: (day: string) => DayPrice | null): GradedPick[] {
  const s = load();
  const today = utcDayKey();
  const newly: GradedPick[] = [];
  s.picks = s.picks.filter(p => {
    if (p.day >= today) return true; // today/future — not gradeable yet
    const px = dayPrice(p.day);
    if (!px || px.open <= 0 || px.close <= 0) return true; // no data yet — retry later
    const actualPct = ((px.close - px.open) / px.open) * 100;
    const correct = p.direction === "up" ? actualPct > 0 : actualPct < 0;
    newly.push({ ...p, openPrice: px.open, closePrice: px.close, actualPct, correct });
    return false;
  });
  if (newly.length) {
    s.graded.push(...newly);
    if (s.graded.length > 365) s.graded = s.graded.slice(-365);
    // Recompute streak from graded history (most recent first, stopping at wrong).
    const sorted = [...s.graded].sort((a, b) => (a.day < b.day ? 1 : -1));
    let streak = 0;
    for (const g of sorted) {
      if (g.correct) streak++;
      else break;
    }
    if (streak > s.bestStreak) s.bestStreak = streak;
    save(s);
    recomputeBadges();
  }
  return newly;
}

export function computeStats(): GameStats {
  const s = load();
  const sorted = [...s.graded].sort((a, b) => (a.day < b.day ? 1 : -1));
  let streak = 0;
  for (const g of sorted) {
    if (g.correct) streak++;
    else break;
  }
  const totalCorrect = s.graded.filter(g => g.correct).length;
  const totalGraded = s.graded.length;
  const xp = totalCorrect * 10 + s.bestStreak * 25;
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 25)) + 1);
  return {
    picks: sorted,
    streak,
    bestStreak: s.bestStreak,
    totalCorrect,
    totalGraded,
    level,
    xp,
    badges: s.badges,
  };
}

function recomputeBadges() {
  const s = load();
  const stats = computeStats();
  const earned = new Set(s.badges);
  if (stats.totalGraded >= 1) earned.add("first-call");
  if (stats.streak >= 3) earned.add("streak-3");
  if (stats.streak >= 7) earned.add("streak-7");
  if (stats.streak >= 30) earned.add("streak-30");
  if (stats.totalCorrect >= 10) earned.add("ten-correct");
  if (stats.totalCorrect >= 50) earned.add("fifty-correct");
  if (stats.totalGraded >= 30) earned.add("thirty-days");
  const next = [...earned];
  if (next.length !== s.badges.length) {
    s.badges = next;
    save(s);
  }
}

export const BADGE_META: Record<string, { label: string; icon: string; desc: string }> = {
  "first-call":   { label: "First Call",    icon: "🎯", desc: "Locked in your first daily prediction" },
  "streak-3":     { label: "On Fire",       icon: "🔥", desc: "3 correct calls in a row" },
  "streak-7":     { label: "Untouchable",   icon: "⚡", desc: "7 correct calls in a row" },
  "streak-30":    { label: "Oracle",        icon: "🔮", desc: "30 correct calls in a row" },
  "ten-correct":  { label: "Double Digits", icon: "📈", desc: "10 lifetime correct calls" },
  "fifty-correct":{ label: "Market Master", icon: "🏆", desc: "50 lifetime correct calls" },
  "thirty-days":  { label: "Regular",       icon: "📅", desc: "Played 30 days" },
};

/** Deterministic share text for a graded pick — no external services. */
export function shareText(g: GradedPick): string {
  const emoji = g.correct ? "✅" : "❌";
  return `${emoji} My Oracle Bull call on ${g.symbol}: ${g.direction.toUpperCase()} — ${
    g.correct ? "correct!" : "wrong"
  } (real move ${g.actualPct >= 0 ? "+" : ""}${g.actualPct.toFixed(2)}%). Can you beat my streak?`;
}

/** Historical open/close lookup seeded from engine OHLC (caller-built). */
export function buildDayPriceLookup(
  series: { time: number; price: number }[],
): (day: string) => DayPrice | null {
  // Bucket the series by UTC day; first price = open, last = close.
  const byDay = new Map<string, DayPrice>();
  for (const point of series) {
    const d = new Date(point.time);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const existing = byDay.get(key);
    if (!existing) byDay.set(key, { open: point.price, close: point.price });
    else existing.close = point.price;
  }
  return (day: string) => byDay.get(day) ?? null;
}

/** Coin/emoji flavor for the game page header, deterministic per day. */
export function dailyFlavor(): string {
  const rng = seededRng(`flavor|${utcDayKey()}`);
  const lines = [
    "The market opens in hours. Where does BTC land?",
    "One call a day. Make it count.",
    "Consensus is a trap. What do you see?",
    "Yesterday is graded. Today is yours.",
    "Streaks are built one honest call at a time.",
  ];
  return lines[Math.floor(rng() * lines.length)];
}
