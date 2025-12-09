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

export interface ChainDataResponse {
  overview: ChainOverview;
  whaleActivity: WhaleActivity[];
  tokenHeat: TokenHeat[];
  smartMoneyFlow: SmartMoneyFlow;
  timestamp: number;
}

export function useChainData(chainId: string, enabled = true) {
  return useQuery({
    queryKey: ["chain-data", chainId],
    queryFn: async (): Promise<ChainDataResponse> => {
      const { data, error } = await supabase.functions.invoke("chain-data", {
        body: { chainId },
      });

      if (error) {
        console.error("Error fetching chain data:", error);
        throw error;
      }

      return data as ChainDataResponse;
    },
    enabled: enabled && !!chainId,
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
