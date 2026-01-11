import { Layout } from "@/components/layout/Layout";
import { Brain, TrendingUp, TrendingDown, Activity, Waves, Loader2, Zap, MessageCircle, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useWhaleTracker } from "@/hooks/useWhaleTracker";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CoinDetailModal, CoinData } from "@/components/sentiment/CoinDetailModal";
import { WhaleAlertModal, WhaleAlert } from "@/components/sentiment/WhaleAlertModal";
import { TopicDetailModal, TrendingTopic } from "@/components/sentiment/TopicDetailModal";
import { SocialSentimentPanel } from "@/components/sentiment/SocialSentimentPanel";
import { NewsPanel } from "@/components/sentiment/NewsPanel";
import { GoogleTrendsPanel } from "@/components/sentiment/GoogleTrendsPanel";
import { GitHubActivityPanel } from "@/components/sentiment/GitHubActivityPanel";
import { SentimentSchema, SentimentSEOContent, SentimentHowItWorks, SentimentDataMeaning } from "@/components/seo";
import { InArticleAd, SidebarAd } from "@/components/ads";

// New enhanced components
import { SentimentContextBar } from "@/components/sentiment/SentimentContextBar";
import { MultiDimensionalSentiment } from "@/components/sentiment/MultiDimensionalSentiment";
import { SectorHeatmap } from "@/components/sentiment/SectorHeatmap";
import { DivergenceScanner } from "@/components/sentiment/DivergenceScanner";
import { AdvancedWhaleTracker } from "@/components/sentiment/AdvancedWhaleTracker";
import { LiveAlertsFeed } from "@/components/sentiment/LiveAlertsFeed";
import { TellMeTheStory } from "@/components/sentiment/TellMeTheStory";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

const SentimentPage = () => {
  const { data: marketData, isLoading } = useMarketData();
  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 20) || [], [marketData]);
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "whales" | "signals">("overview");
  const [lastUpdate] = useState(new Date());
  
  // Whale tracker data
  const { data: whaleData, refetch: refetchWhales } = useWhaleTracker('ethereum');
  
  // Modal states
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [selectedWhale, setSelectedWhale] = useState<WhaleAlert | null>(null);
  const [whaleModalOpen, setWhaleModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  
  const { data: aiData, isLoading: aiLoading } = useAIForecast(
    topCoins.length > 0 ? topCoins : null,
    "market_sentiment",
    topCoins.length > 0
  );

  const fearGreedIndex = marketData?.fearGreedIndex || 50;
  
  // Calculate metrics
  const avgChange = useMemo(() => topCoins.reduce((sum, c) => sum + c.change24h, 0) / (topCoins.length || 1), [topCoins]);
  const socialSentiment = Math.min(100, Math.max(0, 50 + avgChange * 5));
  const volatility = useMemo(() => topCoins.reduce((sum, c) => sum + Math.abs(c.change24h), 0) / (topCoins.length || 1), [topCoins]);
  const volatilityIndex = Math.min(100, Math.max(0, volatility * 10));
  const totalVolume = useMemo(() => topCoins.reduce((sum, c) => sum + c.volume, 0), [topCoins]);
  const whaleActivity = Math.min(100, Math.max(0, 50 + (totalVolume > 100e9 ? 30 : totalVolume > 50e9 ? 15 : 0)));

  // Market momentum
  const bullishCount = topCoins.filter(c => c.change24h > 2).length;
  const bearishCount = topCoins.filter(c => c.change24h < -2).length;
  const marketMomentum = bullishCount > bearishCount ? "BULLISH" : bearishCount > bullishCount ? "BEARISH" : "NEUTRAL";

  // Calculate context bar values
  const netflow = whaleData?.netflow || 0;
  const trend = avgChange > 1 ? 'improving' : avgChange < -1 ? 'declining' : 'stable';
  const whaleMood = netflow > 0 ? 'accumulating' : netflow < 0 ? 'distributing' : 'neutral';
  const vsPrice = avgChange < -2 && socialSentiment > 55 ? 'bullish_divergence' 
    : avgChange > 2 && socialSentiment < 45 ? 'bearish_divergence' 
    : Math.abs(avgChange) < 1 ? 'neutral' : 'aligned';

  const handleCoinClick = (coin: typeof topCoins[0], signalType?: string, signalMessage?: string) => {
    setSelectedCoin({
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
      change24h: coin.change24h,
      volume: coin.volume,
      marketCap: coin.marketCap,
      rank: coin.rank,
      sentiment: coin.change24h > 2 ? "bullish" : coin.change24h < -2 ? "bearish" : "neutral",
      signalType,
      signalMessage,
    });
    setCoinModalOpen(true);
  };

  const handleWhaleClick = (alert: WhaleAlert) => {
    setSelectedWhale(alert);
    setWhaleModalOpen(true);
  };

  const handleTopicClick = (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    setTopicModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-12 flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-display text-sm md:text-base">Scanning market sentiment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SentimentSchema fearGreedIndex={fearGreedIndex} marketMomentum={marketMomentum} />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              <span className="glow-text">SENTIMENT</span> <span className="text-gradient-cosmic">INTELLIGENCE</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              Updated: {lastUpdate.toLocaleTimeString()} • Multi-source real-time analysis
            </p>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-full font-display font-bold text-sm flex items-center gap-2",
            marketMomentum === "BULLISH" ? "bg-success/20 text-success" : 
            marketMomentum === "BEARISH" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
          )}>
            {marketMomentum === "BULLISH" ? <TrendingUp className="w-4 h-4" /> : 
             marketMomentum === "BEARISH" ? <TrendingDown className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
            MARKET: {marketMomentum}
          </div>
          {/* Tell Me the Story for top coin */}
          {topCoins[0] && (
            <TellMeTheStory
              token={topCoins[0]}
              sentimentData={{
                fearGreedIndex,
                socialSentiment,
                volatilityIndex,
                whaleActivity,
                marketMomentum,
                whaleMood,
                netflow,
              }}
            />
          )}
        </div>

        {/* Sentiment Context Bar */}
        <SentimentContextBar
          trend={trend}
          vsPrice={vsPrice}
          topSector="AI & Big Data"
          sectorChange={12}
          whaleMood={whaleMood}
          netflow={netflow}
        />

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "social", label: "Social", icon: MessageCircle },
            { id: "whales", label: "Whale Tracker", icon: Waves },
            { id: "signals", label: "Live Signals", icon: Zap },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="gap-2 whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Click hint */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Info className="w-3.5 h-3.5" />
          <span>Click on any item for detailed insights and analysis</span>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <SentimentSEOContent />
            
            {/* Multi-Dimensional Sentiment Engine */}
            <MultiDimensionalSentiment
              fearGreedIndex={fearGreedIndex}
              socialSentiment={socialSentiment}
              volatilityIndex={volatilityIndex}
              whaleActivity={whaleActivity}
            />

            <InArticleAd />

            {/* Sector Heatmap */}
            <SectorHeatmap coins={topCoins} />

            {/* Divergence Scanner */}
            <DivergenceScanner coins={topCoins} />

            <SentimentHowItWorks />
          </div>
        )}

        {/* Social Tab */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <SocialSentimentPanel tokens={topCoins.slice(0, 10)} />
              <NewsPanel />
            </div>
            <InArticleAd />
            <div className="grid lg:grid-cols-2 gap-6">
              <GoogleTrendsPanel />
              <GitHubActivityPanel />
            </div>
            <SentimentDataMeaning />
          </div>
        )}

        {/* Whales Tab */}
        {activeTab === "whales" && (
          <AdvancedWhaleTracker onRefresh={() => refetchWhales()} />
        )}

        {/* Live Signals Tab */}
        {activeTab === "signals" && (
          <LiveAlertsFeed whaleData={whaleData} coins={topCoins} />
        )}
      </div>

      {/* Modals */}
      <CoinDetailModal
        coin={selectedCoin}
        open={coinModalOpen}
        onOpenChange={setCoinModalOpen}
      />
      <WhaleAlertModal
        alert={selectedWhale}
        open={whaleModalOpen}
        onOpenChange={setWhaleModalOpen}
      />
      <TopicDetailModal
        topic={selectedTopic}
        open={topicModalOpen}
        onOpenChange={setTopicModalOpen}
      />
    </Layout>
  );
};

export default SentimentPage;
