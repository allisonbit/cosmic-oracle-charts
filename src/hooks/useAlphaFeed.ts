import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";
import { useWhaleTracker } from "./useWhaleTracker";
import { useFundingRates } from "./useFundingRates";
import { useLiquidationData } from "./useLiquidationData";
import { useCryptoPrices } from "./useCryptoPrices";
import { formatCompactAmount } from "@/lib/coinFormat";

// ── Unified Live Alpha Feed ───────────────────────────────────────────────────
// Fuses several already-live data sources into ONE chronological "market pulse"
// stream. No new edge functions — it reuses existing hooks and the live-trades
// function. Each source is normalized to a common AlphaEvent and accumulated
// (deduped + capped) so the feed grows over time like a real activity log.

export type AlphaEventType = "whale" | "trade" | "funding" | "liquidation" | "signal";

export interface AlphaEvent {
  id: string;              // stable dedupe key
  type: AlphaEventType;
  symbol: string;
  image?: string;
  sentence: string;        // human-readable headline
  value?: number;          // USD value where applicable
  timestamp: number;       // ms epoch
  href: string;            // where a click navigates
  honesty: "live" | "modeled";
}

const MAX_EVENTS = 40;
const LARGE_TRADE_USD = 250_000;      // only surface genuinely large trades
const FUNDING_FLIP_THRESHOLD = 0.0001; // ~0.01% — ignore noise around zero

interface WhaleTx {
  id: string; type: string; asset: string; amount: number; value: number;
  chain: string; timestamp: number; impact: string;
}
interface LiveTrade {
  id: number; symbol: string; side: "buy" | "sell"; price: number;
  amount: number; value: number; time: number; exchange: string;
}

/** Normalize a possibly-seconds timestamp to ms. */
function toMs(ts: number): number {
  if (!ts) return Date.now();
  return ts < 1e12 ? ts * 1000 : ts;
}

function predictionHref(symbol: string): string {
  return `/price-prediction/${symbol.toLowerCase()}/daily`;
}

export function useAlphaFeed() {
  // ── Sources (all already polling 24/7) ──────────────────────────────────────
  const whale = useWhaleTracker("ethereum");
  const funding = useFundingRates({ refreshInterval: 15000 });
  const liquidation = useLiquidationData();
  const { data: pricesData } = useCryptoPrices();

  const trades = useQuery({
    queryKey: ["live-trades"],
    queryFn: async () => {
      const { data, error } = await invokeFunction("live-trades", { body: {} });
      if (error) throw error;
      return (data?.trades ?? []) as LiveTrade[];
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 4000,
  });

  // symbol -> image lookup from the live price set (accurate CoinGecko URLs)
  const imageMap = useMemo(() => {
    const m = new Map<string, string>();
    (pricesData?.prices ?? []).forEach((p) => {
      if (p.image) m.set(p.symbol.toUpperCase(), p.image);
    });
    return m;
  }, [pricesData]);

  const img = (symbol: string) => imageMap.get(symbol?.toUpperCase());

  // ── Accumulated feed state ──────────────────────────────────────────────────
  const [events, setEvents] = useState<AlphaEvent[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const lastFunding = useRef<Map<string, number>>(new Map());
  const lastSignal = useRef<Map<string, "bull" | "bear">>(new Map());

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

  // ── Whale transactions (modeled) ────────────────────────────────────────────
  useEffect(() => {
    const txs = (whale.data?.transactions ?? []) as WhaleTx[];
    const mapped: AlphaEvent[] = txs.slice(0, 8).map((t) => {
      const sym = (t.asset || "").toUpperCase();
      const verb = t.type === "buy" ? "accumulated" : t.type === "sell" ? "offloaded" : "moved";
      return {
        id: `whale:${t.id}`,
        type: "whale",
        symbol: sym,
        image: img(sym),
        sentence: `Whale ${verb} ${formatCompactAmount(t.amount)} ${sym}`,
        value: t.value,
        timestamp: toMs(t.timestamp),
        href: `/chain/${(t.chain || "ethereum").toLowerCase()}`,
        honesty: "modeled",
      };
    });
    push(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whale.dataUpdatedAt]);

  // ── Large live trades (live — Binance) ──────────────────────────────────────
  useEffect(() => {
    const list = (trades.data ?? []).filter((t) => (t.value ?? 0) >= LARGE_TRADE_USD);
    const mapped: AlphaEvent[] = list.slice(0, 10).map((t) => {
      const sym = t.symbol.toUpperCase();
      return {
        id: `trade:${sym}:${t.id}:${t.time}`,
        type: "trade",
        symbol: sym,
        image: img(sym),
        sentence: `Large ${t.side === "buy" ? "buy" : "sell"} on ${t.exchange}`,
        value: t.value,
        timestamp: toMs(t.time),
        href: predictionHref(sym),
        honesty: "live",
      };
    });
    push(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades.dataUpdatedAt]);

  // ── Funding-rate flips (live) — emit only when sign actually changes ─────────
  useEffect(() => {
    const rates = funding.data?.fundingRates ?? [];
    const now = Date.now();
    const out: AlphaEvent[] = [];
    rates.forEach((r) => {
      const prev = lastFunding.current.get(r.symbol);
      lastFunding.current.set(r.symbol, r.avg);
      if (prev === undefined) return; // need a baseline first
      const flipped =
        Math.sign(prev) !== Math.sign(r.avg) && Math.abs(r.avg) > FUNDING_FLIP_THRESHOLD;
      if (!flipped) return;
      const sym = r.symbol.toUpperCase();
      out.push({
        id: `funding:${sym}:${now}`,
        type: "funding",
        symbol: sym,
        image: img(sym),
        sentence:
          r.avg > 0
            ? `Funding flipped positive — longs paying shorts`
            : `Funding flipped negative — shorts paying longs`,
        timestamp: now,
        href: predictionHref(sym),
        honesty: "live",
      });
    });
    push(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funding.data?.timestamp]);

  // ── Liquidation clusters (live) ─────────────────────────────────────────────
  useEffect(() => {
    const levels = liquidation.data?.levels ?? [];
    const updated = liquidation.data?.lastUpdated ?? "";
    const top = [...levels]
      .sort((a, b) => (b.longLiquidations + b.shortLiquidations) - (a.longLiquidations + a.shortLiquidations))
      .slice(0, 3);
    const mapped: AlphaEvent[] = top.map((l) => {
      const sym = l.symbol.toUpperCase();
      const long = l.longLiquidations >= l.shortLiquidations;
      const total = l.longLiquidations + l.shortLiquidations;
      return {
        id: `liq:${sym}:${updated}`,
        type: "liquidation",
        symbol: sym,
        image: img(sym),
        sentence: `${long ? "Long" : "Short"} liquidations clustering near $${l.price.toLocaleString()}`,
        value: total,
        timestamp: updated ? new Date(updated).getTime() : Date.now(),
        href: predictionHref(sym),
        honesty: "live",
      };
    });
    push(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liquidation.data?.lastUpdated]);

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
        image: p.image || img(sym),
        sentence: `AI momentum turned ${dir === "bull" ? "bullish" : "bearish"} (${p.change24h >= 0 ? "+" : ""}${p.change24h.toFixed(1)}% 24h)`,
        timestamp: now,
        href: predictionHref(sym),
        honesty: "modeled",
      });
    });
    push(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricesData?.timestamp]);

  const lastUpdated = useMemo(() => (events.length ? events[0].timestamp : null), [events]);
  const isLoading = events.length === 0 && (whale.isLoading || trades.isLoading || liquidation.isLoading);

  return { events, isLoading, lastUpdated };
}
