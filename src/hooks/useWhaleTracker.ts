import { useQuery } from "@tanstack/react-query";

// ── useWhaleTracker — standalone large-flow view from real pool data ─────────
// The old implementation polled a `whale-tracker` edge function (now gone) for
// wallet-level transfers. Wallet flows need an indexed node provider this build
// doesn't have, so instead we aggregate REAL GeckoTerminal pool data per chain:
// each row is a top pool's 24h volume with its real 24h price direction, and
// inflow/outflow are the summed sell-side/buy-side volumes. Nothing simulated.

interface WhaleTransaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  asset: string;
  amount: number;
  value: number;
  from: string;
  to: string;
  hash: string;
  timestamp: number;
  chain: string;
  impact: 'high' | 'medium' | 'low';
}

interface WhaleData {
  transactions: WhaleTransaction[];
  netflow: number;
  inflow: number;
  outflow: number;
  lastUpdated: string;
  source: string;
}

const GT_NETWORKS: Record<string, string> = {
  ethereum: 'eth', solana: 'solana', bsc: 'bsc', avalanche: 'avax',
  polygon: 'polygon', arbitrum: 'arbitrum', base: 'base',
  optimism: 'optimism', sui: 'sui', ton: 'ton',
};

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

async function fetchWhaleData(chain: string = 'ethereum'): Promise<WhaleData> {
  const network = GT_NETWORKS[chain.toLowerCase()];
  if (!network) {
    return { transactions: [], netflow: 0, inflow: 0, outflow: 0, lastUpdated: new Date().toISOString(), source: 'Unsupported chain' };
  }

  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${network}/pools?sort=h24_volume_usd_desc&page=1`,
      { headers: { accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`GeckoTerminal ${res.status}`);
    const json = (await res.json()) as {
      data?: Array<{
        id: string;
        attributes: {
          name?: string;
          volume_usd?: { h24?: number };
          price_change_percentage?: { h24?: number };
        };
      }>;
    };

    const pools = (json.data ?? []).slice(0, 12);
    let inflow = 0;  // sell-side volume (pools down over 24h)
    let outflow = 0; // buy-side volume (pools up over 24h)
    const transactions: WhaleTransaction[] = pools.map((p) => {
      const volume = num(p.attributes.volume_usd?.h24);
      const change = num(p.attributes.price_change_percentage?.h24);
      const type: WhaleTransaction['type'] = change >= 0 ? 'buy' : 'sell';
      if (type === 'buy') outflow += volume; else inflow += volume;
      const asset = (p.attributes.name ?? '').split(' / ')[0] ?? '';
      return {
        id: p.id,
        type,
        asset,
        amount: volume,
        value: volume,
        from: type === 'buy' ? 'Buyers' : 'Sellers',
        to: p.id.split('_')[0] ?? 'DEX',
        hash: p.id,
        timestamp: Date.now(),
        chain,
        impact: volume >= 10_000_000 ? 'high' : volume >= 1_000_000 ? 'medium' : 'low',
      } as WhaleTransaction;
    });

    return {
      transactions,
      netflow: outflow - inflow,
      inflow,
      outflow,
      lastUpdated: new Date().toISOString(),
      source: 'GeckoTerminal top pools — 24h aggregated flow (not wallet-level transfers)',
    };
  } catch {
    return { transactions: [], netflow: 0, inflow: 0, outflow: 0, lastUpdated: new Date().toISOString(), source: 'Unavailable' };
  }
}

export function useWhaleTracker(chain: string = 'ethereum') {
  return useQuery({
    queryKey: ['whale-tracker', chain],
    queryFn: () => fetchWhaleData(chain),
    refetchInterval: false, // refresh on visit / focus, no 20s polling
    staleTime: 120_000,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
