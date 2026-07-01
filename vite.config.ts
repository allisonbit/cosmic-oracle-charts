import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const DEFAULT_SUPABASE_URL = "https://qynszkirmcrldqmiplwh.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InF5bnN6a2lybWNybGRxbWlwbHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzU2NTQsImV4cCI6MjA4MDc1MTY1NH0.8Jr8lpfAifN-ozIQmA9_wU5YqYjZVlq3Q35KccSI-g0";

export default defineConfig(({ mode, command }) => {
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
      console.warn("[build] Warning: VITE_SUPABASE_PUBLISHABLE_KEY is not set.");
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
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "coingecko-api-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 5,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        manifest: {
          name: "Oracle Bull - AI Crypto Intelligence",
          short_name: "Oracle Bull",
          description: "Free AI-powered cryptocurrency price predictions, whale tracking, market sentiment analysis, and blockchain dashboards for 1000+ tokens.",
          theme_color: "#2563eb",
          background_color: "#0f172a",
          display: "standalone",
          icons: [
            { src: "oracle-bot-mascot.jpg", sizes: "192x192", type: "image/jpeg", purpose: "any" },
            { src: "oracle-bot-mascot.jpg", sizes: "512x512", type: "image/jpeg", purpose: "any" },
            { src: "oracle-bot-mascot.jpg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
          ],
        },
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
      sourcemap: false,
      cssCodeSplit: true,
    },
  };
});
