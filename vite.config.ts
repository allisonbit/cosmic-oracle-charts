import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// Supabase config is ENV-ONLY (no hardcoded project refs). Set in Vercel and
// locally in .env to enable the cloud overlay (auth/portfolio sync):
//   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=<anon publishable key>
// Missing vars are FINE: the app runs fully standalone (market data,
// predictions, game, watchlist are all live from public APIs) and
// supabase/client.ts falls back to a disabled client with a console warning.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Accept every common naming convention — Vercel secrets added under
  // SUPABASE_*/NEXT_PUBLIC_* names work identically at build time.
  const resolvedSupabaseUrl =
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";
  const resolvedSupabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (mode === "production" && (!resolvedSupabaseUrl || !resolvedSupabaseKey)) {
    console.warn(
      "[build] Supabase env vars not set — bundling in standalone mode. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable the auth/cloud overlay.",
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
          // Mascot JPEGs (70-108KB) are runtime-cached on first use instead of
          // inflating every visitor's install-time precache.
          globIgnores: ["**/oracle-bot-mascot*.jpg", "**/og-image.jpg", "**/icon-512*.png"],
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
            { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Emit under the VITE_* names the client reads, regardless of which
      // convention the build environment provided.
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(resolvedSupabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(resolvedSupabaseKey),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(resolvedSupabaseKey),
    },
    build: {
      minify: true,
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-charts': ['recharts'],
            'vendor-html2canvas': ['html2canvas'],
          },
        },
      },
    },
  };
});
