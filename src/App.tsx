import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, memo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SEO, StructuredData } from "@/components/SEO";
import { AdSenseManager } from "@/components/ads/AdSenseManager";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSearchEnginePing } from "@/hooks/useSearchEnginePing";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";
import { GlobalSchemas } from "@/components/seo/RichSchemas";

// Eager load critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sentiment = lazy(() => import("./pages/Sentiment"));
const Explorer = lazy(() => import("./pages/Explorer"));
const TokenDetail = lazy(() => import("./pages/TokenDetail"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnArticle = lazy(() => import("./pages/LearnArticle"));
const Contact = lazy(() => import("./pages/Contact"));
const Chain = lazy(() => import("./pages/Chain"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const StrengthMeter = lazy(() => import("./pages/StrengthMeter"));
const CryptoFactory = lazy(() => import("./pages/CryptoFactory"));
const FactoryEvents = lazy(() => import("./pages/FactoryEvents"));
const FactoryOnchain = lazy(() => import("./pages/FactoryOnchain"));
const FactoryNarratives = lazy(() => import("./pages/FactoryNarratives"));
const FactoryNews = lazy(() => import("./pages/FactoryNews"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Insights = lazy(() => import("./pages/Insights"));
const InsightArticle = lazy(() => import("./pages/InsightArticle"));
const PricePrediction = lazy(() => import("./pages/PricePrediction"));
const PredictionHub = lazy(() => import("./pages/PredictionHub"));
const QuestionIntent = lazy(() => import("./pages/QuestionIntent"));
const MarketQuestion = lazy(() => import("./pages/MarketQuestion"));
const CoinMarket = lazy(() => import("./pages/CoinMarket"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const RiskDisclaimer = lazy(() => import("./pages/RiskDisclaimer"));
const Admin = lazy(() => import("./pages/Admin"));

// Loading fallback component
const PageLoader = memo(function PageLoader() {
  return (
    <div className="min-h-screen cosmic-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Refetch on window focus for fresh data
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Always get fresh data on mount
      refetchInterval: false, // Individual hooks control their own intervals
      refetchIntervalInBackground: true, // Keep fetching when tab not focused - 24/7 updates
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 15000, // 15 seconds stale time for fresher data
      gcTime: 1000 * 60 * 15, // 15 minutes cache
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 2,
      networkMode: 'offlineFirst',
    },
  },
});

// Page tracking wrapper component
const PageTracker = memo(function PageTracker() {
  usePageTracking();
  useSearchEnginePing();
  return null;
});

// Auto-recover from stale chunk cache after deployments (prevents blank screens)
const ChunkLoadRecovery = memo(function ChunkLoadRecovery() {
  useEffect(() => {
    const key = "__oracle_chunk_recover_v1";

    const shouldRecover = (message: string) =>
      /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
        message
      );

    const recoverOnce = () => {
      try {
        if (sessionStorage.getItem(key) === "1") return;
        sessionStorage.setItem(key, "1");
      } catch {
        // ignore
      }
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      const msg = event?.message || "";
      if (shouldRecover(msg)) recoverOnce();
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = (event?.reason as any)?.message || String(event?.reason || "");
      if (shouldRecover(reason)) recoverOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner position="top-right" closeButton richColors />
      <AppErrorBoundary>
        <BrowserRouter>
          <ChunkLoadRecovery />
          <PageTracker />
          <AdSenseManager />
          <SEO />
          <StructuredData />
          <GlobalSchemas />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/sentiment" element={<Sentiment />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:slug" element={<LearnArticle />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/chain/:chainId" element={<Chain />} />
              <Route path="/strength" element={<StrengthMeter />} />
              <Route path="/strength-meter" element={<StrengthMeter />} />
              <Route path="/factory" element={<CryptoFactory />} />
              <Route path="/factory/events" element={<FactoryEvents />} />
              <Route path="/factory/onchain" element={<FactoryOnchain />} />
              <Route path="/factory/narratives" element={<FactoryNarratives />} />
              <Route path="/factory/news" element={<FactoryNews />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/insights/:slug" element={<InsightArticle />} />
              <Route path="/predictions" element={<PredictionHub />} />
              <Route path="/price-prediction" element={<PredictionHub />} />
              <Route path="/price-prediction/:coinId" element={<PricePrediction />} />
              <Route path="/price-prediction/:coinId/:timeframe" element={<PricePrediction />} />
              <Route path="/q/:slug" element={<QuestionIntent />} />
              <Route
                path="/market/best-crypto-to-buy-today"
                element={<MarketQuestion questionSlug="best-crypto-to-buy-today" />}
              />
              <Route
                path="/market/top-crypto-gainers-today"
                element={<MarketQuestion questionSlug="top-crypto-gainers-today" />}
              />
              <Route
                path="/market/crypto-market-prediction-today"
                element={<MarketQuestion questionSlug="crypto-market-prediction-today" />}
              />
              <Route
                path="/market/which-crypto-will-go-up-today"
                element={<MarketQuestion questionSlug="which-crypto-will-go-up-today" />}
              />
              <Route
                path="/market/crypto-losers-today"
                element={<MarketQuestion questionSlug="crypto-losers-today" />}
              />
              <Route
                path="/market/is-crypto-going-up-today"
                element={<MarketQuestion questionSlug="is-crypto-going-up-today" />}
              />
              {/* Weekly market questions */}
              <Route
                path="/market/best-crypto-to-buy-this-week"
                element={<MarketQuestion questionSlug="best-crypto-to-buy-this-week" />}
              />
              <Route
                path="/market/crypto-prediction-this-week"
                element={<MarketQuestion questionSlug="crypto-prediction-this-week" />}
              />
              <Route
                path="/market/crypto-to-watch-this-week"
                element={<MarketQuestion questionSlug="crypto-to-watch-this-week" />}
              />
              <Route
                path="/market/top-crypto-gainers-this-week"
                element={<MarketQuestion questionSlug="top-crypto-gainers-this-week" />}
              />
              {/* Monthly market questions */}
              <Route
                path="/market/crypto-prediction-january-2025"
                element={<MarketQuestion questionSlug="crypto-prediction-january-2025" />}
              />
              <Route
                path="/market/best-crypto-to-buy-january-2025"
                element={<MarketQuestion questionSlug="best-crypto-to-buy-january-2025" />}
              />
              <Route
                path="/market/top-crypto-to-invest-2025"
                element={<MarketQuestion questionSlug="top-crypto-to-invest-2025" />}
              />
              <Route
                path="/market/crypto-outlook-2025"
                element={<MarketQuestion questionSlug="crypto-outlook-2025" />}
              />
              {/* General high-intent questions */}
              <Route
                path="/market/next-crypto-to-explode"
                element={<MarketQuestion questionSlug="next-crypto-to-explode" />}
              />
              <Route
                path="/market/safest-crypto-to-invest"
                element={<MarketQuestion questionSlug="safest-crypto-to-invest" />}
              />
              <Route
                path="/market/cheap-crypto-to-buy-now"
                element={<MarketQuestion questionSlug="cheap-crypto-to-buy-now" />}
              />
              <Route
                path="/market/undervalued-crypto-to-buy"
                element={<MarketQuestion questionSlug="undervalued-crypto-to-buy" />}
              />
              <Route
                path="/market/crypto-with-most-potential"
                element={<MarketQuestion questionSlug="crypto-with-most-potential" />}
              />
              {/* Coin market pages */}
              <Route path="/markets/:coinId" element={<CoinMarket />} />
              {/* Legal & About pages */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/risk-disclaimer" element={<RiskDisclaimer />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;