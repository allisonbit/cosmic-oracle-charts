import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

export interface AirdropCandidate {
  name: string;
  slug: string;
  logo: string;
  url: string;
  defillama: string;
  chains: string[];
  category: string;
  tvl: number;
  change7d: number;
  funding: { amountM: number; round: string; investors: string[] } | null;
  potential: "High" | "Notable" | "Emerging";
}

interface AirdropsResponse {
  candidates: AirdropCandidate[];
  count: number;
  chains: string[];
  source: string;
}

// Real airdrop candidates: tokenless DeFi protocols with TVL/funding (via DefiLlama).
export function useAirdropCandidates() {
  return useQuery<AirdropsResponse>({
    queryKey: ["airdrop-candidates"],
    queryFn: async () => {
      const { data, error } = await invokeFunction<AirdropsResponse>("airdrops", { body: {} });
      if (error) throw new Error(error.message);
      return data ?? { candidates: [], count: 0, chains: [], source: "DefiLlama" };
    },
    staleTime: 60 * 60_000, // 1h
    gcTime: 60 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
