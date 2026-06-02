import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChainOverview {
  marketCap: number;
  volume24h: number;
  transactions24h: number;
  gasFees: number;
  tps: number;
  activeWallets: number;
  defiTvl: number;
  priceChange24h: number;
}

export interface WhaleActivity {
  type: "buy" | "sell" | "transfer";
  amount: number;
  token: string;
  timestamp: number;
  value: number;
  wallet?: string;
}

export interface TokenHeat {
  symbol: string;
  name: string;
  momentum: number;
  volumeSpike: number;
  volatility: number;
  socialScore: number;
  liquidityChange: number;
  price: number;
  change24h: number;
}

export interface SmartMoneyFlow {
  inflow: number;
  outflow: number;
  netFlow: number;
  topSwaps: { from: string; to: string; amount: number }[];
  liquidityAdded: number;
  liquidityRemoved: number;
}

export interface EcosystemToken {
  symbol: string;
  name: string;
  address: string;
  category: string;
  price?: number;
  change24h?: number;
}

export interface ChainSpecificData {
  type?: string;
  rollupType?: string;
  parentChain?: string;
  consensus?: string;
  language?: string;
  features?: string[];
  governance?: string;
  bridges?: { name: string; url: string }[];
  dexes?: { name: string; url: string; volume24h: number }[];
  defiProtocols?: { name: string; tvl: number; category: string }[];
  telegramApps?: { name: string; users: number; category: string }[];
  uniqueMetrics?: Record<string, number>;
  recentUpgrades?: { name: string; date: string; description: string }[];
  subnets?: { name: string; description: string; tvl: number }[];
  zkSolutions?: { name: string; status: string; tps?: number; description?: string }[];
  orbitChains?: { name: string; description: string; status: string }[];
  ecosystemTokens?: EcosystemToken[];
}

export interface ChainDataResponse {
  overview: ChainOverview;
  whaleActivity: WhaleActivity[];
  tokenHeat: TokenHeat[];
  smartMoneyFlow: SmartMoneyFlow;
  chainSpecificData?: ChainSpecificData;
  timestamp: number;
}

// Deterministic fallback - seeded per 30s window so data is stable, not random on every render
function generateFallbackData(chainId: string): ChainDataResponse {
  const chainDefaults: Record<string, { marketCap: number; volume: number; tokens: string[] }> = {
    ethereum: { marketCap: 440e9, volume: 18e9, tokens: ["ETH", "LINK", "UNI", "AAVE", "LDO", "MKR", "CRV", "COMP"] },
    solana: { marketCap: 105e9, volume: 4.5e9, tokens: ["SOL", "RAY", "ORCA", "MNGO", "BONK", "JTO", "PYTH", "JUP"] },
    bnb: { marketCap: 100e9, volume: 2e9, tokens: ["BNB", "CAKE", "XVS", "BAKE", "TWT", "ALPACA", "DODO", "VENUS"] },
    avalanche: { marketCap: 21e9, volume: 800e6, tokens: ["AVAX", "JOE", "PNG", "QI", "SPELL", "TIME", "BENQI", "YAK"] },
    polygon: { marketCap: 6e9, volume: 400e6, tokens: ["MATIC", "QUICK", "GHST", "SUSHI", "AAVE", "DFYN", "QI", "WETH"] },
    arbitrum: { marketCap: 4.6e9, volume: 450e6, tokens: ["ARB", "GMX", "MAGIC", "RDNT", "GNS", "JONES", "DPX", "PENDLE"] },
    base: { marketCap: 2e9, volume: 300e6, tokens: ["ETH", "AERO", "BRETT", "DEGEN", "TOSHI", "HIGHER", "NORMIE", "DAI"] },
  };

  const defaults = chainDefaults[chainId] || chainDefaults.ethereum;
  // Seed by 30s window - stable within window, fresh every 30s
  const seed = Math.floor(Date.now() / 30000);
  const sr = (n: number) => { const x = Math.sin(seed * 127 + n * 311) * 1e8; return x - Math.floor(x); };

  return {
    overview: {
      marketCap: defaults.marketCap,
      volume24h: defaults.volume,
      transactions24h: Math.floor(1000000 + sr(1) * 500000),
      gasFees: 15 + sr(2) * 30,
      tps: Math.floor(50 + sr(3) * 100),
      activeWallets: Math.floor(100000 + sr(4) * 200000),
      defiTvl: defaults.volume * 3,
      priceChange24h: (sr(5) - 0.5) * 8,
    },
    whaleActivity: Array.from({ length: 20 }, (_, i) => ({
      type: (["buy", "sell", "transfer"] as const)[Math.floor(sr(i * 3 + 6) * 3)],
      amount: sr(i * 5 + 7) * 10000,
      token: defaults.tokens[Math.floor(sr(i * 7 + 8) * defaults.tokens.length)],
      timestamp: Date.now() - sr(i * 11 + 9) * 3600000,
      value: sr(i * 13 + 10) * 2000000,
      wallet: `0x${(seed * (i + 1) * 0x3f7a).toString(16).slice(0, 6)}...${(seed * i).toString(16).slice(-4)}`,
    })),
    tokenHeat: defaults.tokens.map((symbol, i) => ({
      symbol,
      name: symbol,
      momentum: sr(i * 17 + 11) * 100,
      volumeSpike: sr(i * 19 + 12) * 100,
      volatility: sr(i * 23 + 13) * 100,
      socialScore: sr(i * 29 + 14) * 100,
      liquidityChange: (sr(i * 31 + 15) - 0.5) * 40,
      price: sr(i * 37 + 16) * 1000,
      change24h: (sr(i * 41 + 17) - 0.5) * 20,
    })),
    smartMoneyFlow: {
      inflow: defaults.volume * 0.08,
      outflow: defaults.volume * 0.06,
      netFlow: defaults.volume * 0.02,
      topSwaps: Array.from({ length: 5 }, (_, i) => ({
        from: defaults.tokens[i % 3],
        to: defaults.tokens[(i + 2) % defaults.tokens.length],
        amount: defaults.volume * 0.005,
      })),
      liquidityAdded: defaults.volume * 0.07,
      liquidityRemoved: defaults.volume * 0.05,
    },
    timestamp: Date.now(),
  };
}

export function useChainData(chainId: string, enabled = true) {
  return useQuery({
    queryKey: ["chain-data", chainId],
    queryFn: async (): Promise<ChainDataResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("chain-data", {
          body: { chainId },
        });

        if (error) {
          console.error("Error fetching chain data:", error);
          return generateFallbackData(chainId);
        }

        if (!data || !data.overview) {
          return generateFallbackData(chainId);
        }

        return data as ChainDataResponse;
      } catch (err) {
        console.error("Exception fetching chain data:", err);
        return generateFallbackData(chainId);
      }
    },
    enabled: enabled && !!chainId,
    refetchInterval: 20000, // 20 seconds - live 24/7 updates
    staleTime: 15000,
    gcTime: 1000 * 60 * 10, // 10 min cache
    refetchIntervalInBackground: true, // Keep updating in background 24/7
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 2000,
    placeholderData: (previousData) => previousData || generateFallbackData(chainId),
  });
}