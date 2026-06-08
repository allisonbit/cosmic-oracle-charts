import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

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

export function usePolymarketMarkets(q: string = "") {
  return useQuery<PolymarketResponse>({
    queryKey: ["polymarket", q],
    queryFn: async () => {
      const { data, error } = await invokeFunction<PolymarketResponse>("polymarket", { body: { q, limit: 90 } });
      if (error) throw new Error(error.message);
      return data ?? { markets: [], count: 0, categories: [] };
    },
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
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
