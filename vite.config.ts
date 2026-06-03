import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Sitemap from "vite-plugin-sitemap";
import { VitePWA } from "vite-plugin-pwa";

// All static routes for sitemap generation
const staticRoutes = [
  "/",
  "/dashboard",
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
  "/contact",
  "/sitemap",
  "/about",
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
  'hamster-kombat', 'notcoin', 'catizen', 'dogs-2', 'toncoin',
  'raydium', 'jupiter-ag', 'helium', 'hive', 'terra-luna-2',
  'elrond', 'harmony', 'zilliqa', 'enjincoin', 'decentraland', 'sandbox',
  'axie-infinity', 'the-graph', 'aave', 'compound', 'maker', 'synthetix-network-token',
  'curve-dao-token', 'yearn-finance', '1inch', 'balancer', 'sushi',
];

const predictionRoutes = [...new Set(topCryptoIds)].flatMap(id => [
  `/price-prediction/${id}`,
  `/price-prediction/${id}/daily`,
  `/price-prediction/${id}/weekly`,
  `/price-prediction/${id}/monthly`,
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
];

// Generate question-intent routes for top 20 coins
const questionIntentCoins = [
  'bitcoin', 'ethereum', 'solana', 'ripple', 'cardano', 'dogecoin',
  'shiba-inu', 'pepe', 'chainlink', 'polkadot', 'binancecoin', 'toncoin',
  'avalanche-2', 'aptos', 'sui', 'arbitrum', 'near', 'tron', 'floki', 'bonk',
];
const questionRoutes = questionIntentCoins.flatMap(coin =>
  questionPatterns.map(pattern => `/q/${pattern.replace('{coin}', coin)}`)
);

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
];

const coinMarketRoutes: string[] = [];

// All routes combined
const allRoutes = [...staticRoutes, ...chainRoutes, ...predictionRoutes, ...questionRoutes, ...marketQuestionRoutes, ...coinMarketRoutes, ...educationalRoutes];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    Sitemap({
      hostname: "https://oraclebull.com",
      dynamicRoutes: allRoutes,
      generateRobotsTxt: false, // We have a custom robots.txt
      changefreq: "daily",
      priority: 0.8,
      lastmod: new Date(),
      exclude: ["/404", "/**/404"],
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
            handler: 'CacheFirst',
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
            purpose: "any maskable"
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
  build: { 
    minify: true, 
    sourcemap: true,
    cssCodeSplit: true,
    // Let Vite/Rollup handle chunking automatically.
    // Our previous manualChunks split introduced a production-only TDZ error
    // ("Cannot access 'S' before initialization"), resulting in a black screen after deploy.
  },
}));
