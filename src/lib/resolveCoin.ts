import { invokeFunction } from "@/integrations/supabase/functions";

// ── Canonical coin resolver ───────────────────────────────────────────────────
// Takes ANY identifier from a route param — a CoinGecko slug ("bitcoin"), a
// symbol ("BTC"), an EVM contract (0x…), or a Solana mint — and resolves it to a
// normalized coin via the token-search edge function (CoinGecko + DexScreener +
// Alchemy). This is the single source of truth the prediction page uses so any
// coin works end-to-end.

export interface ResolvedCoin {
  /** CoinGecko id when known, else the original identifier (used as URL slug + cache key). */
  coinId: string;
  symbol: string;
  name: string;
  image?: string;
  /** Contract address when this is an on-chain token (enables DexScreener + trading). */
  contractAddress?: string;
  chain?: string;
  coingeckoId?: string;
  price?: number;
  /** How we resolved it — useful for honesty labels / debugging. */
  source: "predefined" | "search" | "address" | "fallback";
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_MINT = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isContractAddress(id: string): boolean {
  return EVM_ADDRESS.test(id) || (!id.startsWith("0x") && SOLANA_MINT.test(id));
}

function titleCaseSlug(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Resolve an identifier to a coin. `predefined` is the locally-known crypto (from
 * getCryptoBySlug) when the slug matches a top coin — we prefer it to avoid a
 * network round-trip for majors.
 */
export async function resolveCoin(
  identifier: string,
  predefined?: { id: string; symbol: string; name: string } | null,
): Promise<ResolvedCoin> {
  const id = (identifier || "bitcoin").trim();

  // 1. Known top coin → use as-is (no network call needed).
  if (predefined) {
    return {
      coinId: predefined.id,
      symbol: predefined.symbol.toUpperCase(),
      name: predefined.name,
      coingeckoId: predefined.id,
      source: "predefined",
    };
  }

  // 2. Resolve via token-search (handles symbol, name, EVM address, Solana mint).
  try {
    const { data, error } = await invokeFunction("token-search", {
      body: { query: id, mode: "search", limit: 10 },
    });
    const tokens: any[] = !error && data?.tokens ? data.tokens : [];
    if (tokens.length > 0) {
      // Prefer an exact symbol/address match, else the first (most-liquid) result.
      const lower = id.toLowerCase();
      const exact =
        tokens.find((t) => (t.contractAddress || t.address || "").toLowerCase() === lower) ||
        tokens.find((t) => (t.symbol || t.baseToken?.symbol || "").toLowerCase() === lower) ||
        tokens.find((t) => (t.coingeckoId || t.id || "").toLowerCase() === lower);
      const t = exact || tokens[0];
      const symbol = (t.symbol || t.baseToken?.symbol || id).toUpperCase();
      const contractAddress = t.contractAddress || t.address || t.baseToken?.address;
      const coingeckoId = t.coingeckoId || (t.id && !isContractAddress(t.id) ? t.id : undefined);
      return {
        // Prefer the CoinGecko id for the prediction call; fall back to the address/identifier.
        coinId: coingeckoId || contractAddress || id,
        symbol,
        name: t.name || t.baseToken?.name || symbol,
        image: t.logo || t.image,
        contractAddress,
        chain: t.chain || t.chainId,
        coingeckoId,
        price: t.price ?? t.priceUsd,
        source: isContractAddress(id) ? "address" : "search",
      };
    }
  } catch {
    // fall through to graceful fallback
  }

  // 3. Fallback — keep the page alive with a best-effort label; the prediction
  //    function can still try CoinGecko/DexScreener with these values.
  return {
    coinId: id,
    symbol: id.toUpperCase().slice(0, 8),
    name: isContractAddress(id) ? `${id.slice(0, 6)}…${id.slice(-4)}` : titleCaseSlug(id),
    contractAddress: isContractAddress(id) ? id : undefined,
    source: "fallback",
  };
}
