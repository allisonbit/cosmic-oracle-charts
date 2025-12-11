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
import { SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Chain() {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();
  const chain = chainId ? getChainById(chainId) : undefined;

  const { data: chainData, isLoading: chainLoading, isFetching: chainFetching } = useChainData(chainId || "", !!chain);
  const { data: forecastData, isLoading: forecastLoading } = useChainForecast(chainId || "", chainData, !!chain && !!chainData);
  const { data: advancedData, isLoading: advancedLoading } = useAdvancedChainData(chainId || "", !!chain);
  const { data: pricesData } = useCryptoPrices();

  if (!chain) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
        <div className="holo-card p-8 text-center">
          <h2 className="text-2xl font-display text-foreground mb-4">Chain Not Found</h2>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">Return Home</button>
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
              <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-3 sm:space-y-4 md:space-y-6">
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                  <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
                </button>

                {chainFetching && chainData && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /><span>Refreshing data...</span>
                  </div>
                )}

                <ChainOverviewPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <AdvancedPriceChart chain={chain} priceData={chainPrice} />
                  <PredictionDeepDive chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
                </div>

                <ChainHealthMetrics chain={chain} healthData={advancedData?.healthData} isLoading={advancedLoading} />
                <DeepFinancialMetrics chain={chain} financialData={advancedData?.financialData} isLoading={advancedLoading} />
                <AdvancedPredictionModels chain={chain} predictionData={advancedData?.predictionData} isLoading={advancedLoading} />
                <AnomalyDetection chain={chain} anomalyData={advancedData?.anomalyData} isLoading={advancedLoading} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <WhaleActivityRadar chain={chain} whaleActivity={chainData?.whaleActivity} isLoading={chainLoading} />
                  <TokenHeatScanner chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <SmartMoneyFlow chain={chain} smartMoneyFlow={chainData?.smartMoneyFlow} isLoading={chainLoading} />
                  <RiskAnalyzer chain={chain} tokenRisks={forecastData?.tokenRisks} isLoading={forecastLoading} />
                </div>

                <MultiChainComparison chain={chain} comparisonData={advancedData?.comparisonData} isLoading={advancedLoading} />
                <InstitutionalView chain={chain} institutionalData={advancedData?.institutionalData} isLoading={advancedLoading} />

                <SocialSentimentGalaxy chain={chain} socialSentiment={forecastData?.socialSentiment} isLoading={forecastLoading} />
                <TokenDiscoveryEngine chain={chain} />
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