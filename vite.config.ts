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
const predictionRoutes = [
  "/price-prediction/bitcoin",
  "/price-prediction/bitcoin/daily",
  "/price-prediction/bitcoin/weekly",
  "/price-prediction/bitcoin/monthly",
  "/price-prediction/ethereum",
  "/price-prediction/ethereum/daily",
  "/price-prediction/ethereum/weekly",
  "/price-prediction/ethereum/monthly",
  "/price-prediction/solana",
  "/price-prediction/solana/daily",
  "/price-prediction/solana/weekly",
  "/price-prediction/solana/monthly",
  "/price-prediction/binancecoin",
  "/price-prediction/ripple",
  "/price-prediction/cardano",
  "/price-prediction/dogecoin",
  "/price-prediction/polkadot",
  "/price-prediction/chainlink",
  "/price-prediction/avalanche-2",
  "/price-prediction/matic-network",
  "/price-prediction/shiba-inu",
  "/price-prediction/litecoin",
  "/price-prediction/uniswap",
  "/price-prediction/cosmos",
  "/price-prediction/near",
  "/price-prediction/arbitrum",
  "/price-prediction/optimism",
  "/price-prediction/aptos",
  "/price-prediction/sui",
  "/price-prediction/pepe",
  "/price-prediction/floki",
  "/price-prediction/bonk",
];

// All routes combined
const allRoutes = [...staticRoutes, ...chainRoutes, ...predictionRoutes];

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
