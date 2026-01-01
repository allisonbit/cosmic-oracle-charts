import { useParams, useNavigate } from "react-router-dom";
import { memo, useMemo, useCallback, lazy, Suspense } from "react";
import { getChainById } from "@/lib/chainConfig";
import { useChainData } from "@/hooks/useChainData";
import { useChainForecast } from "@/hooks/useChainForecast";
import { useAdvancedChainData } from "@/hooks/useAdvancedChainData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { ChainOverviewPanel } from "@/components/chain/ChainOverviewPanel";
import { ChainSidebar } from "@/components/chain/ChainSidebar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { Footer } from "@/components/layout/Footer";
import { ChainQuickNav } from "@/components/chain/ChainQuickNav";
import { ChainExternalLinks } from "@/components/chain/ChainExternalLinks";
import { RealtimePriceTicker } from "@/components/chain/RealtimePriceTicker";
import { ChainSpecificMetrics } from "@/components/chain/ChainSpecificMetrics";
import { NetworkInfoPanel } from "@/components/chain/NetworkInfoPanel";
import { LiveTokenSearchPanel } from "@/components/chain/LiveTokenSearchPanel";
import { ChainFAQSchema, ChainFAQDisplay } from "@/components/chain/ChainFAQSchema";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LazySection } from "@/components/ui/LazySection";
import { ArrowLeft, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const EnhancedPriceAnalysis = lazy(() => import("@/components/chain/EnhancedPriceAnalysis").then(m => ({ default: m.EnhancedPriceAnalysis })));
const EnhancedPredictionDeepDive = lazy(() => import("@/components/chain/EnhancedPredictionDeepDive").then(m => ({ default: m.EnhancedPredictionDeepDive })));
const EnhancedWhaleActivityRadar = lazy(() => import("@/components/chain/EnhancedWhaleActivityRadar").then(m => ({ default: m.EnhancedWhaleActivityRadar })));
const EnhancedTokenHeatScanner = lazy(() => import("@/components/chain/EnhancedTokenHeatScanner").then(m => ({ default: m.EnhancedTokenHeatScanner })));
const EnhancedSmartMoneyFlow = lazy(() => import("@/components/chain/EnhancedSmartMoneyFlow").then(m => ({ default: m.EnhancedSmartMoneyFlow })));
const EnhancedRiskAnalyzer = lazy(() => import("@/components/chain/EnhancedRiskAnalyzer").then(m => ({ default: m.EnhancedRiskAnalyzer })));
const EnhancedSocialSentimentGalaxy = lazy(() => import("@/components/chain/EnhancedSocialSentimentGalaxy").then(m => ({ default: m.EnhancedSocialSentimentGalaxy })));
const EnhancedTokenDiscoveryEngine = lazy(() => import("@/components/chain/EnhancedTokenDiscoveryEngine").then(m => ({ default: m.EnhancedTokenDiscoveryEngine })));
const EnhancedDailySummary = lazy(() => import("@/components/chain/EnhancedDailySummary").then(m => ({ default: m.EnhancedDailySummary })));
const EnhancedChainHealthMonitor = lazy(() => import("@/components/chain/EnhancedChainHealthMonitor").then(m => ({ default: m.EnhancedChainHealthMonitor })));
const EnhancedDeepFinancialMetrics = lazy(() => import("@/components/chain/EnhancedDeepFinancialMetrics").then(m => ({ default: m.EnhancedDeepFinancialMetrics })));
const EnhancedAdvancedPredictionModels = lazy(() => import("@/components/chain/EnhancedAdvancedPredictionModels").then(m => ({ default: m.EnhancedAdvancedPredictionModels })));
const EnhancedAnomalyDetection = lazy(() => import("@/components/chain/EnhancedAnomalyDetection").then(m => ({ default: m.EnhancedAnomalyDetection })));
const EnhancedMultiChainComparison = lazy(() => import("@/components/chain/EnhancedMultiChainComparison").then(m => ({ default: m.EnhancedMultiChainComparison })));
const EnhancedInstitutionalView = lazy(() => import("@/components/chain/EnhancedInstitutionalView").then(m => ({ default: m.EnhancedInstitutionalView })));

// Component loader placeholder
const ComponentLoader = memo(function ComponentLoader() {
  return (
    <div className="holo-card p-4 sm:p-6 animate-pulse">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-32" />
    </div>
  );
});

export default function Chain() {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();
  const chain = chainId ? getChainById(chainId) : undefined;

  const { data: chainData, isLoading: chainLoading, isFetching: chainFetching, refetch: refetchChainData } = useChainData(chainId || "", !!chain);
  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useChainForecast(chainId || "", chainData, !!chain && !!chainData);
  const { data: advancedData, isLoading: advancedLoading, refetch: refetchAdvanced } = useAdvancedChainData(chainId || "", !!chain);
  const { data: pricesData } = useCryptoPrices();

  if (!chain) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
        <div className="holo-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-display text-foreground mb-4">Chain Not Found</h2>
          <p className="text-muted-foreground mb-6">The blockchain you're looking for doesn't exist in our system.</p>
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const chainPrice = useMemo(() => 
    pricesData?.prices?.find(p => p.symbol === chain.symbol),
    [pricesData?.prices, chain.symbol]
  );

  const handleRefreshAll = useCallback(() => {
    refetchChainData();
    refetchForecast();
    refetchAdvanced();
  }, [refetchChainData, refetchForecast, refetchAdvanced]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen cosmic-bg flex w-full">
        <ChainSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CryptoTicker />
          
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
              {/* Header with navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm w-fit">
                  <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${chainFetching ? 'bg-warning' : 'bg-success'} animate-pulse`} />
                    Live Data
                  </div>
                  <a
                    href={chain.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-xs font-medium"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Explorer
                  </a>
                </div>
              </div>

              <ChainQuickNav />

              {chainFetching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg w-fit">
                  <Loader2 className="w-4 h-4 animate-spin" /><span>Refreshing data...</span>
                </div>
              )}

              {/* Critical above-fold components - load immediately */}
              <ChainFAQSchema chain={chain} priceData={chainPrice} />
              <ChainOverviewPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} />
              <ChainExternalLinks chain={chain} />
              <NetworkInfoPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} />
              <RealtimePriceTicker chain={chain} />
              <ChainSpecificMetrics chain={chain} chainSpecificData={chainData?.chainSpecificData} />
              <LiveTokenSearchPanel chain={chain} />

              {/* Lazy load below-fold components */}
              <LazySection fallbackHeight="h-80">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <Suspense fallback={<ComponentLoader />}>
                    <EnhancedPriceAnalysis chain={chain} priceData={chainPrice} />
                  </Suspense>
                  <Suspense fallback={<ComponentLoader />}>
                    <EnhancedPredictionDeepDive chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
                  </Suspense>
                </div>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedChainHealthMonitor chain={chain} healthData={advancedData?.healthData} isLoading={advancedLoading} onRefresh={refetchAdvanced} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedDeepFinancialMetrics chain={chain} financialData={advancedData?.financialData} isLoading={advancedLoading} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedAdvancedPredictionModels chain={chain} predictionData={advancedData?.predictionData} isLoading={advancedLoading} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedAnomalyDetection chain={chain} anomalyData={advancedData?.anomalyData} isLoading={advancedLoading} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-80">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Suspense fallback={<ComponentLoader />}>
                    <EnhancedWhaleActivityRadar chain={chain} whaleActivity={chainData?.whaleActivity} isLoading={chainLoading} />
                  </Suspense>
                  <Suspense fallback={<ComponentLoader />}>
                    <EnhancedTokenHeatScanner chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} />
                  </Suspense>
                </div>
              </LazySection>

              <LazySection fallbackHeight="h-80">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Suspense fallback={<ComponentLoader />}>
                    <EnhancedSmartMoneyFlow chain={chain} smartMoneyFlow={chainData?.smartMoneyFlow} isLoading={chainLoading} />
                  </Suspense>
                  <Suspense fallback={<ComponentLoader />}>
                    <EnhancedRiskAnalyzer chain={chain} />
                  </Suspense>
                </div>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedMultiChainComparison chain={chain} comparisonData={advancedData?.comparisonData} isLoading={advancedLoading} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedInstitutionalView chain={chain} institutionalData={advancedData?.institutionalData} isLoading={advancedLoading} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedSocialSentimentGalaxy chain={chain} socialSentiment={forecastData?.socialSentiment} isLoading={forecastLoading} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-64">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedTokenDiscoveryEngine chain={chain} />
                </Suspense>
              </LazySection>

              <LazySection fallbackHeight="h-48">
                <Suspense fallback={<ComponentLoader />}>
                  <EnhancedDailySummary chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
                </Suspense>
              </LazySection>

              {/* FAQ Section for SEO */}
              <LazySection fallbackHeight="h-48">
                <ChainFAQDisplay chain={chain} priceData={chainPrice} />
              </LazySection>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}