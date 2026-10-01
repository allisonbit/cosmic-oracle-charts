import { useQuery } from "@tanstack/react-query";

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

/**
 * Real airdrop candidates from DefiLlama's public API (key-free, CORS-open):
 * protocols with meaningful TVL but NO tracked token (no CoinGecko id, no
 * CoinMarketCap id, no market cap) — the classic airdrop-farming profile.
 * Funding rounds aren't reliably exposed by the public API, so `funding` is
 * null and the UI shows "—" instead of invented numbers.
 */

interface LlamaProtocol {
  name?: string;
  url?: string;
  logo?: string;
  chains?: string[];
  chain?: string;
  category?: string;
  tvl?: number;
  change_7d?: number;
  gecko_id?: string | null;
  cmcId?: string | number | null;
  mcap?: number | null;
}

const INTERESTING_CATEGORIES = new Set([
  "Dexes", "Lending", "Liquid Staking", "Restaking", "Yield", "Bridge",
  "Derivatives", "Perps", "Yield Aggregator", "Launchpad", "RWA",
  "Cross Chain", "Options", "Index", "Insurance", "Staking",
]);

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function fetchCandidates(): Promise<AirdropCandidate[]> {
  const res = await fetch("https://api.llama.fi/protocols", { headers: { accept: "application/json" } });
  if (!res.ok) return [];
  const rows = (await res.json()) as LlamaProtocol[];
  if (!Array.isArray(rows)) return [];

  return rows
    .filter(p =>
      (p.tvl ?? 0) >= 10_000_000 &&              // real traction
      !p.gecko_id && !p.cmcId && !p.mcap &&       // no tracked token yet
      INTERESTING_CATEGORIES.has(p.category ?? "") &&
      !!p.name,
    )
    .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
    .slice(0, 40)
    .map(p => {
      const slug = slugify(p.name!);
      const tvl = p.tvl ?? 0;
      const potential: AirdropCandidate["potential"] =
        tvl >= 500_000_000 ? "High" : tvl >= 100_000_000 ? "Notable" : "Emerging";
      return {
        name: p.name!,
        slug,
        logo: p.logo ?? "",
        url: p.url ?? "",
        defillama: `https://defillama.com/protocol/${slug}`,
        chains: (p.chains ?? (p.chain ? [p.chain] : [])).slice(0, 6),
        category: p.category ?? "DeFi",
        tvl,
        change7d: p.change_7d ?? 0,
        funding: null, // honest: not available from the public API
        potential,
      };
    });
}

export function useAirdropCandidates() {
  return useQuery<AirdropsResponse>({
    queryKey: ["airdrop-candidates"],
    queryFn: async () => {
      const candidates = await fetchCandidates();
      const chains = [...new Set(candidates.flatMap(c => c.chains))].slice(0, 12);
      return { candidates, count: candidates.length, chains, source: "DefiLlama (public API)" };
    },
    staleTime: 60 * 60_000, // 1h
    gcTime: 60 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
