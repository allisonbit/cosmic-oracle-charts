import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Sitemap from "vite-plugin-sitemap";

// All static routes for sitemap generation
const staticRoutes = [
  "/",
  "/dashboard",
  "/predictions",
  "/strength",
  "/strength-meter",
  "/factory",
  "/factory/events",
  "/factory/onchain",
  "/factory/narratives",
  "/factory/news",
  "/portfolio",
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
  // Authenticated user hub pages
  "/my",
  "/my/portfolio",
  "/my/scanner",
  "/my/watchlist",
  "/my/alerts",
  "/my/signals",
  "/my/settings",
  "/my/journal",
  "/my/news",
  "/my/dca",
  "/my/copy",
  "/my/social",
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

// Top crypto prediction routes (for SEO)
const topCryptoIds = [
  'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano', 'dogecoin',
  'polkadot', 'chainlink', 'avalanche-2', 'matic-network', 'shiba-inu', 'litecoin',
  'uniswap', 'cosmos', 'near', 'arbitrum', 'optimism', 'aptos', 'sui', 'pepe', 'floki', 'bonk',
  'toncoin', 'tron', 'stellar', 'monero', 'okb', 'hedera', 'filecoin', 'vechain',
  'internet-computer', 'render-token', 'fetch-ai', 'injective-protocol', 'kaspa', 'theta-token'
];

const predictionRoutes = topCryptoIds.flatMap(id => [
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

// Generate question-intent routes for top 10 coins
const questionIntentCoins = ['bitcoin', 'ethereum', 'solana', 'ripple', 'cardano', 'dogecoin', 'shiba-inu', 'pepe', 'chainlink', 'polkadot'];
const questionRoutes = questionIntentCoins.flatMap(coin => 
  questionPatterns.map(pattern => `/q/${pattern.replace('{coin}', coin)}`)
);

const marketQuestionRoutes: string[] = [];
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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: { minify: false, sourcemap: true,
    // Let Vite/Rollup handle chunking automatically.
    // Our previous manualChunks split introduced a production-only TDZ error
    // ("Cannot access 'S' before initialization"), resulting in a black screen after deploy.
  },
}));
