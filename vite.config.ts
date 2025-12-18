import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Sitemap from "vite-plugin-sitemap";

// All routes for sitemap generation
const dynamicRoutes = [
  "/",
  "/dashboard",
  "/strength",
  "/factory",
  "/portfolio",
  "/sentiment",
  "/explorer",
  "/learn",
  "/contact",
  "/sitemap",
  "/insights",
  "/chain/ethereum",
  "/chain/solana",
  "/chain/base",
  "/chain/arbitrum",
  "/chain/polygon",
  "/chain/optimism",
  "/chain/avalanche",
  "/chain/bnb",
];

// Generate blog slug routes dynamically based on content themes
const blogCategories = [
  'market-structure', 'on-chain-analytics', 'defi-deep-dive', 'bitcoin-analysis',
  'ethereum-ecosystem', 'altcoin-research', 'risk-management', 'market-sentiment',
  'technical-analysis', 'macro-economics', 'blockchain-technology', 'layer-2-solutions',
  'stablecoin-analysis', 'nft-digital-assets', 'trading-psychology', 'regulatory-landscape',
  'capital-rotation', 'derivatives-analysis', 'network-fundamentals', 'investment-strategies'
];

// Add blog category routes for better SEO
const allRoutes = [
  ...dynamicRoutes,
  ...blogCategories.map(cat => `/learn#${cat}`)
];

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
      generateRobotsTxt: false, // We already have a custom robots.txt
      changefreq: "daily",
      priority: 0.8,
      lastmod: new Date(),
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
