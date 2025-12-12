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

// Fallback data generator
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

  return {
    overview: {
      marketCap: defaults.marketCap * (1 + (Math.random() - 0.5) * 0.02),
      volume24h: defaults.volume * (1 + (Math.random() - 0.5) * 0.1),
      transactions24h: Math.floor(1000000 + Math.random() * 500000),
      gasFees: Math.random() * 50,
      tps: Math.floor(50 + Math.random() * 100),
      activeWallets: Math.floor(100000 + Math.random() * 200000),
      defiTvl: defaults.volume * 3,
      priceChange24h: (Math.random() - 0.5) * 10,
    },
    whaleActivity: Array.from({ length: 20 }, (_, i) => ({
      type: ["buy", "sell", "transfer"][Math.floor(Math.random() * 3)] as "buy" | "sell" | "transfer",
      amount: Math.random() * 10000,
      token: defaults.tokens[Math.floor(Math.random() * defaults.tokens.length)],
      timestamp: Date.now() - Math.random() * 3600000,
      value: Math.random() * 5000000,
      wallet: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    })),
    tokenHeat: defaults.tokens.map((symbol) => ({
      symbol,
      name: symbol,
      momentum: Math.random() * 100,
      volumeSpike: Math.random() * 100,
      volatility: Math.random() * 100,
      socialScore: Math.random() * 100,
      liquidityChange: (Math.random() - 0.5) * 40,
      price: Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 20,
    })),
    smartMoneyFlow: {
      inflow: Math.random() * 100e6,
      outflow: Math.random() * 80e6,
      netFlow: (Math.random() - 0.3) * 30e6,
      topSwaps: Array.from({ length: 5 }, () => ({
        from: defaults.tokens[Math.floor(Math.random() * 3)],
        to: defaults.tokens[Math.floor(Math.random() * 5) + 3] || defaults.tokens[0],
        amount: Math.random() * 1e6,
      })),
      liquidityAdded: Math.random() * 50e6,
      liquidityRemoved: Math.random() * 30e6,
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
    refetchInterval: 12000,
    staleTime: 10000,
    refetchIntervalInBackground: true,
    retry: 2,
    retryDelay: 1000,
    placeholderData: (previousData) => previousData || generateFallbackData(chainId),
  });
}