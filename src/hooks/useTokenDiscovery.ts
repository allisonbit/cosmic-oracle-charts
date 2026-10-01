import { useDexDiscovery } from "@/lib/dexScreener";

export interface DiscoveryToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  logo: string;
  category: 'rising' | 'crashing' | 'new' | 'unusual';
  momentum: number;
  volumeSpike: number;
  socialScore: number;
  volatility: number;
  liquidityScore: number;
  sparkline?: number[];
  coingeckoId?: string;
}

export interface TokenDiscoveryResponse {
  tokens: DiscoveryToken[];
  chain: string;
  timestamp: number;
  lastUpdated: string;
}

// Fallback data for when edge function is unavailable
const FALLBACK_DATA: TokenDiscoveryResponse = {
  tokens: [],
  chain: 'ethereum',
  timestamp: Date.now(),
  lastUpdated: new Date().toISOString(),
};

export function useTokenDiscovery(chain: string = 'ethereum', enabled = true) {
  // Standalone: real DEX pairs from DexScreener's public API, derived into
  // discovery categories client-side (see dexScreener.ts).
  const { data, isLoading } = useDexDiscovery(chain, enabled);
  return { data, isLoading };
}
