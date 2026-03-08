import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { SocialSentiment } from "@/hooks/useChainForecast";
import { Twitter, MessageCircle, Send, Newspaper, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Users, Activity, Info, BarChart3, Globe, Zap, Target, Eye, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface EnhancedSocialSentimentGalaxyProps {
  chain: ChainConfig;
  socialSentiment: SocialSentiment | undefined;
  isLoading: boolean;
}

interface SentimentModalData {
  type: 'platform' | 'overview' | 'influencer' | 'trending' | 'methodology';
  title: string;
  data: any;
}

export function EnhancedSocialSentimentGalaxy({ chain, socialSentiment, isLoading }: EnhancedSocialSentimentGalaxyProps) {
  const [platformsExpanded, setPlatformsExpanded] = useState<Record<string, boolean>>({});
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<SentimentModalData | null>(null);

  const platforms = [
    { key: "twitter", label: "Twitter/X", icon: Twitter, data: socialSentiment?.twitter, link: chain.twitter, color: "text-[#1DA1F2]", bgColor: "bg-[#1DA1F2]/10" },
    { key: "reddit", label: "Reddit", icon: MessageCircle, data: socialSentiment?.reddit, link: `https://reddit.com/r/${chain.id}`, color: "text-[#FF4500]", bgColor: "bg-[#FF4500]/10" },
    { key: "telegram", label: "Telegram", icon: Send, data: socialSentiment?.telegram, link: "https://telegram.org", color: "text-[#0088CC]", bgColor: "bg-[#0088CC]/10" },
    { key: "news", label: "News", icon: Newspaper, data: socialSentiment?.news, link: `https://cryptopanic.com/news/${chain.symbol?.toLowerCase()}/`, color: "text-warning", bgColor: "bg-warning/10" },
  ] as const;

  const overallSentimentText = (score: number) => {
    if (score >= 70) return "Bullish";
    if (score >= 55) return "Slightly Bullish";
    if (score >= 45) return "Neutral";
    if (score >= 30) return "Slightly Bearish";
    return "Bearish";
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 55) return <TrendingUp className="h-4 w-4 text-success" />;
    if (score >= 45) return <Activity className="h-4 w-4 text-warning" />;
    return <TrendingDown className="h-4 w-4 text-danger" />;
  };

  const togglePlatform = (key: string) => {
    setPlatformsExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openDetailModal = (type: SentimentModalData['type'], title: string, data: any) => {
    setModalData({ type, title, data });
    setModalOpen(true);
  };

  // Calculate aggregated metrics
  const totalMentions = socialSentiment ? 
    (socialSentiment.twitter?.volume || 0) + 
    (socialSentiment.reddit?.volume || 0) + 
    (socialSentiment.telegram?.volume || 0) : 0;

  // Mock trending topics
  const trendingTopics = [
    { topic: `$${chain.symbol}`, mentions: Math.floor(5000 + Math.random() * 10000), sentiment: 65 + Math.random() * 20 },
    { topic: `#${chain.name}`, mentions: Math.floor(3000 + Math.random() * 5000), sentiment: 50 + Math.random() * 30 },
    { topic: "DeFi", mentions: Math.floor(2000 + Math.random() * 3000), sentiment: 55 + Math.random() * 25 },
    { topic: "NFT", mentions: Math.floor(1000 + Math.random() * 2000), sentiment: 45 + Math.random() * 20 },
  ];

  // Mock influencers
  const topInfluencers = [
    { name: "@crypto_whale", followers: "1.2M", sentiment: "Bullish", engagement: 85 },
    { name: "@defi_insider", followers: "890K", sentiment: "Neutral", engagement: 72 },
    { name: "@blockchain_dev", followers: "650K", sentiment: "Bullish", engagement: 68 },
    { name: "@nft_collector", followers: "450K", sentiment: "Bearish", engagement: 55 },
  ];

  return (
    <>
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-display text-foreground">Enhanced Social Sentiment Galaxy</h3>
            <p className="text-sm text-muted-foreground">Community mood for {chain.name}</p>
          </div>

          <div className="flex items-center gap-3">
            {socialSentiment && (
              <button
                onClick={() => openDetailModal('overview', 'Sentiment Overview', socialSentiment)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-display text-sm flex items-center gap-2 transition-colors",
                  socialSentiment.overallSentiment >= 55 && "bg-success/20 text-success hover:bg-success/30",
                  socialSentiment.overallSentiment >= 45 && socialSentiment.overallSentiment < 55 && "bg-warning/20 text-warning hover:bg-warning/30",
                  socialSentiment.overallSentiment < 45 && "bg-danger/20 text-danger hover:bg-danger/30"
                )}
              >
                {getSentimentIcon(socialSentiment.overallSentiment)}
                {overallSentimentText(socialSentiment.overallSentiment)} ({socialSentiment.overallSentiment}%)
              </button>
            )}
            <button
              onClick={() => openDetailModal('methodology', 'Sentiment Methodology', {})}
              className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-48 animate-pulse bg-muted/20 rounded-xl" />
        ) : (
          <Tabs defaultValue="platforms" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
              <TabsTrigger value="galaxy">Galaxy View</TabsTrigger>
            </TabsList>

            <TabsContent value="platforms">
              {/* Platform Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {platforms.map((platform) => {
                  const data = platform.data;
                  if (!data) return null;

                  const total = data.positive + data.neutral + data.negative;
                  const isExpanded = platformsExpanded[platform.key];

                  return (
                    <Collapsible
                      key={platform.key}
                      open={isExpanded}
                      onOpenChange={() => togglePlatform(platform.key)}
                    >
                      <div className={cn("p-4 rounded-xl border border-border/50 transition-all", platform.bgColor)}>
                        <button
                          onClick={() => openDetailModal('platform', `${platform.label} Sentiment`, { platform: platform.key, ...data })}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <platform.icon className={cn("h-5 w-5", platform.color)} />
                              <span className="text-sm font-medium text-foreground">{platform.label}</span>
                            </div>
                          </div>

                          {/* Sentiment bars */}
                          <div className="h-3 rounded-full overflow-hidden flex mb-2">
                            <div className="bg-success transition-all" style={{ width: `${(data.positive / total) * 100}%` }} />
                            <div className="bg-warning transition-all" style={{ width: `${(data.neutral / total) * 100}%` }} />
                            <div className="bg-danger transition-all" style={{ width: `${(data.negative / total) * 100}%` }} />
                          </div>

                          {/* Percentages */}
                          <div className="flex justify-between text-xs">
                            <span className="text-success font-medium">{((data.positive / total) * 100).toFixed(0)}%</span>
                            <span className="text-warning">{((data.neutral / total) * 100).toFixed(0)}%</span>
                            <span className="text-danger">{((data.negative / total) * 100).toFixed(0)}%</span>
                          </div>

                          {/* Volume */}
                          <p className="text-xs text-muted-foreground mt-2">
                            {"volume" in data ? `${data.volume.toLocaleString()} mentions` : `${(data as any).count} articles`}
                          </p>
                        </button>

                        <CollapsibleTrigger className="w-full mt-2 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Positive</span>
                              <span className="text-success">{data.positive.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Neutral</span>
                              <span className="text-warning">{data.neutral.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Negative</span>
                              <span className="text-danger">{data.negative.toLocaleString()}</span>
                            </div>
                            {platform.link && (
                              <a
                                href={platform.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 w-full mt-2 px-2 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-xs"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View on {platform.label}
                              </a>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="trending">
              <div className="space-y-3">
                {trendingTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => openDetailModal('trending', topic.topic, topic)}
                    className="w-full p-4 rounded-xl bg-muted/10 hover:bg-muted/20 border border-border/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Hash className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">{topic.topic}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        topic.sentiment >= 55 ? "text-success" : topic.sentiment >= 45 ? "text-warning" : "text-danger"
                      )}>
                        {topic.sentiment.toFixed(0)}% positive
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{topic.mentions.toLocaleString()} mentions</span>
                      <Progress value={topic.sentiment} className="w-24 h-2" />
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="influencers">
              <div className="space-y-3">
                {topInfluencers.map((influencer, i) => (
                  <button
                    key={i}
                    onClick={() => openDetailModal('influencer', influencer.name, influencer)}
                    className="w-full p-4 rounded-xl bg-muted/10 hover:bg-muted/20 border border-border/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">{influencer.name}</p>
                          <p className="text-xs text-muted-foreground">{influencer.followers} followers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-sm font-medium",
                          influencer.sentiment === "Bullish" ? "text-success" : 
                          influencer.sentiment === "Neutral" ? "text-warning" : "text-danger"
                        )}>
                          {influencer.sentiment}
                        </span>
                        <p className="text-xs text-muted-foreground">{influencer.engagement}% engagement</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="galaxy">
              {/* Galaxy Visualization */}
              <div className="relative h-64 rounded-xl overflow-hidden bg-background/50 border border-border/30">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {/* Background nebulae */}
                  <defs>
                    <radialGradient id="nebula-green" cx="25%" cy="40%">
                      <stop offset="0%" stopColor="hsl(160 84% 39% / 0.4)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <radialGradient id="nebula-yellow" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="hsl(38 92% 50% / 0.3)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <radialGradient id="nebula-red" cx="75%" cy="60%">
                      <stop offset="0%" stopColor="hsl(0 84% 60% / 0.4)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  <ellipse cx="100" cy="80" rx="90" ry="60" fill="url(#nebula-green)" />
                  <ellipse cx="200" cy="100" rx="70" ry="50" fill="url(#nebula-yellow)" />
                  <ellipse cx="300" cy="90" rx="80" ry="55" fill="url(#nebula-red)" />

                  {/* Labels */}
                  <text x="100" y="170" textAnchor="middle" fill="hsl(160 84% 39%)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="600">
                    Positive
                  </text>
                  <text x="200" y="170" textAnchor="middle" fill="hsl(38 92% 50%)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="600">
                    Neutral
                  </text>
                  <text x="300" y="170" textAnchor="middle" fill="hsl(0 84% 60%)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="600">
                    Negative
                  </text>

                  {/* Animated star particles */}
                  {socialSentiment && Array.from({ length: Math.floor(socialSentiment.overallSentiment / 3) }).map((_, i) => (
                    <circle
                      key={`pos-${i}`}
                      cx={50 + Math.random() * 100}
                      cy={40 + Math.random() * 80}
                      r={2 + Math.random() * 4}
                      fill="hsl(160 84% 50%)"
                      opacity={0.5 + Math.random() * 0.5}
                    >
                      <animate
                        attributeName="opacity"
                        values={`${0.3 + Math.random() * 0.3};${0.7 + Math.random() * 0.3};${0.3 + Math.random() * 0.3}`}
                        dur={`${2 + Math.random() * 2}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}

                  {socialSentiment && Array.from({ length: Math.floor((100 - socialSentiment.overallSentiment) / 5) }).map((_, i) => (
                    <circle
                      key={`neg-${i}`}
                      cx={250 + Math.random() * 100}
                      cy={40 + Math.random() * 80}
                      r={2 + Math.random() * 4}
                      fill="hsl(0 84% 60%)"
                      opacity={0.4 + Math.random() * 0.4}
                    >
                      <animate
                        attributeName="opacity"
                        values={`${0.3};${0.7};${0.3}`}
                        dur={`${2 + Math.random() * 2}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </svg>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Community Analytics */}
        <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
          <CollapsibleTrigger className="w-full mt-4 flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Advanced Analytics</span>
            </div>
            {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 p-4 rounded-xl border border-border/30 bg-background/50 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => openDetailModal('overview', 'Total Mentions', { mentions: totalMentions })}
                  className="p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all text-center"
                >
                  <p className="text-xs text-muted-foreground mb-1">Total Mentions (24h)</p>
                  <p className="text-lg font-display text-foreground">{totalMentions.toLocaleString()}</p>
                </button>
                <div className="p-3 rounded-lg bg-muted/10 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Sentiment Trend</p>
                  <p className={cn(
                    "text-lg font-display flex items-center justify-center gap-1",
                    socialSentiment && socialSentiment.overallSentiment >= 50 ? "text-success" : "text-danger"
                  )}>
                    {socialSentiment && socialSentiment.overallSentiment >= 50 ? (
                      <><TrendingUp className="h-4 w-4" /> Rising</>
                    ) : (
                      <><TrendingDown className="h-4 w-4" /> Falling</>
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Influencer Score</p>
                  <p className="text-lg font-display text-foreground">8.4/10</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/10 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Viral Potential</p>
                  <p className="text-lg font-display text-warning">Medium</p>
                </div>
              </div>

              {/* External Links */}
              <div className="flex flex-wrap gap-2">
                <a href={`https://lunarcrush.com/coins/${chain.symbol?.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> LunarCrush
                </a>
                <a href="https://santiment.net" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Santiment
                </a>
                <a href="https://www.kaito.ai" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Kaito AI
                </a>
                {chain.twitter && (
                  <a href={chain.twitter} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Twitter className="h-3 w-3" /> Official Twitter
                  </a>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

    </>
  );
}