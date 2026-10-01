// ── usePolymarket — standalone Polymarket market data ────────────────────────
// The old implementation called a Supabase edge function that no longer exists.
// Polymarket's own Gamma API (gamma-api.polymarket.com) is public, key-free and
// CORS-open, so the browser can query it directly. Same exported shapes as
// before — Polymarket.tsx and HomePolymarket.tsx are unchanged consumers.

import { useQuery } from "@tanstack/react-query";

export interface PolymarketMarket {
  id: string;
  question: string;
  eventTitle: string;
  slug: string;
  url: string;
  image: string;
  outcomes: string[];
  outcomePrices: number[];
  volume24hr: number;
  volume: number;
  liquidity: number;
  spread: number;
  oneDayPriceChange: number;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  endDate: string | null;
  tags: string[];
  category: string;
}

interface PolymarketResponse {
  markets: PolymarketMarket[];
  count: number;
  categories: string[];
  query?: string;
}

const GAMMA = "https://gamma-api.polymarket.com/markets";

/** Gamma returns list-typed fields as JSON strings — parse defensively. */
function parseList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

interface GammaMarket {
  id?: string;
  question?: string;
  slug?: string;
  image?: string;
  icon?: string;
  outcomes?: unknown;
  outcomePrices?: unknown;
  volume24hr?: number;
  volumeNum?: number;
  volume?: number;
  liquidityNum?: number;
  liquidity?: number | string;
  spread?: number;
  oneDayPriceChange?: number;
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  endDate?: string | null;
  end_date_iso?: string | null;
  closed?: boolean;
  active?: boolean;
  events?: Array<{
    title?: string;
    tags?: Array<{ label?: string }>;
  }>;
}

async function fetchTopMarkets(limit = 100): Promise<PolymarketMarket[]> {
  const url = `${GAMMA}?closed=false&archived=false&active=true&order=volume24hr&ascending=false&limit=${limit}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Gamma API ${res.status}`);
  const rows = (await res.json()) as GammaMarket[];
  if (!Array.isArray(rows)) return [];

  return rows
    .filter((m) => parseList(m.outcomes).length > 0)
    .map((m) => {
      const outcomes = parseList(m.outcomes);
      const prices = parseList(m.outcomePrices).map((p) => num(p));
      const tags = (m.events?.[0]?.tags ?? [])
        .map((t) => t.label)
        .filter((l): l is string => !!l);
      return {
        id: m.id ?? m.slug ?? "",
        question: m.question ?? "",
        eventTitle: m.events?.[0]?.title ?? "",
        slug: m.slug ?? "",
        url: m.slug ? `https://polymarket.com/market/${m.slug}` : "https://polymarket.com",
        image: m.image ?? m.icon ?? "",
        outcomes,
        outcomePrices: outcomes.map((_, i) => prices[i] ?? 0),
        volume24hr: num(m.volume24hr),
        volume: num(m.volumeNum ?? m.volume),
        liquidity: num(m.liquidityNum ?? m.liquidity),
        spread: num(m.spread),
        oneDayPriceChange: num(m.oneDayPriceChange),
        lastTradePrice: num(m.lastTradePrice),
        bestBid: num(m.bestBid),
        bestAsk: num(m.bestAsk),
        endDate: m.endDate ?? m.end_date_iso ?? null,
        tags,
        category: tags[0] ?? "Uncategorized",
      } satisfies PolymarketMarket;
    });
}

export function usePolymarketMarkets(q: string = "") {
  return useQuery<PolymarketResponse>({
    queryKey: ["polymarket", q],
    queryFn: async () => {
      const all = await fetchTopMarkets(100);
      // Categories come from every fetched market (stable chip list).
      const categories = [...new Set(all.map((m) => m.category))]
        .filter((c) => c && c !== "Uncategorized")
        .slice(0, 12);

      const needle = q.trim().toLowerCase();
      const markets = needle
        ? all.filter(
            (m) =>
              m.question.toLowerCase().includes(needle) ||
              m.eventTitle.toLowerCase().includes(needle) ||
              m.tags.some((t) => t.toLowerCase().includes(needle)),
          )
        : all;

      return { markets, count: markets.length, categories, query: q };
    },
    staleTime: 60_000,
    refetchInterval: false, // no background polling — refresh on visit / manual refresh
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    retry: 1,
  });
}

// ── Signal analysis (informational, market-implied — not betting advice) ──────
export type RiskLevel = "Low" | "Medium" | "High";

export interface MarketSignal {
  probabilities: { outcome: string; prob: number }[]; // % per outcome, sorted desc
  favored: string;        // highest-probability outcome
  favoredProb: number;    // 0–100
  clarity: number;        // 0–100, how decisive the market is
  risk: RiskLevel;
  edge: number;           // 24h change in favored probability (pts), signed
  label: string;          // human summary
  isBinary: boolean;
}

export function analyzeMarket(m: PolymarketMarket): MarketSignal {
  const probs = m.outcomePrices.map((p, i) => ({ outcome: m.outcomes[i] || `Outcome ${i + 1}`, prob: Math.round(p * 1000) / 10 }));
  const sorted = [...probs].sort((a, b) => b.prob - a.prob);
  const favored = sorted[0]?.outcome ?? "—";
  const favoredProb = sorted[0]?.prob ?? 0;
  const isBinary = m.outcomes.length === 2;

  // Clarity: how far the favorite is from a coin-flip (50% → 0, 100% → 100).
  const clarity = Math.round(Math.min(100, Math.max(0, (favoredProb - 50) * 2)));

  // Risk blends decisiveness, liquidity depth and bid/ask spread.
  const lowLiquidity = m.liquidity > 0 && m.liquidity < 20_000;
  const wideSpread = m.spread > 0.04;
  let risk: RiskLevel;
  if (favoredProb >= 80 && !lowLiquidity && !wideSpread) risk = "Low";
  else if (favoredProb < 62 || lowLiquidity || wideSpread) risk = "High";
  else risk = "Medium";

  // Edge: 24h move in the favored side's probability (oneDayPriceChange is a price 0–1).
  const edge = Math.round((m.oneDayPriceChange || 0) * 1000) / 10;

  let label: string;
  if (favoredProb >= 85) label = `Strong favorite — ${favored} (${favoredProb.toFixed(0)}%)`;
  else if (favoredProb >= 62) label = `Leaning ${favored} (${favoredProb.toFixed(0)}%)`;
  else label = `Toss-up — ${favored} narrowly ahead (${favoredProb.toFixed(0)}%)`;

  return { probabilities: sorted, favored, favoredProb, clarity, risk, edge, label, isBinary };
}
