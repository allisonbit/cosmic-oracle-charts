import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, memo } from "react";
import { Loader2 } from "lucide-react";
import { SEO, StructuredData } from "@/components/SEO";
import { AdSenseManager } from "@/components/ads/AdSenseManager";
import { usePageTracking } from "@/hooks/usePageTracking";

// Eager load critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sentiment = lazy(() => import("./pages/Sentiment"));
const Explorer = lazy(() => import("./pages/Explorer"));
const Learn = lazy(() => import("./pages/Learn"));
const Contact = lazy(() => import("./pages/Contact"));
const Chain = lazy(() => import("./pages/Chain"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const StrengthMeter = lazy(() => import("./pages/StrengthMeter"));
const CryptoFactory = lazy(() => import("./pages/CryptoFactory"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const Insights = lazy(() => import("./pages/Insights"));
const InsightArticle = lazy(() => import("./pages/InsightArticle"));
const PricePrediction = lazy(() => import("./pages/PricePrediction"));
const PredictionHub = lazy(() => import("./pages/PredictionHub"));
const QuestionIntent = lazy(() => import("./pages/QuestionIntent"));
const MarketQuestion = lazy(() => import("./pages/MarketQuestion"));
const CoinMarket = lazy(() => import("./pages/CoinMarket"));

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
      refetchOnWindowFocus: false, // Disable to reduce unnecessary fetches
      refetchOnReconnect: true,
      refetchOnMount: false, // Use cached data on mount
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 15000),
      staleTime: 30000, // 30 seconds stale time
      gcTime: 1000 * 60 * 10, // 10 minutes cache
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// Page tracking wrapper component
const PageTracker = memo(function PageTracker() {
  usePageTracking();
  return null;
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner position="top-right" closeButton richColors />
      <BrowserRouter>
        <PageTracker />
        <AdSenseManager />
        <SEO />
        <StructuredData />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/sentiment" element={<Sentiment />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/chain/:chainId" element={<Chain />} />
            <Route path="/strength" element={<StrengthMeter />} />
            <Route path="/strength-meter" element={<StrengthMeter />} />
            <Route path="/factory" element={<CryptoFactory />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<InsightArticle />} />
            <Route path="/predictions" element={<PredictionHub />} />
            <Route path="/price-prediction" element={<PredictionHub />} />
            <Route path="/price-prediction/:coinId" element={<PricePrediction />} />
            <Route path="/price-prediction/:coinId/:timeframe" element={<PricePrediction />} />
            <Route path="/q/:slug" element={<QuestionIntent />} />
            <Route path="/market/best-crypto-to-buy-today" element={<MarketQuestion questionSlug="best-crypto-to-buy-today" />} />
            <Route path="/market/top-crypto-gainers-today" element={<MarketQuestion questionSlug="top-crypto-gainers-today" />} />
            <Route path="/market/crypto-market-prediction-today" element={<MarketQuestion questionSlug="crypto-market-prediction-today" />} />
            <Route path="/market/which-crypto-will-go-up-today" element={<MarketQuestion questionSlug="which-crypto-will-go-up-today" />} />
            <Route path="/market/crypto-losers-today" element={<MarketQuestion questionSlug="crypto-losers-today" />} />
            <Route path="/market/is-crypto-going-up-today" element={<MarketQuestion questionSlug="is-crypto-going-up-today" />} />
            {/* Weekly market questions */}
            <Route path="/market/best-crypto-to-buy-this-week" element={<MarketQuestion questionSlug="best-crypto-to-buy-this-week" />} />
            <Route path="/market/crypto-prediction-this-week" element={<MarketQuestion questionSlug="crypto-prediction-this-week" />} />
            <Route path="/market/crypto-to-watch-this-week" element={<MarketQuestion questionSlug="crypto-to-watch-this-week" />} />
            <Route path="/market/top-crypto-gainers-this-week" element={<MarketQuestion questionSlug="top-crypto-gainers-this-week" />} />
            {/* Monthly market questions */}
            <Route path="/market/crypto-prediction-january-2025" element={<MarketQuestion questionSlug="crypto-prediction-january-2025" />} />
            <Route path="/market/best-crypto-to-buy-january-2025" element={<MarketQuestion questionSlug="best-crypto-to-buy-january-2025" />} />
            <Route path="/market/top-crypto-to-invest-2025" element={<MarketQuestion questionSlug="top-crypto-to-invest-2025" />} />
            <Route path="/market/crypto-outlook-2025" element={<MarketQuestion questionSlug="crypto-outlook-2025" />} />
            {/* General high-intent questions */}
            <Route path="/market/next-crypto-to-explode" element={<MarketQuestion questionSlug="next-crypto-to-explode" />} />
            <Route path="/market/safest-crypto-to-invest" element={<MarketQuestion questionSlug="safest-crypto-to-invest" />} />
            <Route path="/market/cheap-crypto-to-buy-now" element={<MarketQuestion questionSlug="cheap-crypto-to-buy-now" />} />
            <Route path="/market/undervalued-crypto-to-buy" element={<MarketQuestion questionSlug="undervalued-crypto-to-buy" />} />
            <Route path="/market/crypto-with-most-potential" element={<MarketQuestion questionSlug="crypto-with-most-potential" />} />
            {/* Coin market pages */}
            <Route path="/markets/:coinId" element={<CoinMarket />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;