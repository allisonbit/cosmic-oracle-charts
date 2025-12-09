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
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Chain() {
  const { chainId } = useParams<{ chainId: string }>();
  const navigate = useNavigate();
  const chain = chainId ? getChainById(chainId) : undefined;

  const { data: chainData, isLoading: chainLoading } = useChainData(chainId || "", !!chain);
  const { data: forecastData, isLoading: forecastLoading } = useChainForecast(chainId || "", chainData, !!chain && !!chainData);
  const { data: prices } = useCryptoPrices();

  if (!chain) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
        <div className="holo-card p-8 text-center">
          <h2 className="text-2xl font-display text-foreground mb-4">Chain Not Found</h2>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const chainPrice = prices?.find(p => p.symbol === chain.symbol);

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Overview */}
        <ChainOverviewPanel chain={chain} overview={chainData?.overview} isLoading={chainLoading} />

        {/* Price Charts & Predictions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AdvancedPriceChart chain={chain} priceData={chainPrice} />
          <PredictionDeepDive chain={chain} forecast={forecastData?.forecast} isLoading={forecastLoading} />
        </div>

        {/* Whale & Heat Scanner */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WhaleActivityRadar chain={chain} whaleActivity={chainData?.whaleActivity} isLoading={chainLoading} />
          <TokenHeatScanner chain={chain} tokenHeat={chainData?.tokenHeat} isLoading={chainLoading} />
        </div>

        {/* Smart Money & Risk */}
        <div className="grid lg:grid-cols-2 gap-6">
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
    </div>
  );
}
