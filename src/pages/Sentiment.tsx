import { Layout } from "@/components/layout/Layout";
import { Brain, TrendingUp, TrendingDown, Activity, Loader2, Zap, MessageCircle, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useSentimentData } from "@/hooks/useSentimentData";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SocialSentimentPanel } from "@/components/sentiment/SocialSentimentPanel";
import { NewsPanel } from "@/components/sentiment/NewsPanel";
import { GoogleTrendsPanel } from "@/components/sentiment/GoogleTrendsPanel";
import { GitHubActivityPanel } from "@/components/sentiment/GitHubActivityPanel";
import { SentimentSchema, SentimentSEOContent, SentimentHowItWorks, SentimentDataMeaning } from "@/components/seo/index";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// New enhanced components
import { SentimentContextBar } from "@/components/sentiment/SentimentContextBar";
import { MultiDimensionalSentiment } from "@/components/sentiment/MultiDimensionalSentiment";
import { SectorHeatmap } from "@/components/sentiment/SectorHeatmap";
import { DivergenceScanner } from "@/components/sentiment/DivergenceScanner";
import { LiveAlertsFeed } from "@/components/sentiment/LiveAlertsFeed";
import { TellMeTheStory } from "@/components/sentiment/TellMeTheStory";
import { TokenSentimentSearch } from "@/components/sentiment/TokenSentimentSearch";

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '—';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${(num ?? 0).toLocaleString()}`;
}

const SentimentPage = () => {
  const navigate = useNavigate();
  const { data: marketData, isLoading } = useMarketData();
  const topCoins = useMemo(() => marketData?.topCoins?.slice(0, 20) || [], [marketData]);
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "signals">("overview");
  const [lastUpdate] = useState(new Date());
  
  // Live sentiment data — computed from the standalone market engine.
  const { data: sentimentData, isLoading: sentimentLoading } = useSentimentData();

  const fearGreedIndex = sentimentData?.fearGreed?.[0]?.value || marketData?.fearGreedIndex || 50;
  
  // Calculate metrics — all real: breadth, volatility, turnover from live coins.
  const avgChange = useMemo(() => topCoins.reduce((sum, c) => sum + c.change24h, 0) / (topCoins.length || 1), [topCoins]);
  const breadth = useMemo(
    () => topCoins.length ? (topCoins.filter(c => c.change24h > 0).length / topCoins.length) * 100 : 50,
    [topCoins],
  );
  const volatility = useMemo(() => topCoins.reduce((sum, c) => sum + Math.abs(c.change24h), 0) / (topCoins.length || 1), [topCoins]);
  const volatilityIndex = Math.min(100, Math.max(0, volatility * 10));
  const turnover = useMemo(
    () =>
      topCoins.length
        ? [...topCoins].sort((a, b) => a.volume - b.volume)[Math.floor(topCoins.length / 2)].volume /
          ([...topCoins].sort((a, b) => a.marketCap - b.marketCap)[Math.floor(topCoins.length / 2)].marketCap || 1) * 100
        : 0,
    [topCoins],
  );
  // Kept for the context bar — volume regime from real total volume.
  const totalVolume = useMemo(() => topCoins.reduce((sum, c) => sum + c.volume, 0), [topCoins]);
  const volumeRegime: 'normal' | 'elevated' = totalVolume > 100e9 ? 'elevated' : 'normal';

  // Market momentum
  const bullishCount = topCoins.filter(c => c.change24h > 2).length;
  const bearishCount = topCoins.filter(c => c.change24h < -2).length;
  const marketMomentum = bullishCount > bearishCount ? "BULLISH" : bearishCount > bullishCount ? "BEARISH" : "NEUTRAL";

  // Context bar values — all derived from real market data. The top sector
  // comes from the live categories ranking (no hardcoded "AI & Big Data").
  const topSector = sentimentData?.trendingCategories?.[0];
  const trend = avgChange > 1 ? 'improving' : avgChange < -1 ? 'declining' : 'stable';
  const vsPrice = avgChange < -2 && socialSentiment > 55 ? 'bullish_divergence' 
    : avgChange > 2 && socialSentiment < 45 ? 'bearish_divergence' 
    : Math.abs(avgChange) < 1 ? 'neutral' : 'aligned';

  const handleCoinClick = (coin: typeof topCoins[0]) => {
    navigate(`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`);
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
              Crypto Fear &amp; Greed Index
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              Updated: {sentimentData?.lastUpdated ? new Date(sentimentData.lastUpdated).toLocaleTimeString() : lastUpdate.toLocaleTimeString()} • Live multi-source analysis
            </p>
          </div>
          <div className={cn(
            "px-4 py-2 font-display font-bold text-sm flex items-center gap-2",
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
                volatilityIndex,
                marketMomentum,
              }}
            />
          )}
        </div>

        {/* Global Market Stats from real data — inline strip */}
        {sentimentData?.global && (
          <div className="grid grid-cols-2 md:flex md:items-stretch md:divide-x md:divide-border/30 border-y border-border/30 py-4 mb-6 gap-y-4">
            <div className="md:px-6 md:first:pl-0">
              <div className="section-label mb-1">Total Market Cap</div>
              <div className="font-bold text-lg">{formatNumber(sentimentData.global.totalMarketCap)}</div>
              <div className={cn("text-xs font-medium", (sentimentData.global.marketCapChange24h ?? 0) >= 0 ? "text-success" : "text-danger")}>
                {(sentimentData.global.marketCapChange24h ?? 0) >= 0 ? "+" : ""}{(sentimentData.global.marketCapChange24h ?? 0).toFixed(2)}%
              </div>
            </div>
            <div className="md:px-6">
              <div className="section-label mb-1">24h Volume</div>
              <div className="font-bold text-lg">{formatNumber(sentimentData.global.totalVolume)}</div>
            </div>
            <div className="md:px-6">
              <div className="section-label mb-1">BTC Dominance</div>
              <div className="font-bold text-lg">{(sentimentData.global.btcDominance ?? 0).toFixed(1)}%</div>
            </div>
            <div className="md:px-6">
              <div className="section-label mb-1">Active Cryptos</div>
              <div className="font-bold text-lg">{(sentimentData.global.activeCryptos ?? 0).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Sentiment Context Bar */}
        <SentimentContextBar
          trend={trend}
          vsPrice={vsPrice}
          topSector={topSector?.name ?? "Majors"}
          sectorChange={topSector?.marketCapChange24h ?? 0}
          volumeRegime={volumeRegime}
        />

        {/* Token Sentiment Search */}
        <TokenSentimentSearch />

        {/* Navigation Tabs — editorial underline */}
        <div className="flex gap-6 mb-6 overflow-x-auto border-b border-border/30">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "social", label: "Social", icon: MessageCircle },
            { id: "signals", label: "Live Signals", icon: Zap },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap pb-2.5 -mb-px border-b-2 text-sm font-medium transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
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
            <MultiDimensionalSentiment
              fearGreedIndex={fearGreedIndex}
              breadth={breadth}
              volatilityIndex={volatilityIndex}
              turnover={turnover}
            />


            <SectorHeatmap coins={topCoins} />
            <DivergenceScanner coins={topCoins} />
          </div>
        )}

        {/* Social Tab */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <SocialSentimentPanel 
                tokens={sentimentData?.topCoins || []} 
                globalData={sentimentData?.global}
                isLoading={sentimentLoading}
              />
              <NewsPanel 
                news={sentimentData?.news || []} 
                isLoading={sentimentLoading} 
              />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <GoogleTrendsPanel 
                trending={sentimentData?.trending || []}
                trendingCategories={sentimentData?.trendingCategories || []}
                fearGreed={sentimentData?.fearGreed || []}
                isLoading={sentimentLoading}
              />
              <GitHubActivityPanel 
                topCoins={sentimentData?.topCoins || []}
                isLoading={sentimentLoading}
              />
            </div>
            <SentimentDataMeaning />
          </div>
        )}

        {/* Live Signals Tab */}
        {activeTab === "signals" && (
          <LiveAlertsFeed coins={topCoins} />
        )}

        {/* SEO Content — always rendered outside tabs for crawlers */}
        <SentimentSEOContent />
        <SentimentHowItWorks />
        <SentimentDataMeaning />

        {/* Sentiment FAQ Section */}
        <section className="border-t border-border/30 pt-8 mt-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Sentiment FAQ</h2>
          <div className="space-y-3 max-w-3xl">
            <details className="group border border-border/30 rounded-lg">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                What is the Crypto Fear &amp; Greed Index?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                The Crypto Fear &amp; Greed Index is a market sentiment indicator that scores overall investor emotion on a scale from 0 (Extreme Fear) to 100 (Extreme Greed). It aggregates data from multiple sources including price volatility, trading volume, social media mentions, Bitcoin dominance, and Google Trends search data. Oracle Bull displays this index alongside AI analysis to give you a comprehensive view of the market mood. Pair it with our{" "}
                <Link to="/predictions" className="text-primary hover:underline">AI price predictions</Link> for a fuller picture.
              </div>
            </details>

            <details className="group border border-border/30 rounded-lg">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                How is market sentiment measured?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                Oracle Bull measures sentiment from real, verifiable market data: the Fear & Greed Index (live from alternative.me), breadth of the top coins' 24h moves, realized volatility, volume turnover, and per-token position inside its 24h range. These signals are combined into our multi-dimensional sentiment dashboard — every number is either fetched market data or a genuine function of it. Visit our{" "}
                <Link to="/crypto-strength-meter" className="text-primary hover:underline">Crypto Strength Meter</Link> to see how individual tokens compare on technical strength.
              </div>
            </details>

            <details className="group border border-border/30 rounded-lg">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                What does "Extreme Fear" mean for crypto?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                An "Extreme Fear" reading (0-20) on the Fear &amp; Greed Index indicates that investors are deeply worried and selling pressure is high. Historically, extreme fear periods have preceded significant price recoveries, making them potential accumulation opportunities for long-term investors. However, fear can persist or deepen during bear markets, so always cross-reference with our{" "}
                <Link to="/dashboard" className="text-primary hover:underline">Market Dashboard</Link> and{" "}
                <Link to="/explorer" className="text-primary hover:underline">Token Explorer</Link> before making decisions.
              </div>
            </details>

            <details className="group border border-border/30 rounded-lg">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                Should I buy when the index shows fear?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                The famous investing adage "be greedy when others are fearful" has historically held some truth in crypto markets. Periods of extreme fear have often been followed by recoveries. However, the Fear &amp; Greed Index is one of many tools and should not be used as a sole buy/sell signal. Combine it with our{" "}
                <Link to="/predictions" className="text-primary hover:underline">AI predictions</Link>, whale tracker data, and technical analysis. Oracle Bull does not provide financial advice — always do your own research.
              </div>
            </details>

            <details className="group border border-border/30 rounded-lg">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-sm flex items-center justify-between hover:text-primary transition-colors">
                How often is sentiment data updated?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                Sentiment metrics are recomputed from live market data on each visit. The Fear &amp; Greed Index updates once daily at its source; price, volume and momentum metrics refresh roughly every 1–2 minutes from CoinGecko. The timestamp at the top of the page shows when the most recent data was fetched.
              </div>
            </details>
          </div>
        </section>
      </div>

    </Layout>
  );
};

export default SentimentPage;
