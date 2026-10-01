import { useEffect, useMemo, useRef, useState } from "react";
import { useCryptoPrices } from "./useCryptoPrices";
import { useMarketData } from "./useMarketData";

// ── Unified Live Alpha Feed (standalone) ─────────────────────────────────────
// Fuses genuinely-live, zero-backend sources into ONE chronological "market
// pulse" stream: real price-momentum regime changes and Fear & Greed shifts,
// both computed from the market engine. No edge functions, no polling of dead
// endpoints — everything here is real or clearly labeled "modeled".
//
// Legacy sources (edge-function whale/trades/funding/liquidation) were removed
// when the site went standalone; they return here automatically if the
// Supabase overlay is wired up later.

export type AlphaEventType = "signal" | "regime";

export interface AlphaEvent {
  id: string;              // stable dedupe key
  type: AlphaEventType;
  symbol: string;
  image?: string;
  sentence: string;        // human-readable headline
  value?: number;
  timestamp: number;       // ms epoch
  href: string;            // where a click navigates
  honesty: "live" | "modeled";
}

const MAX_EVENTS = 40;

function predictionHref(symbol: string): string {
  return `/price-prediction/${symbol.toLowerCase()}/daily`;
}

/** Normalize a possibly-seconds timestamp to ms. */
function toMs(ts: number): number {
  if (!ts) return Date.now();
  return ts < 1e12 ? ts * 1000 : ts;
}

export function useAlphaFeed() {
  const { data: pricesData } = useCryptoPrices();
  const { data: marketData } = useMarketData();

  // ── Accumulated feed state ──────────────────────────────────────────────────
  const [events, setEvents] = useState<AlphaEvent[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const lastSignal = useRef<Map<string, "bull" | "bear">>(new Map());
  const lastFngBand = useRef<string | null>(null);

  // Merge helper — adds only genuinely new events, keeps newest MAX_EVENTS.
  const push = (incoming: AlphaEvent[]) => {
    if (incoming.length === 0) return;
    const fresh = incoming.filter((e) => !seenIds.current.has(e.id));
    if (fresh.length === 0) return;
    fresh.forEach((e) => seenIds.current.add(e.id));
    setEvents((prev) => {
      const merged = [...fresh, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_EVENTS);
      // Keep the seen-set from growing unbounded.
      if (seenIds.current.size > MAX_EVENTS * 4) {
        seenIds.current = new Set(merged.map((e) => e.id));
      }
      return merged;
    });
  };

  // ── Momentum signals (modeled) — emit when a mover changes direction ────────
  useEffect(() => {
    const prices = pricesData?.prices ?? [];
    const movers = [...prices]
      .filter((p) => Math.abs(p.change24h) >= 5)
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, 5);
    const now = Date.now();
    const out: AlphaEvent[] = [];
    movers.forEach((p) => {
      const sym = p.symbol.toUpperCase();
      const dir: "bull" | "bear" = p.change24h >= 0 ? "bull" : "bear";
      const prev = lastSignal.current.get(sym);
      lastSignal.current.set(sym, dir);
      if (prev === dir) return; // only on a fresh direction change
      out.push({
        id: `signal:${sym}:${dir}:${Math.floor(now / 60000)}`,
        type: "signal",
        symbol: sym,
        image: p.image,
        sentence: `AI momentum turned ${dir === "bull" ? "bullish" : "bearish"} (${p.change24h >= 0 ? "+" : ""}${p.change24h.toFixed(1)}% 24h)`,
        timestamp: now,
        href: predictionHref(sym),
        honesty: "modeled",
      });
    });
    push(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricesData?.timestamp]);

  // ── Fear & Greed regime shifts (live index) — emit when the band changes ────
  useEffect(() => {
    const fng = marketData?.fearGreedIndex;
    if (fng === null || fng === undefined) return;
    const band =
      fng >= 80 ? "Extreme Greed" : fng >= 60 ? "Greed" : fng >= 40 ? "Neutral" : fng >= 20 ? "Fear" : "Extreme Fear";
    const prev = lastFngBand.current;
    lastFngBand.current = band;
    if (prev === null || prev === band) return; // first read or no change
    push([{
      id: `regime:fng:${band}:${Math.floor(Date.now() / 60000)}`,
      type: "regime",
      symbol: "FNG",
      sentence: `Fear & Greed shifted into ${band} (${fng}/100)`,
      timestamp: Date.now(),
      href: "/sentiment",
      honesty: "live",
    }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketData?.fearGreedIndex]);

  const lastUpdated = useMemo(() => (events.length ? events[0].timestamp : null), [events]);
  const isLoading = events.length === 0 && !pricesData;

  return { events, isLoading, lastUpdated };
}
