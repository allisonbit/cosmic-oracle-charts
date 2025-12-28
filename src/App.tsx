import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, memo } from "react";
import { Loader2 } from "lucide-react";
import { SEO, StructuredData } from "@/components/SEO";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner position="top-right" closeButton richColors />
      <BrowserRouter>
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
            <Route path="/factory" element={<CryptoFactory />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<InsightArticle />} />
            <Route path="/predictions" element={<PredictionHub />} />
            <Route path="/price-prediction" element={<PredictionHub />} />
            <Route path="/price-prediction/:coinId" element={<PricePrediction />} />
            <Route path="/price-prediction/:coinId/:timeframe" element={<PricePrediction />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;