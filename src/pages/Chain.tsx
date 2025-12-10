import { useParams } from "react-router-dom";
import { getChainById } from "@/lib/chainConfig";
import { useChainData } from "@/hooks/useChainData";
import { useChainForecast } from "@/hooks/useChainForecast";
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
import { Navbar } from "@/components/layout/Navbar";
import { CryptoTicker } from "@/components/layout/CryptoTicker";
import { Footer } from "@/components/layout/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Chain() {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();
  const chain = chainId ? getChainById(chainId) : undefined;

  const { data: chainData, isLoading: chainLoading, isFetching: chainFetching } = useChainData(chainId || "", !!chain);
  const { data: forecastData, isLoading: forecastLoading } = useChainForecast(chainId || "", chainData, !!chain && !!chainData);
  const { data: pricesData } = useCryptoPrices();

  if (!chain) {
    return (
      <div className="min-h-screen cosmic-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 mt-16">
          <div className="holo-card p-8 text-center">
            <h2 className="text-2xl font-display text-foreground mb-4">Chain Not Found</h2>
            <button onClick={() => navigate("/")} className="text-primary hover:underline">
              Return Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get chain price from the prices array
  const chainPrice = pricesData?.prices?.find(p => p.symbol === chain.symbol);

  // Show loading only if we don't have any data yet
  const showLoading = chainLoading && !chainData;

  return (
    <SidebarProvider>
      <div className="min-h-screen cosmic-bg flex w-full overflow-x-hidden">
        <Navbar />
        <ChainSidebar />
        <div className="flex-1 flex flex-col mt-14 md:mt-16">
          <CryptoTicker />
          
          {showLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-display">Loading {chain.name} data...</p>
              </div>
            </div>
          ) : (
            <main className="flex-1">
              <div className="container mx-auto px-4 py-6 md:py-8 space-y-4 md:space-y-6">
                {/* Back Button */}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>

                {/* Loading indicator when refreshing */}
                {chainFetching && chainData && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Refreshing data...</span>
                  </div>
                )}

                {/* Overview */}
                <ChainOverviewPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} />

                {/* Price Charts & Predictions */}
                <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                  <AdvancedPriceChart chain={chain} priceData={chainPrice} />
                  <PredictionDeepDive chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
                </div>

                {/* Whale & Heat Scanner */}
                <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                  <WhaleActivityRadar chain={chain} whaleActivity={chainData?.whaleActivity} isLoading={chainLoading} />
                  <TokenHeatScanner chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} />
                </div>

                {/* Smart Money & Risk */}
                <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                  <SmartMoneyFlow chain={chain} smartMoneyFlow={chainData?.smartMoneyFlow} isLoading={chainLoading} />
                  <RiskAnalyzer chain={chain} tokenRisks={forecastData?.tokenRisks} isLoading={forecastLoading} />
                </div>

                {/* Social Sentiment */}
                <SocialSentimentGalaxy chain={chain} socialSentiment={forecastData?.socialSentiment} isLoading={forecastLoading} />

                {/* Token Discovery */}
                <TokenDiscoveryEngine chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} />

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