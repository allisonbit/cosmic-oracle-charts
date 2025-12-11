import { Layout } from "@/components/layout/Layout";
import { Brain, TrendingUp, TrendingDown, Activity, Users, Waves, Loader2, Flame, BarChart3, Zap, MessageCircle, Globe, Target, AlertTriangle, Rocket, Clock, Hash, Twitter, Info, ChevronRight, Newspaper, Github, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useAIForecast } from "@/hooks/useAIForecast";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CoinDetailModal, CoinData } from "@/components/sentiment/CoinDetailModal";
import { WhaleAlertModal, WhaleAlert } from "@/components/sentiment/WhaleAlertModal";
import { TopicDetailModal, TrendingTopic } from "@/components/sentiment/TopicDetailModal";
import { SocialSentimentPanel } from "@/components/sentiment/SocialSentimentPanel";
import { NewsPanel } from "@/components/sentiment/NewsPanel";
import { GoogleTrendsPanel } from "@/components/sentiment/GoogleTrendsPanel";
import { GitHubActivityPanel } from "@/components/sentiment/GitHubActivityPanel";

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

  // Top gainers and losers
  const topGainers = useMemo(() => [...topCoins].sort((a, b) => b.change24h - a.change24h).slice(0, 5), [topCoins]);
  const topLosers = useMemo(() => [...topCoins].sort((a, b) => a.change24h - b.change24h).slice(0, 5), [topCoins]);

  // Trending topics
  const trendingTopics: TrendingTopic[] = useMemo(() => [
    { tag: "#Bitcoin", mentions: 125000, sentiment: "bullish", change: 15, twitterMentions: 75000, redditPosts: 31000, telegramMessages: 19000 },
    { tag: "#Ethereum", mentions: 89000, sentiment: "bullish", change: 8, twitterMentions: 53000, redditPosts: 22000, telegramMessages: 14000 },
    { tag: "#Altseason", mentions: 45000, sentiment: "bullish", change: 32, twitterMentions: 27000, redditPosts: 11000, telegramMessages: 7000 },
    { tag: "#DeFi", mentions: 34000, sentiment: "neutral", change: -2, twitterMentions: 20000, redditPosts: 9000, telegramMessages: 5000 },
    { tag: "#NFT", mentions: 28000, sentiment: "bearish", change: -12, twitterMentions: 17000, redditPosts: 7000, telegramMessages: 4000 },
    { tag: "#Solana", mentions: 67000, sentiment: "bullish", change: 25, twitterMentions: 40000, redditPosts: 17000, telegramMessages: 10000 },
  ], []);

  // Whale alerts
  const whaleAlerts: WhaleAlert[] = useMemo(() => {
    return topCoins
      .filter(c => c.volume > 1e9)
      .slice(0, 6)
      .map(c => ({
        symbol: c.symbol,
        type: c.change24h > 0 ? "accumulation" : "distribution" as const,
        amount: `${(c.volume / 1e9).toFixed(1)}B`,
        time: `${Math.floor(Math.random() * 60)} min ago`,
        volume: c.volume,
        price: c.price,
        change24h: c.change24h,
      }));
  }, [topCoins]);

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

  const getSentimentColor = (value: number) => {
    if (value >= 70) return "text-success";
    if (value >= 40) return "text-warning";
    return "text-danger";
  };

  const getSentimentLabel = (value: number) => {
    if (value >= 80) return "Extreme Greed";
    if (value >= 60) return "Greed";
    if (value >= 40) return "Neutral";
    if (value >= 20) return "Fear";
    return "Extreme Fear";
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
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              <span className="glow-text">SENTIMENT</span> <span className="text-gradient-cosmic">SCANNER</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              Updated: {lastUpdate.toLocaleTimeString()} • Real-time analysis
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
        </div>

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
          <>
            {/* Main Sentiment Gauges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              {/* Fear & Greed */}
              <div className="holo-card p-4 md:p-6 text-center">
                <Brain className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
                <h3 className="font-display text-[10px] md:text-xs text-muted-foreground mb-1">FEAR & GREED</h3>
                <div className={cn("text-3xl md:text-4xl font-display font-bold", getSentimentColor(fearGreedIndex))}>
                  {fearGreedIndex}
                </div>
                <div className={cn("font-display text-xs", getSentimentColor(fearGreedIndex))}>
                  {getSentimentLabel(fearGreedIndex)}
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                    style={{ width: `${fearGreedIndex}%` }}
                  />
                </div>
              </div>

              {/* Social Sentiment */}
              <div className="holo-card p-4 md:p-6 text-center">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-display text-[10px] md:text-xs text-muted-foreground mb-1">SOCIAL SCORE</h3>
                <div className={cn("text-3xl md:text-4xl font-display font-bold", getSentimentColor(socialSentiment))}>
                  {Math.round(socialSentiment)}
                </div>
                <div className="text-foreground font-display text-xs">
                  {socialSentiment >= 60 ? "Positive" : socialSentiment >= 40 ? "Neutral" : "Negative"}
                </div>
                <div className="mt-3 flex justify-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 rounded-full transition-all",
                        i < Math.floor(socialSentiment / 10) ? "bg-success" : "bg-muted"
                      )}
                      style={{ height: `${8 + Math.random() * 16}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Volatility */}
              <div className="holo-card p-4 md:p-6 text-center">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-warning mx-auto mb-2" />
                <h3 className="font-display text-[10px] md:text-xs text-muted-foreground mb-1">VOLATILITY</h3>
                <div className={cn("text-3xl md:text-4xl font-display font-bold", volatilityIndex >= 60 ? "text-danger" : volatilityIndex >= 30 ? "text-warning" : "text-success")}>
                  {Math.round(volatilityIndex)}
                </div>
                <div className="text-warning font-display text-xs">
                  {volatilityIndex >= 60 ? "Extreme" : volatilityIndex >= 30 ? "Moderate" : "Low"}
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning/60 transition-all" style={{ width: `${volatilityIndex}%` }} />
                </div>
              </div>

              {/* Whale Activity */}
              <button 
                onClick={() => setActiveTab("whales")}
                className="holo-card p-4 md:p-6 text-center hover:border-primary/50 transition-all group cursor-pointer"
              >
                <Waves className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
                <h3 className="font-display text-[10px] md:text-xs text-muted-foreground mb-1">WHALE ACTIVITY</h3>
                <div className={cn("text-3xl md:text-4xl font-display font-bold", getSentimentColor(whaleActivity))}>
                  {Math.round(whaleActivity)}
                </div>
                <div className="text-success font-display text-xs">
                  {whaleActivity >= 70 ? "Very High" : whaleActivity >= 40 ? "Active" : "Quiet"}
                </div>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            </div>

            {/* Market Momentum Bar */}
            <div className="holo-card p-4 md:p-6 mb-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                MARKET MOMENTUM
              </h3>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="text-success font-bold">{bullishCount} Bullish</span>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full font-display font-bold text-sm",
                  marketMomentum === "BULLISH" ? "bg-success/20 text-success" : 
                  marketMomentum === "BEARISH" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                )}>
                  {marketMomentum}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-danger font-bold">{bearishCount} Bearish</span>
                  <TrendingDown className="w-5 h-5 text-danger" />
                </div>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex bg-muted">
                <div className="bg-success transition-all" style={{ width: `${(bullishCount / topCoins.length) * 100}%` }} />
                <div className="bg-warning transition-all" style={{ width: `${((topCoins.length - bullishCount - bearishCount) / topCoins.length) * 100}%` }} />
                <div className="bg-danger transition-all" style={{ width: `${(bearishCount / topCoins.length) * 100}%` }} />
              </div>
            </div>

            {/* Top Gainers & Losers */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-success" />
                  TOP GAINERS (24H)
                </h3>
                <div className="space-y-2">
                  {topGainers.map((coin, i) => (
                    <button
                      key={coin.symbol}
                      onClick={() => handleCoinClick(coin)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20 hover:border-success/40 hover:bg-success/15 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-xs font-bold text-success">{i + 1}</span>
                        <div>
                          <span className="font-display font-bold group-hover:text-success transition-colors">{coin.symbol}</span>
                          <p className="text-xs text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="text-success font-bold">+{coin.change24h.toFixed(2)}%</div>
                          <div className="text-xs text-muted-foreground">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-success transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="holo-card p-4 md:p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger" />
                  TOP LOSERS (24H)
                </h3>
                <div className="space-y-2">
                  {topLosers.map((coin, i) => (
                    <button
                      key={coin.symbol}
                      onClick={() => handleCoinClick(coin)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-danger/10 border border-danger/20 hover:border-danger/40 hover:bg-danger/15 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-danger/20 flex items-center justify-center text-xs font-bold text-danger">{i + 1}</span>
                        <div>
                          <span className="font-display font-bold group-hover:text-danger transition-colors">{coin.symbol}</span>
                          <p className="text-xs text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="text-danger font-bold">{coin.change24h.toFixed(2)}%</div>
                          <div className="text-xs text-muted-foreground">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-danger transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="holo-card p-4 md:p-6">
              <h2 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI MARKET ANALYSIS
                {aiLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </h2>
              {aiData?.forecast ? (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">SENTIMENT</div>
                    <div className={cn(
                      "text-xl font-display font-bold",
                      aiData.forecast.overallSentiment === "bullish" ? "text-success" : aiData.forecast.overallSentiment === "bearish" ? "text-danger" : "text-warning"
                    )}>
                      {aiData.forecast.overallSentiment?.toUpperCase() || "NEUTRAL"}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">CONFIDENCE</div>
                    <div className="text-xl font-display font-bold text-primary">{aiData.forecast.confidence || 65}%</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">RISK LEVEL</div>
                    <div className={cn(
                      "text-xl font-display font-bold",
                      aiData.forecast.riskLevel === "low" ? "text-success" : aiData.forecast.riskLevel === "high" ? "text-danger" : "text-warning"
                    )}>
                      {aiData.forecast.riskLevel?.toUpperCase() || "MEDIUM"}
                    </div>
                  </div>
                  <div className="col-span-full md:col-span-1 p-4 rounded-lg bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">OUTLOOK</div>
                    <p className="text-sm">{aiData.forecast.shortTermOutlook || "Market conditions stable"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </>
        )}

        {/* Social Tab */}
        {activeTab === "social" && (
          <div className="space-y-6">
            {/* Social Sentiment Panel - Real-time data */}
            <SocialSentimentPanel 
              tokens={topCoins.map(c => ({
                symbol: c.symbol,
                name: c.name,
                price: c.price,
                change24h: c.change24h,
                volume: c.volume,
                marketCap: c.marketCap,
              }))}
              onTokenClick={(symbol) => {
                const coin = topCoins.find(c => c.symbol === symbol);
                if (coin) handleCoinClick(coin);
              }}
            />

            {/* Two Column Layout for News and Trends */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* News Panel */}
              <NewsPanel />

              {/* Google Trends */}
              <GoogleTrendsPanel />
            </div>

            {/* GitHub Developer Activity */}
            <GitHubActivityPanel />

            {/* Legacy Trending Topics */}
            <div className="holo-card p-6">
              <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                <Twitter className="w-5 h-5 text-primary" />
                TRENDING HASHTAGS
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics.map((topic, i) => (
                  <button 
                    key={topic.tag}
                    onClick={() => handleTopicClick(topic)}
                    className={cn(
                      "p-4 rounded-lg border animate-fade-in text-left transition-all group",
                      topic.sentiment === "bullish" ? "bg-success/10 border-success/30 hover:border-success/50" :
                      topic.sentiment === "bearish" ? "bg-danger/10 border-danger/30 hover:border-danger/50" : "bg-muted/50 border-border hover:border-primary/50"
                    )}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-bold text-primary group-hover:text-foreground transition-colors">{topic.tag}</span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded",
                        topic.sentiment === "bullish" ? "bg-success/20 text-success" :
                        topic.sentiment === "bearish" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                      )}>
                        {topic.sentiment.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{(topic.mentions / 1000).toFixed(0)}K mentions</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          topic.change >= 0 ? "text-success" : "text-danger"
                        )}>
                          {topic.change >= 0 ? "+" : ""}{topic.change}%
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Whales Tab */}
        {activeTab === "whales" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="holo-card p-6 text-center">
                <Waves className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-display font-bold">{whaleAlerts.length}</div>
                <div className="text-xs text-muted-foreground">Active Whale Movements</div>
              </div>
              <div className="holo-card p-6 text-center">
                <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="text-3xl font-display font-bold text-success">
                  {whaleAlerts.filter(w => w.type === "accumulation").length}
                </div>
                <div className="text-xs text-muted-foreground">Accumulation Events</div>
              </div>
              <div className="holo-card p-6 text-center">
                <TrendingDown className="w-8 h-8 text-danger mx-auto mb-2" />
                <div className="text-3xl font-display font-bold text-danger">
                  {whaleAlerts.filter(w => w.type === "distribution").length}
                </div>
                <div className="text-xs text-muted-foreground">Distribution Events</div>
              </div>
            </div>

            <div className="holo-card p-6">
              <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                <Waves className="w-5 h-5 text-primary" />
                LIVE WHALE ALERTS
              </h2>
              <div className="space-y-3">
                {whaleAlerts.map((alert, i) => (
                  <button 
                    key={`${alert.symbol}-${i}`}
                    onClick={() => handleWhaleClick(alert)}
                    className={cn(
                      "w-full p-4 rounded-lg border flex items-center justify-between animate-fade-in text-left transition-all group",
                      alert.type === "accumulation" ? "bg-success/10 border-success/30 hover:border-success/50" : "bg-danger/10 border-danger/30 hover:border-danger/50"
                    )}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        alert.type === "accumulation" ? "bg-success/20" : "bg-danger/20"
                      )}>
                        {alert.type === "accumulation" ? 
                          <TrendingUp className="w-6 h-6 text-success" /> : 
                          <TrendingDown className="w-6 h-6 text-danger" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-lg">{alert.symbol}</span>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded font-bold",
                            alert.type === "accumulation" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                          )}>
                            {alert.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Large {alert.type === "accumulation" ? "buy" : "sell"} detected
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-bold">${alert.amount}</div>
                        <div className="text-xs text-muted-foreground">{alert.time}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Signals Tab */}
        {activeTab === "signals" && (
          <div className="holo-card p-6">
            <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              LIVE MARKET SIGNALS
            </h2>
            <div className="space-y-3">
              {topCoins.slice(0, 12).map((coin, i) => {
                const type = coin.change24h >= 5 ? "pump" : coin.change24h >= 2 ? "bullish" : coin.change24h <= -5 ? "dump" : coin.change24h <= -2 ? "bearish" : "neutral";
                const message = type === "pump" 
                  ? `Major pump detected with +${coin.change24h.toFixed(2)}% surge`
                  : type === "bullish"
                  ? `Showing bullish momentum with +${coin.change24h.toFixed(2)}% gain`
                  : type === "dump"
                  ? `Sharp decline with ${coin.change24h.toFixed(2)}% drop`
                  : type === "bearish"
                  ? `Under selling pressure with ${coin.change24h.toFixed(2)}% decline`
                  : `Trading sideways at $${coin.price.toLocaleString()}`;
                
                return (
                  <button
                    key={coin.symbol}
                    onClick={() => handleCoinClick(coin, type, message)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-lg border transition-all animate-fade-in text-left group",
                      type === "pump" || type === "bullish" ? "border-success/30 bg-success/5 hover:border-success/50" : 
                      type === "dump" || type === "bearish" ? "border-danger/30 bg-danger/5 hover:border-danger/50" : "border-border hover:border-primary/50"
                    )}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      type === "pump" ? "bg-success/20" : type === "bullish" ? "bg-success/10" :
                      type === "dump" ? "bg-danger/20" : type === "bearish" ? "bg-danger/10" : "bg-warning/10"
                    )}>
                      {type === "pump" || type === "bullish" ? <TrendingUp className="w-5 h-5 text-success" /> :
                       type === "dump" || type === "bearish" ? <TrendingDown className="w-5 h-5 text-danger" /> :
                       <Activity className="w-5 h-5 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-primary group-hover:text-foreground transition-colors">{coin.symbol}</span>
                        <span className="text-xs text-muted-foreground">{coin.name}</span>
                        {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 text-warning" />}
                      </div>
                      <p className="text-sm text-foreground">{message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Vol: {formatNumber(coin.volume)}</span>
                        <span>MCap: {formatNumber(coin.marketCap)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "text-right flex-shrink-0",
                        coin.change24h >= 0 ? "text-success" : "text-danger"
                      )}>
                        <div className="font-bold text-lg">{coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CoinDetailModal
        open={coinModalOpen}
        onOpenChange={setCoinModalOpen}
        coin={selectedCoin}
      />
      <WhaleAlertModal
        open={whaleModalOpen}
        onOpenChange={setWhaleModalOpen}
        alert={selectedWhale}
      />
      <TopicDetailModal
        open={topicModalOpen}
        onOpenChange={setTopicModalOpen}
        topic={selectedTopic}
      />
    </Layout>
  );
};

export default SentimentPage;