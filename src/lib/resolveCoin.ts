import { coingeckoFetch } from "@/lib/coingecko";

// ── Canonical coin resolver ───────────────────────────────────────────────────
// Takes ANY identifier from a route param — a CoinGecko slug ("bitcoin"), a
// symbol ("BTC"), an EVM contract (0x…), or a Solana mint — and resolves it to
// a normalized coin using free public APIs (DexScreener for contracts,
// CoinGecko for slugs/symbols). This is the single source of truth the
// prediction page uses so any coin works end-to-end.

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

  // 2. Contract address → DexScreener's public token lookup (key-free).
  if (isContractAddress(id)) {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(id)}`, {
        headers: { accept: "application/json" },
      });
      if (res.ok) {
        const json = (await res.json()) as { pairs?: any[] };
        const pairs = (json.pairs ?? []).filter(p => p.chainId && p.baseToken?.address);
        if (pairs.length > 0) {
          const best = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
          return {
            coinId: id,
            symbol: (best.baseToken.symbol || id).toUpperCase(),
            name: best.baseToken.name || best.baseToken.symbol || id,
            image: best.info?.imageUrl,
            contractAddress: best.baseToken.address,
            chain: best.chainId,
            price: parseFloat(best.priceUsd ?? "0") || undefined,
            source: "address",
          };
        }
      }
    } catch {
      // fall through to graceful fallback
    }
  }

  // 3. Slug → CoinGecko coin metadata (rich: symbol, name, image).
  try {
    const j = await coingeckoFetch<any>({
      path: `coins/${encodeURIComponent(id)}`,
      params: { localization: false, tickers: false, market_data: false, community_data: false, developer_data: false, sparkline: false },
      ttlMs: 300_000,
    });
    if (j?.id && j?.symbol) {
      return {
        coinId: j.id,
        symbol: (j.symbol || id).toUpperCase(),
        name: j.name || j.id,
        image: j.image?.large || j.image?.small,
        coingeckoId: j.id,
        source: "search",
      };
    }
  } catch {
    // fall through
  }

  // 3b. Symbol fallback → match against the live top-markets list.
  try {
    const markets = await coingeckoFetch<any[]>({
      path: "coins/markets",
      params: { vs_currency: "usd", order: "market_cap_desc", per_page: 250, page: 1 },
      ttlMs: 120_000,
    });
    if (Array.isArray(markets)) {
      const lower = id.toLowerCase();
      const hit =
        markets.find(m => m.id?.toLowerCase() === lower) ??
        markets.find(m => m.symbol?.toLowerCase() === lower) ??
        markets.find(m => m.name?.toLowerCase() === lower);
      if (hit) {
        return {
          coinId: hit.id,
          symbol: (hit.symbol || id).toUpperCase(),
          name: hit.name || hit.id,
          image: hit.image,
          coingeckoId: hit.id,
          price: hit.current_price,
          source: "search",
        };
      }
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
