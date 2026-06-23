import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Sitemap from "vite-plugin-sitemap";
import { VitePWA } from "vite-plugin-pwa";
import insightSlugs from "./scripts/insight-slugs.json";
import airdropSlugs from "./scripts/airdrop-slugs.json";

// All static routes for sitemap generation
const staticRoutes = [
  "/",
  "/dashboard",
  "/tools",
  "/tools/profit-calculator",
  "/tools/dca-calculator",
  "/tools/impermanent-loss-calculator",
  "/airdrops",
  "/predictions",
  "/price-prediction",
  "/strength",
  "/strength-meter",
  "/factory",
  "/factory/events",
  "/factory/onchain",
  "/factory/narratives",
  "/factory/news",
  "/scanner",
  "/sentiment",
  "/explorer",
  "/learn",
  "/insights",
  "/crypto-strength-meter",
  "/crypto-factory",
  "/liquidations/bitcoin-heatmap",
  "/contact",
  "/sitemap",
  "/about",
  "/advertise",
  "/editorial-policy",
  "/privacy-policy",
  "/terms",
  "/risk-disclaimer",
  "/trade",
  // My Hub Routes
  "/my",
  "/my/watchlist",
  "/my/portfolio",
  "/my/alerts",
  "/my/settings",
  "/my/scanner",
  "/my/signals",
  "/my/tracker",
  "/my/social",
  "/my/journal",
  "/my/news",
  "/my/dca",
  "/my/copy",
  "/news",
];

// Chain routes
const chainRoutes = [
  "/chain/ethereum",
  "/chain/solana",
  "/chain/base",
  "/chain/arbitrum",
  "/chain/polygon",
  "/chain/optimism",
  "/chain/avalanche",
  "/chain/bnb",
];

// Educational article routes for SEO
const educationalRoutes = [
  "/learn/what-is-crypto-market-sentiment",
  "/learn/how-ai-is-used-in-crypto-market-analysis",
  "/learn/bitcoin-market-cycles-explained",
  "/learn/risk-management-in-volatile-crypto-markets",
  "/learn/how-to-analyze-altcoins-using-market-data",
  "/learn/technical-analysis-vs-sentiment-analysis",
  "/learn/on-chain-data-explained-for-beginners",
  "/learn/how-market-psychology-affects-crypto-prices",
  "/learn/how-whales-influence-market-trends",
  "/learn/understanding-liquidity-in-crypto-markets",
  // Forex articles
  "/learn/what-is-the-forex-market-and-how-does-it-work",
  "/learn/forex-market-structure-explained",
  "/learn/currency-sentiment-analysis-explained",
  "/learn/forex-vs-crypto-key-market-differences",
  "/learn/macroeconomic-factors-that-move-forex-markets",
  // AI articles
  "/learn/how-ai-forecasting-models-work-in-finance",
  "/learn/limitations-of-ai-market-predictions",
  "/learn/indicators-vs-ai-models-whats-the-difference",
  "/learn/data-sources-used-in-market-intelligence-platforms",
  "/learn/how-to-read-market-analytics-dashboards",
  // New high-traffic educational articles
  "/learn/what-is-bitcoin-halving-and-why-does-it-matter",
  "/learn/how-to-read-crypto-candlestick-charts",
  "/learn/what-is-defi-decentralized-finance-explained",
  "/learn/what-is-a-crypto-wallet-and-how-to-use-it",
  "/learn/how-to-spot-a-crypto-bull-market",
  "/learn/how-to-spot-a-crypto-bear-market",
  "/learn/what-is-ethereum-staking-explained",
  "/learn/what-are-layer-2-blockchains",
  "/learn/what-is-tokenomics-explained",
  "/learn/how-to-read-a-crypto-whitepaper",
  "/learn/what-is-market-capitalization-in-crypto",
  "/learn/dollar-cost-averaging-dca-strategy-for-crypto",
  "/learn/how-to-use-stop-loss-orders-in-crypto-trading",
  "/learn/crypto-tax-basics-what-you-need-to-know",
  "/learn/what-is-a-crypto-airdrop-and-how-to-get-one",
  "/learn/best-crypto-exchanges-compared",
  "/learn/how-to-buy-bitcoin-for-beginners",
  "/learn/how-to-buy-ethereum-for-beginners",
  "/learn/how-to-buy-solana-for-beginners",
  "/learn/what-is-nft-and-how-does-it-work",
  "/learn/what-is-web3-explained",
  "/learn/proof-of-work-vs-proof-of-stake",
  "/learn/what-is-a-blockchain-explained-simply",
  "/learn/crypto-portfolio-diversification-strategy",
  "/learn/how-to-identify-crypto-scams",
  "/learn/what-are-stablecoins-and-how-do-they-work",
];

// Top crypto prediction routes (for SEO) — 60+ coins for maximum sitemap coverage
const topCryptoIds = [
  // Tier 1 — Blue chips
  'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'toncoin',
  // Tier 2 — Large caps
  'cardano', 'dogecoin', 'polkadot', 'chainlink', 'avalanche-2', 'matic-network',
  'shiba-inu', 'litecoin', 'uniswap', 'cosmos', 'near', 'arbitrum', 'optimism',
  'aptos', 'sui', 'tron', 'stellar', 'monero', 'okb', 'hedera', 'filecoin', 'vechain',
  // Tier 3 — Mid caps
  'internet-computer', 'render-token', 'fetch-ai', 'injective-protocol', 'kaspa',
  'theta-token', 'pepe', 'floki', 'bonk', 'bittensor', 'sei-network',
  'starknet', 'worldcoin-wld', 'wormhole', 'jupiter-ag', 'pyth-network',
  'jito-governance-token', 'pendle', 'eigenlayer', 'dogwifcoin', 'brett-based',
  'mog-coin', 'mantle', 'immutable-x', 'blur', 'beam-2', 'gala',
  // Tier 4 — Trending / high search volume
  'hamster-kombat', 'notcoin', 'catizen', 'dogs-2',
  'raydium', 'helium', 'hive', 'terra-luna-2',
  'elrond', 'harmony', 'zilliqa', 'enjincoin', 'decentraland', 'sandbox',
  'axie-infinity', 'the-graph', 'aave', 'compound', 'maker', 'synthetix-network-token',
  'curve-dao-token', 'yearn-finance', '1inch', 'balancer', 'sushi',
  // Tier 5 — Additional high-search coins
  'ondo-finance', 'hyperliquid', 'berachain-bera', 'sonic-3', 'kaito',
  'virtual-protocol', 'ai16z', 'story-protocol', 'movement', 'abstract',
  'cronos', 'kava', 'band-protocol', 'ocean-protocol', 'numeraire',
  'reserve-rights-token', 'orbs', 'superfarm', 'api3', 'dydx',
  'loopring', 'zksync', 'scroll', 'linea', 'base',
  'bitcoin-cash', 'bitcoin-sv', 'dash', 'zcash',
  'ravencoin', 'digibyte', 'horizen', 'komodo', 'pivx',
  'eos', 'tezos', 'nano', 'waves', 'qtum',
  'icon', 'ontology', 'nuls', 'elastos', 'ark',
  'neo', 'algorand', 'iota', 'nem',
  'xdc-network', 'quant-network', 'fantom', 'celo', 'klaytn',
];

const predictionRoutes = [...new Set(topCryptoIds)].flatMap(id => [
  `/price-prediction/${id}`,
  `/price-prediction/${id}/daily`,
  `/price-prediction/${id}/weekly`,
  `/price-prediction/${id}/monthly`,
  // Year-based prediction pages — highest traffic keywords
  `/price-prediction/${id}/2026`,
  `/price-prediction/${id}/2027`,
  `/price-prediction/${id}/2028`,
  `/price-prediction/${id}/2030`,
]);

// Question-intent routes for SEO
const questionPatterns = [
  'what-will-{coin}-price-be-today',
  'will-{coin}-go-up-today',
  '{coin}-price-prediction-today',
  'is-{coin}-bullish-today',
  'what-will-{coin}-price-be-this-week',
  'will-{coin}-go-up-this-week',
  '{coin}-price-prediction-this-week',
  '{coin}-weekly-forecast',
  'what-will-{coin}-price-be-this-month',
  'is-{coin}-a-good-investment-this-month',
  '{coin}-price-prediction-this-month',
  '{coin}-monthly-forecast',
  // Year-based patterns — massive search volume
  '{coin}-price-prediction-2026',
  '{coin}-price-prediction-2027',
  '{coin}-price-prediction-2028',
  '{coin}-price-prediction-2030',
  'will-{coin}-reach-all-time-high-in-2026',
  'is-{coin}-a-good-investment-in-2026',
  'is-{coin}-going-up-in-2026',
  '{coin}-price-target-2026',
  '{coin}-price-target-2030',
  // Sentiment/action patterns
  'should-i-buy-{coin}-now',
  'is-{coin}-undervalued',
  'is-{coin}-overvalued',
  'is-{coin}-going-to-crash',
  'will-{coin}-recover',
  '{coin}-next-price-target',
];

// Generate question-intent routes for top 20 coins
const questionIntentCoins = [
  'bitcoin', 'ethereum', 'solana', 'ripple', 'cardano', 'dogecoin',
  'shiba-inu', 'pepe', 'chainlink', 'polkadot', 'binancecoin', 'toncoin',
  'avalanche-2', 'aptos', 'sui', 'arbitrum', 'near', 'tron', 'floki', 'bonk',
];
const questionRoutes = [...new Set(topCryptoIds)].flatMap(id => 
  questionPatterns.map(pattern => `/q/${pattern.replace('{coin}', id)}`)
);

// Generate unique pair comparisons for pSEO
const uniqueCoins = [...new Set(topCryptoIds)];
const comparisonRoutes: string[] = [];
for (let i = 0; i < uniqueCoins.length; i++) {
  for (let j = i + 1; j < uniqueCoins.length; j++) {
    comparisonRoutes.push(`/compare/${uniqueCoins[i]}-vs-${uniqueCoins[j]}`);
  }
}

// How-to-buy guides — one page per coin for beginner SEO
const howToBuyRoutes = [
  '/how-to-buy',
  ...uniqueCoins.map(id => `/how-to-buy/${id}`),
];

const marketQuestionRoutes = [
  "/market/best-crypto-to-buy-today",
  "/market/top-crypto-gainers-today",
  "/market/crypto-market-prediction-today",
  "/market/which-crypto-will-go-up-today",
  "/market/crypto-losers-today",
  "/market/is-crypto-going-up-today",
  "/market/best-crypto-to-buy-this-week",
  "/market/crypto-prediction-this-week",
  "/market/crypto-to-watch-this-week",
  "/market/top-crypto-gainers-this-week",
  "/market/next-crypto-to-explode",
  "/market/safest-crypto-to-invest",
  "/market/cheap-crypto-to-buy-now",
  "/market/undervalued-crypto-to-buy",
  "/market/crypto-with-most-potential",
  "/market/best-altcoins-to-buy",
  "/market/top-meme-coins",
  "/market/best-defi-tokens",
  "/market/top-ai-crypto-tokens",
  "/market/crypto-bull-run-indicator",
  "/market/altcoin-season-index",
  "/market/crypto-gainers-and-losers-today",
  "/market/crypto-fear-greed-index-today",
  "/market/best-layer-2-crypto",
  "/market/best-gaming-crypto-tokens",
  "/market/best-rwa-crypto-tokens",
  // Year-based market pages — strong seasonal search traffic
  "/market/best-crypto-to-buy-in-2026",
  "/market/best-crypto-to-buy-in-2027",
  "/market/top-crypto-picks-2026",
  "/market/crypto-market-outlook-2026",
  "/market/crypto-market-outlook-2027",
  "/market/best-crypto-for-long-term-2026",
  "/market/most-promising-crypto-2026",
  "/market/best-crypto-under-1-dollar",
  "/market/best-crypto-under-1-cent",
  "/market/best-low-cap-crypto",
  "/market/crypto-100x-potential",
  "/market/best-crypto-to-stake",
  "/market/best-crypto-dividends",
  "/market/crypto-with-highest-staking-rewards",
  "/market/bitcoin-dominance-today",
  "/market/ethereum-dominance-today",
  "/market/solana-ecosystem-tokens",
  "/market/ethereum-ecosystem-tokens",
  "/market/is-bitcoin-going-to-100k",
  "/market/will-ethereum-flip-bitcoin",
  "/market/will-solana-overtake-ethereum",
];

const coinMarketRoutes: string[] = [];

// Insight article routes — sourced from DB-exported slugs
const insightRoutes: string[] = (insightSlugs as string[]).map(
  (slug) => `/insights/${slug}`,
);

// Airdrop detail routes — sourced from snapshot of the airdrops edge function
const airdropRoutes: string[] = (airdropSlugs as string[]).map(
  (slug) => `/airdrops/${slug}`,
);

// Token detail explorer routes for top assets across major chains
const explorerTokenRoutes: string[] = [
  // Ethereum
  "/explorer/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "/explorer/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "/explorer/ethereum/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
  "/explorer/ethereum/0x514910771af9ca656af840dff83e8264ecf986ca", // LINK
  "/explorer/ethereum/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // UNI
  // Base
  "/explorer/base/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC
  // Arbitrum
  "/explorer/arbitrum/0xaf88d065e77c8cc2239327c5edb3a432268e5831", // USDC
  // Polygon
  "/explorer/polygon/0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
  // BNB
  "/explorer/bnb/0x55d398326f99059ff775485246999027b3197955", // USDT
  // Solana
  "/explorer/solana/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
];

// All routes combined — includes 1,700+ comparison pairs + how-to-buy guides for pSEO
const allRoutes = [
  ...staticRoutes,
  ...chainRoutes,
  ...predictionRoutes,
  ...questionRoutes,
  ...comparisonRoutes,
  ...howToBuyRoutes,
  ...marketQuestionRoutes,
  ...coinMarketRoutes,
  ...educationalRoutes,
  ...insightRoutes,
  ...explorerTokenRoutes,
  ...airdropRoutes,
];

const DEFAULT_SUPABASE_URL = "https://qynszkirmcrldqmiplwh.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InF5bnN6a2lybWNybGRxbWlwbHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzU2NTQsImV4cCI6MjA4MDc1MTY1NH0.8Jr8lpfAifN-ozIQmA9_wU5YqYjZVlq3Q35KccSI-g0";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Fail the production build loudly instead of silently shipping the
  // "missing-key" Supabase fallback (which 401s every request on the live site).
  // The anon/publishable key is safe to expose in the client bundle.
  const env = loadEnv(mode, process.cwd(), "");
  const resolvedSupabaseUrl =
    env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  const resolvedSupabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  process.env.VITE_SUPABASE_URL = resolvedSupabaseUrl;
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = resolvedSupabaseKey;
  process.env.VITE_SUPABASE_ANON_KEY = resolvedSupabaseKey;

  if (command === "build" && mode !== "development") {
    if (!resolvedSupabaseKey || resolvedSupabaseKey === "missing-key") {
      console.warn(
        "[build] Warning: VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) is not set. " +
          "The bundle will ship a placeholder and Supabase requests will 401 at runtime.",
      );
    }
    if (!resolvedSupabaseUrl) {
      console.warn("[build] Warning: VITE_SUPABASE_URL is not set.");
    }
  }
  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode !== "development" && Sitemap({
      hostname: "https://oraclebull.com",
      dynamicRoutes: allRoutes,
      generateRobotsTxt: false, // We have a custom robots.txt
      changefreq: "daily",
      priority: 0.8,
      lastmod: new Date(),
      exclude: [
        "/404",
        "/**/404",
        "/google0065b0c1a70540e0",
        "/html-sitemap",
        "/b4e2f8a1c3d5e7f9a0b2c4d6e8f0a1b3",
        "/indexnow-key",
      ],
      outDir: "dist",
      readable: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
            // StaleWhileRevalidate (not CacheFirst): serve cached data instantly
            // but refresh in the background, so users don't get stuck on up-to-5-min
            // stale crypto prices the way CacheFirst would within its TTL window.
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'coingecko-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: "Oracle Bull - AI Crypto Intelligence",
        short_name: "Oracle Bull",
        description: "Free AI-powered cryptocurrency price predictions, whale tracking, market sentiment analysis, and blockchain dashboards for 1000+ tokens.",
        theme_color: "#2563eb",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          {
            src: "oracle-bot-mascot.jpg",
            sizes: "192x192",
            type: "image/jpeg",
            purpose: "any"
          },
          {
            src: "oracle-bot-mascot.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "any"
          },
          {
            src: "oracle-bot-mascot.jpg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "maskable"
          }
        ]
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(resolvedSupabaseUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(resolvedSupabaseKey),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(resolvedSupabaseKey),
  },
  build: {
    minify: true,
    // No public source maps: they shipped ~24MB to the live site and exposed
    // unminified source. No error-tracking service consumes them, so they were
    // pure deploy bloat + a source-disclosure leak.
    sourcemap: false,
    cssCodeSplit: true,
    // Let Vite/Rollup handle chunking automatically.
    // Our previous manualChunks split introduced a production-only TDZ error
    // ("Cannot access 'S' before initialization"), resulting in a black screen after deploy.
  },
  };
});
