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
  "/portfolio",
  "/sentiment",
  "/explorer",
  "/learn",
  "/insights",
  "/contact",
  "/sitemap",
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

// Top crypto prediction routes (for SEO)
const topCryptoIds = [
  'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano', 'dogecoin',
  'polkadot', 'chainlink', 'avalanche-2', 'matic-network', 'shiba-inu', 'litecoin',
  'uniswap', 'cosmos', 'near', 'arbitrum', 'optimism', 'aptos', 'sui', 'pepe', 'floki', 'bonk'
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

// All routes combined
const allRoutes = [...staticRoutes, ...chainRoutes, ...predictionRoutes, ...questionRoutes];

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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
        },
      },
    },
  },
}));
