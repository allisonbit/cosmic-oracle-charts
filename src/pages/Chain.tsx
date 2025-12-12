import { useParams, useNavigate } from "react-router-dom";
import { getChainById } from "@/lib/chainConfig";
import { useChainData } from "@/hooks/useChainData";
import { useChainForecast } from "@/hooks/useChainForecast";
import { useAdvancedChainData } from "@/hooks/useAdvancedChainData";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { ChainOverviewPanel } from "@/components/chain/ChainOverviewPanel";
import { AdvancedPriceChart } from "@/components/chain/AdvancedPriceChart";
import { PredictionDeepDive } from "@/components/chain/PredictionDeepDive";
import { WhaleActivityRadar } from "@/components/chain/WhaleActivityRadar";
import { TokenHeatScanner } from "@/components/chain/TokenHeatScanner";
import { SmartMoneyFlow } from "@/components/chain/SmartMoneyFlow";
import { RiskAnalyzer } from "@/components/chain/RiskAnalyzer";
import { SocialSentimentGalaxy } from "@/components/chain/SocialSentimentGalaxy";
import { TokenDiscoveryEngine } from "@/components/chain/TokenDiscoveryEngine";
import { DailySummary } from "@/components/chain/DailySummary";
import { ChainSidebar } from "@/components/chain/ChainSidebar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { Footer } from "@/components/layout/Footer";
import { ChainHealthMetrics } from "@/components/chain/ChainHealthMetrics";
import { DeepFinancialMetrics } from "@/components/chain/DeepFinancialMetrics";
import { AdvancedPredictionModels } from "@/components/chain/AdvancedPredictionModels";
import { AnomalyDetection } from "@/components/chain/AnomalyDetection";
import { MultiChainComparison } from "@/components/chain/MultiChainComparison";
import { InstitutionalView } from "@/components/chain/InstitutionalView";
import { ChainQuickNav } from "@/components/chain/ChainQuickNav";
import { ChainExternalLinks } from "@/components/chain/ChainExternalLinks";
import { ChainInfoCard } from "@/components/chain/ChainInfoCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function Chain() {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chain = chainId ? getChainById(chainId) : undefined;

  const { data: chainData, isLoading: chainLoading, isFetching: chainFetching, refetch: refetchChainData } = useChainData(chainId || "", !!chain);
  const { data: forecastData, isLoading: forecastLoading, refetch: refetchForecast } = useChainForecast(chainId || "", chainData, !!chain && !!chainData);
  const { data: advancedData, isLoading: advancedLoading, refetch: refetchAdvanced } = useAdvancedChainData(chainId || "", !!chain);
  const { data: pricesData } = useCryptoPrices();

  const handleRefreshAll = () => {
    refetchChainData();
    refetchForecast();
    refetchAdvanced();
  };

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

  const chainPrice = pricesData?.prices?.find(p => p.symbol === chain.symbol);
  const showLoading = chainLoading && !chainData;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen cosmic-bg flex w-full">
        <ChainSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CryptoTicker />
          
          {showLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-display text-sm">Loading {chain.name} data...</p>
              </div>
            </div>
          ) : (
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
              <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
                {/* Header with navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm w-fit">
                    <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshAll}
                      disabled={chainFetching}
                      className="text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1.5 ${chainFetching ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
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

                {/* Quick chain navigation */}
                <ChainQuickNav />

                {/* Refreshing indicator */}
                {chainFetching && chainData && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg w-fit">
                    <Loader2 className="w-4 h-4 animate-spin" /><span>Refreshing data...</span>
                  </div>
                )}

                {/* Main Overview */}
                <ChainOverviewPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} />

                {/* External links */}
                <ChainExternalLinks chain={chain} />

                {/* Chain Info Card */}
                <ChainInfoCard chain={chain} />

                {/* Price Chart & Predictions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <AdvancedPriceChart chain={chain} priceData={chainPrice} />
                  <PredictionDeepDive chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
                </div>

                {/* Health & Financial Metrics */}
                <ChainHealthMetrics chain={chain} healthData={advancedData?.healthData} isLoading={advancedLoading} />
                <DeepFinancialMetrics chain={chain} financialData={advancedData?.financialData} isLoading={advancedLoading} />

                {/* AI Prediction Models */}
                <AdvancedPredictionModels chain={chain} predictionData={advancedData?.predictionData} isLoading={advancedLoading} />

                {/* Anomaly Detection */}
                <AnomalyDetection chain={chain} anomalyData={advancedData?.anomalyData} isLoading={advancedLoading} />

                {/* Whale & Token Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <WhaleActivityRadar chain={chain} whaleActivity={chainData?.whaleActivity} isLoading={chainLoading} />
                  <TokenHeatScanner chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} />
                </div>

                {/* Smart Money & Risk */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <SmartMoneyFlow chain={chain} smartMoneyFlow={chainData?.smartMoneyFlow} isLoading={chainLoading} />
                  <RiskAnalyzer chain={chain} />
                </div>

                {/* Multi-chain Comparison */}
                <MultiChainComparison chain={chain} comparisonData={advancedData?.comparisonData} isLoading={advancedLoading} />

                {/* Institutional View */}
                <InstitutionalView chain={chain} institutionalData={advancedData?.institutionalData} isLoading={advancedLoading} />

                {/* Social Sentiment */}
                <SocialSentimentGalaxy chain={chain} socialSentiment={forecastData?.socialSentiment} isLoading={forecastLoading} />

                {/* Token Discovery */}
                <TokenDiscoveryEngine chain={chain} />

                {/* Daily Summary */}
                <DailySummary chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
              </div>
            </main>
          )}
          
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}