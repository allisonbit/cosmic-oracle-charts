import { useQuery } from "@tanstack/react-query";

// ── useOrderBook — real order book from Binance's public REST API ────────────
// The old implementation polled an `orderbook` edge function (now gone).
// Binance's public depth endpoint is key-free and CORS-open, so the browser
// reads the real book directly. Same return shape as before.

interface OrderLevel {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookData {
  bids: OrderLevel[];
  asks: OrderLevel[];
  spread: number;
  totalDepth: number;
  imbalance: number;
  exchange: string;
  pair: string;
  timestamp: string;
}

interface UseOrderBookOptions {
  pair?: string;
  exchange?: string;
  limit?: number;
  refreshInterval?: number;
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

function buildLevels(rows: [string, string][]): OrderLevel[] {
  let total = 0;
  return rows.map(([p, q]) => {
    const price = num(p);
    const amount = num(q);
    total += price * amount;
    return { price, amount, total };
  });
}

async function fetchOrderBook(pair: string, limit: number): Promise<OrderBookData> {
  const symbol = pair.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'BTCUSDT';
  const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${Math.min(Math.max(limit, 5), 50)}`);
  if (!res.ok) throw new Error(`Binance depth ${res.status}`);
  const json = (await res.json()) as { bids?: [string, string][]; asks?: [string, string][] };
  const bids = buildLevels(json.bids ?? []);
  const asks = buildLevels(json.asks ?? []);
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const bidDepth = bids.reduce((s, l) => s + l.price * l.amount, 0);
  const askDepth = asks.reduce((s, l) => s + l.price * l.amount, 0);
  return {
    bids,
    asks,
    spread: bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0,
    totalDepth: bidDepth + askDepth,
    imbalance: bidDepth + askDepth > 0 ? (bidDepth - askDepth) / (bidDepth + askDepth) : 0,
    exchange: 'binance',
    pair: symbol,
    timestamp: new Date().toISOString(),
  };
}

export function useOrderBook(options: UseOrderBookOptions = {}) {
  const {
    pair = 'BTCUSDT',
    exchange = 'binance', // Binance is the only key-free public book; others ignored
    limit = 10,
    refreshInterval = 5000, // 5s is plenty for a public REST book
  } = options;

  const query = useQuery<OrderBookData>({
    queryKey: ['orderbook', pair, limit],
    queryFn: () => fetchOrderBook(pair, limit),
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: false,
    staleTime: refreshInterval,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: () => { void query.refetch(); },
  };
}
