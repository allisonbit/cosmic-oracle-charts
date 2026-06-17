import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, memo, useEffect } from "react";
import React from 'react';
import { Loader2 } from "lucide-react";
import { SEO, StructuredData } from "@/components/MainSEO";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AdSenseManager, StickyFooterAd } from "@/components/ads";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSearchEnginePing } from "@/hooks/useSearchEnginePing";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";
import { RouteErrorBoundary } from "@/components/system/RouteErrorBoundary";

import { ScrollToTop } from "@/components/system/ScrollToTop";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// AdminRoute is lazy so its supabase `.from()` dependency (the heavy
// @supabase/supabase-js client) stays out of the initial bundle.
const AdminRoute = lazy(() => import("@/components/auth/AdminRoute").then(m => ({ default: m.AdminRoute })));

// Lazy load heavy global modals
const AIChatBubble = lazy(() => import("@/components/chat/AIChatBubble").then(m => ({ default: m.AIChatBubble })));
const QuickTradeModal = lazy(() => import("@/components/trading/QuickTradeModal").then(m => ({ default: m.QuickTradeModal })));

// Eager load critical pages
import Index from "./pages/Index";
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load non-critical pages for better initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sentiment = lazy(() => import("./pages/Sentiment"));
const Explorer = lazy(() => import("./pages/Explorer"));
const TokenDetail = lazy(() => import("./pages/TokenDetail"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnArticle = lazy(() => import("./pages/LearnArticle"));
const Contact = lazy(() => import("./pages/Contact"));
const Chain = lazy(() => import("./pages/Chain"));

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
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const RiskDisclaimer = lazy(() => import("./pages/RiskDisclaimer"));
const EditorialPolicy = lazy(() => import("./pages/EditorialPolicy"));
const Advertise = lazy(() => import("./pages/Advertise"));
const YearPrediction = lazy(() => import("./pages/YearPrediction"));
const Scanner = lazy(() => import("./pages/Scanner"));
const Admin = lazy(() => import("./pages/Admin"));
const MyHub = lazy(() => import("./pages/MyHub"));
const MyWatchlistPage = lazy(() => import("./pages/MyWatchlist"));
const MyPortfolioPage = lazy(() => import("./pages/MyPortfolio"));
const MyAlertsPage = lazy(() => import("./pages/MyAlerts"));
const MySettingsPage = lazy(() => import("./pages/MySettings"));
const MyWalletScanner = lazy(() => import("./pages/MyWalletScanner"));
const MySignals = lazy(() => import("./pages/MySignals"));
const MyPortfolioTracker = lazy(() => import("./pages/MyPortfolioTracker"));
const MySocial = lazy(() => import("./pages/MySocial"));
const MyTradeJournal = lazy(() => import("./pages/MyTradeJournal"));
const MyNewsFeed = lazy(() => import("./pages/MyNewsFeed"));
const MyDCAPlanner = lazy(() => import("./pages/MyDCAPlanner"));
const MyCopyTrading = lazy(() => import("./pages/MyCopyTrading"));
const Trade = lazy(() => import("./pages/Trade"));
const MarketPage = lazy(() => import("./pages/MarketPage"));
const Airdrops = lazy(() => import("./pages/Airdrops"));
const AirdropDetail = lazy(() => import("./pages/AirdropDetail"));
const ToolsHub = lazy(() => import("./pages/ToolsHub"));
const ProfitCalculator = lazy(() => import("./pages/tools/ProfitCalculator"));
const DCACalculator = lazy(() => import("./pages/tools/DCACalculator"));
const ILCalculator = lazy(() => import("./pages/tools/ILCalculator"));
const CompareHub = lazy(() => import("./pages/CompareHub"));
const CoinComparison = lazy(() => import("./pages/CoinComparison"));
const HowToBuyHub = lazy(() => import("./pages/HowToBuyHub"));
const HowToBuyCoin = lazy(() => import("./pages/HowToBuyCoin"));
const NewsHub = lazy(() => import("./pages/NewsHub"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const BitcoinLiquidationHeatmap = lazy(() => import("./pages/BitcoinLiquidationHeatmap"));
// Programmatic SEO templates — long-tail keyword pages (predict/$, vs, convert)
const PredictTarget = lazy(() => import("./pages/programmatic/PredictTarget"));
const VsCompare = lazy(() => import("./pages/programmatic/VsCompare"));
const Convert = lazy(() => import("./pages/programmatic/Convert"));
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
      // Quiet defaults — polling, background refresh, and focus-refetch are
      // OPT-IN per hook now. Static/slow-moving data (articles, legal, FAQ,
      // sitemap) no longer fires network calls on every focus/30s tick.
      // Real-time hooks (prices, signals, whales, order book, funding, strength)
      // set their own refetchInterval explicitly.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchIntervalInBackground: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 60_000, // 1 min — UI still feels live thanks to per-hook overrides
      gcTime: 1000 * 60 * 15,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 2,
      networkMode: 'offlineFirst',
    },
  },
  // Never throw query errors into React — handle them in the UI layer
  queryCache: undefined,
});

// Wrap a route element so each page has its own isolated error boundary.
// A crash on /dashboard cannot kill /predictions or the navbar.
const B = (el: JSX.Element) => <RouteErrorBoundary>{el}</RouteErrorBoundary>;


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
    <ThemeProvider>
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner position="top-right" closeButton richColors />
        <AppErrorBoundary>
          <BrowserRouter>
            <ScrollToTop />
            <ChunkLoadRecovery />
            <PageTracker />
            <AdSenseManager />
            <SEO />
            <StructuredData />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={B(<Index />)} />
                <Route path="/dashboard" element={B(<Dashboard />)} />

                <Route path="/sentiment" element={B(<Sentiment />)} />
                <Route path="/scanner" element={B(<Scanner />)} />
                <Route path="/explorer" element={B(<Explorer />)} />
                <Route path="/explorer/:chain/:address" element={B(<TokenDetail />)} />
                <Route path="/learn" element={B(<Learn />)} />
                <Route path="/learn/:slug" element={B(<LearnArticle />)} />
                <Route path="/contact" element={B(<Contact />)} />
                <Route path="/chain/:chainId" element={B(<Chain />)} />
                <Route path="/strength" element={B(<StrengthMeter />)} />
                <Route path="/strength-meter" element={B(<StrengthMeter />)} />
                <Route path="/crypto-strength-meter" element={B(<StrengthMeter />)} />
                <Route path="/factory" element={B(<CryptoFactory />)} />
                <Route path="/crypto-factory" element={B(<CryptoFactory />)} />
                <Route path="/factory/events" element={B(<FactoryEvents />)} />
                <Route path="/factory/onchain" element={B(<FactoryOnchain />)} />
                <Route path="/factory/narratives" element={B(<FactoryNarratives />)} />
                <Route path="/factory/news" element={B(<FactoryNews />)} />
                <Route path="/sitemap" element={B(<Sitemap />)} />
                <Route path="/insights" element={B(<Insights />)} />
                <Route path="/insights/:slug" element={B(<InsightArticle />)} />
                <Route path="/predictions" element={B(<PredictionHub />)} />
                <Route path="/price-prediction" element={B(<PredictionHub />)} />
                <Route path="/price-prediction/:coinId" element={B(<PricePrediction />)} />
                <Route path="/price-prediction/:coinId/2026" element={B(<YearPrediction />)} />
                <Route path="/price-prediction/:coinId/2027" element={B(<YearPrediction />)} />
                <Route path="/price-prediction/:coinId/2028" element={B(<YearPrediction />)} />
                <Route path="/price-prediction/:coinId/2030" element={B(<YearPrediction />)} />
                <Route path="/price-prediction/:coinId/:timeframe" element={B(<PricePrediction />)} />
                <Route path="/q/:slug" element={B(<QuestionIntent />)} />
                <Route path="/market/:slug" element={B(<MarketPage />)} />
                <Route path="/airdrops" element={B(<Airdrops />)} />
                <Route path="/airdrops/:id" element={B(<AirdropDetail />)} />

                <Route path="/tools" element={B(<ToolsHub />)} />
                <Route path="/polymarket" element={B(<ToolsHub />)} />
                <Route path="/tools/profit-calculator" element={B(<ProfitCalculator />)} />
                <Route path="/tools/dca-calculator" element={B(<DCACalculator />)} />
                <Route path="/tools/impermanent-loss-calculator" element={B(<ILCalculator />)} />
                <Route path="/compare" element={B(<CompareHub />)} />
                <Route path="/compare/:coins" element={B(<CoinComparison />)} />
                <Route path="/how-to-buy" element={B(<HowToBuyHub />)} />
                <Route path="/how-to-buy/:coin" element={B(<HowToBuyCoin />)} />
                <Route path="/news" element={B(<NewsHub />)} />
                <Route path="/news/:slug" element={B(<NewsArticle />)} />
                <Route path="/liquidations/bitcoin-heatmap" element={B(<BitcoinLiquidationHeatmap />)} />
                {/* Programmatic SEO long-tail pages */}
                <Route path="/predict/:coin/:target/:year" element={B(<PredictTarget />)} />
                <Route path="/vs/:coinA/:coinB" element={B(<VsCompare />)} />
                <Route path="/convert/:coin/:fiat" element={B(<Convert />)} />
                {/* Legal & About pages */}
                <Route path="/about" element={B(<About />)} />
                <Route path="/privacy-policy" element={B(<PrivacyPolicy />)} />
                <Route path="/terms" element={B(<Terms />)} />
                <Route path="/risk-disclaimer" element={B(<RiskDisclaimer />)} />
                <Route path="/editorial-policy" element={B(<EditorialPolicy />)} />
                <Route path="/advertise" element={B(<Advertise />)} />
                <Route path="/admin" element={B(<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>)} />
                <Route path="/my" element={B(<MyHub />)} />
                <Route path="/my/watchlist" element={B(<MyWatchlistPage />)} />
                <Route path="/my/portfolio" element={B(<MyPortfolioPage />)} />
                <Route path="/my/alerts" element={B(<MyAlertsPage />)} />
                <Route path="/my/settings" element={B(<MySettingsPage />)} />
                <Route path="/my/scanner" element={B(<MyWalletScanner />)} />
                <Route path="/my/signals" element={B(<MySignals />)} />
                <Route path="/my/tracker" element={B(<MyPortfolioTracker />)} />
                <Route path="/my/social" element={B(<MySocial />)} />
                <Route path="/my/journal" element={B(<MyTradeJournal />)} />
                <Route path="/my/news" element={B(<MyNewsFeed />)} />
                <Route path="/my/dca" element={B(<MyDCAPlanner />)} />
                <Route path="/my/copy" element={B(<MyCopyTrading />)} />
                <Route path="/trade" element={B(<Trade />)} />
                <Route path="*" element={B(<NotFound />)} />
              </Routes>
            </Suspense>
            <AIChatBubble />
            <QuickTradeModal />
            {/* Global sticky footer ad — appears on all pages, dismissible, z-40 so mobile nav (z-50) stays on top */}
            <StickyFooterAd showDelay={4000} />
          </BrowserRouter>
        </AppErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
);

export default App;
