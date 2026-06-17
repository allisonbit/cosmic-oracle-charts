// ─────────────────────────────────────────────────────────────────────────────
// Programmatic SEO slug catalogue.
//
// Drives three template families:
//   /predict/:coin/:target/:year  — "Will X hit $Y by Z" pages
//   /vs/:coinA/:coinB             — head-to-head comparison pages
//   /convert/:coin/:fiat          — "How much is X worth in Y" pages
//
// Kept in one file so sitemap.xml generation and the prerender script can
// share the same source of truth.
// ─────────────────────────────────────────────────────────────────────────────

export interface CoinDef {
  /** URL slug used in routes. */
  slug: string;
  /** Display name. */
  name: string;
  /** Ticker symbol. */
  ticker: string;
  /** CoinGecko ID for price lookups. */
  cgId: string;
}

// Top 30 by market cap / interest. Order matters — the first 20 are used for
// the comparison matrix.
export const PROGRAMMATIC_COINS: CoinDef[] = [
  { slug: "bitcoin",     name: "Bitcoin",     ticker: "BTC",   cgId: "bitcoin" },
  { slug: "ethereum",    name: "Ethereum",    ticker: "ETH",   cgId: "ethereum" },
  { slug: "solana",      name: "Solana",      ticker: "SOL",   cgId: "solana" },
  { slug: "xrp",         name: "XRP",         ticker: "XRP",   cgId: "ripple" },
  { slug: "bnb",         name: "BNB",         ticker: "BNB",   cgId: "binancecoin" },
  { slug: "cardano",     name: "Cardano",     ticker: "ADA",   cgId: "cardano" },
  { slug: "dogecoin",    name: "Dogecoin",    ticker: "DOGE",  cgId: "dogecoin" },
  { slug: "avalanche",   name: "Avalanche",   ticker: "AVAX",  cgId: "avalanche-2" },
  { slug: "polkadot",    name: "Polkadot",    ticker: "DOT",   cgId: "polkadot" },
  { slug: "chainlink",   name: "Chainlink",   ticker: "LINK",  cgId: "chainlink" },
  { slug: "polygon",     name: "Polygon",     ticker: "MATIC", cgId: "matic-network" },
  { slug: "litecoin",    name: "Litecoin",    ticker: "LTC",   cgId: "litecoin" },
  { slug: "shiba-inu",   name: "Shiba Inu",   ticker: "SHIB",  cgId: "shiba-inu" },
  { slug: "uniswap",     name: "Uniswap",     ticker: "UNI",   cgId: "uniswap" },
  { slug: "near",        name: "NEAR",        ticker: "NEAR",  cgId: "near" },
  { slug: "arbitrum",    name: "Arbitrum",    ticker: "ARB",   cgId: "arbitrum" },
  { slug: "optimism",    name: "Optimism",    ticker: "OP",    cgId: "optimism" },
  { slug: "aptos",       name: "Aptos",       ticker: "APT",   cgId: "aptos" },
  { slug: "sui",         name: "Sui",         ticker: "SUI",   cgId: "sui" },
  { slug: "pepe",        name: "Pepe",        ticker: "PEPE",  cgId: "pepe" },
  { slug: "dogwifhat",   name: "dogwifhat",   ticker: "WIF",   cgId: "dogwifcoin" },
  { slug: "render",      name: "Render",      ticker: "RENDER",cgId: "render-token" },
  { slug: "fetch-ai",    name: "Fetch.ai",    ticker: "FET",   cgId: "fetch-ai" },
  { slug: "bittensor",   name: "Bittensor",   ticker: "TAO",   cgId: "bittensor" },
  { slug: "injective",   name: "Injective",   ticker: "INJ",   cgId: "injective-protocol" },
  { slug: "the-graph",   name: "The Graph",   ticker: "GRT",   cgId: "the-graph" },
  { slug: "aave",        name: "Aave",        ticker: "AAVE",  cgId: "aave" },
  { slug: "kaspa",       name: "Kaspa",       ticker: "KAS",   cgId: "kaspa" },
  { slug: "hedera",      name: "Hedera",      ticker: "HBAR",  cgId: "hedera" },
  { slug: "immutable-x", name: "Immutable X", ticker: "IMX",   cgId: "immutable-x" },
];

export const COIN_BY_SLUG: Record<string, CoinDef> = Object.fromEntries(
  PROGRAMMATIC_COINS.map((c) => [c.slug, c]),
);

// Realistic price targets per coin — picked to bracket the current market
// (some below, some above), since users search both "will X hit $5" and
// "will X hit $10000".
export const PRICE_TARGETS: Record<string, number[]> = {
  bitcoin:    [100_000, 150_000, 200_000, 500_000, 1_000_000],
  ethereum:   [5_000, 7_500, 10_000, 15_000, 25_000],
  solana:     [250, 500, 750, 1_000, 2_000],
  xrp:        [3, 5, 10, 25, 100],
  bnb:        [800, 1_000, 1_500, 2_000, 5_000],
  cardano:    [1, 2, 5, 10, 25],
  dogecoin:   [0.5, 1, 2, 5, 10],
  avalanche:  [50, 100, 200, 500, 1_000],
  polkadot:   [10, 25, 50, 100, 250],
  chainlink:  [25, 50, 100, 250, 500],
  polygon:    [1, 2, 5, 10, 25],
  litecoin:   [200, 500, 1_000, 2_000, 5_000],
  "shiba-inu":[0.00001, 0.0001, 0.001, 0.01, 0.1],
  uniswap:    [15, 25, 50, 100, 250],
  near:       [10, 25, 50, 100, 250],
  arbitrum:   [2, 5, 10, 25, 50],
  optimism:   [3, 5, 10, 25, 50],
  aptos:      [10, 25, 50, 100, 250],
  sui:        [5, 10, 25, 50, 100],
  pepe:       [0.00001, 0.0001, 0.001, 0.01, 0.1],
  dogwifhat:  [5, 10, 25, 50, 100],
  render:     [10, 25, 50, 100, 250],
  "fetch-ai": [3, 5, 10, 25, 50],
  bittensor:  [500, 1_000, 2_500, 5_000, 10_000],
  injective:  [50, 100, 250, 500, 1_000],
  "the-graph":[1, 2, 5, 10, 25],
  aave:       [250, 500, 1_000, 2_500, 5_000],
  kaspa:      [0.5, 1, 2, 5, 10],
  hedera:     [0.5, 1, 2, 5, 10],
  "immutable-x":[5, 10, 25, 50, 100],
};

export const TARGET_YEARS = [2026, 2027, 2028, 2030] as const;

export const SUPPORTED_FIATS = [
  { slug: "usd", name: "US Dollar",   symbol: "$",  flag: "USA" },
  { slug: "eur", name: "Euro",         symbol: "€",  flag: "EUR" },
  { slug: "gbp", name: "British Pound",symbol: "£",  flag: "UK"  },
] as const;

export type FiatCode = (typeof SUPPORTED_FIATS)[number]["slug"];

// Compact ticker formatter for displaying small / large numbers consistently.
export function fmtPrice(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1)     return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 0.01)  return n.toFixed(4);
  if (n >= 1e-6)  return n.toFixed(8);
  return n.toExponential(2);
}

// Build every slug combination for sitemap / prerender callers.
export function predictSlugs(): Array<{ coin: string; target: number; year: number }> {
  const out: Array<{ coin: string; target: number; year: number }> = [];
  for (const c of PROGRAMMATIC_COINS) {
    const targets = PRICE_TARGETS[c.slug] || [];
    for (const t of targets) for (const y of TARGET_YEARS) out.push({ coin: c.slug, target: t, year: y });
  }
  return out;
}

export function vsSlugs(): Array<{ a: string; b: string }> {
  const top = PROGRAMMATIC_COINS.slice(0, 20);
  const out: Array<{ a: string; b: string }> = [];
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) out.push({ a: top[i].slug, b: top[j].slug });
  }
  return out;
}

export function convertSlugs(): Array<{ coin: string; fiat: FiatCode }> {
  const out: Array<{ coin: string; fiat: FiatCode }> = [];
  for (const c of PROGRAMMATIC_COINS.slice(0, 20)) {
    for (const f of SUPPORTED_FIATS) out.push({ coin: c.slug, fiat: f.slug });
  }
  return out;
}