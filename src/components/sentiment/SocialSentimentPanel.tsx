import { useState } from "react";
import { 
  MessageCircle, Users, TrendingUp, TrendingDown, Activity, 
  Github, Globe, Search as SearchIcon, BarChart3, Zap,
  ChevronRight, ExternalLink, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SocialMetric {
  platform: string;
  icon: React.ElementType;
  color: string;
  mentions: number;
  sentiment: number; // 0-100
  change: number;
  influenceScore?: number;
}

interface CommunityMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

interface TokenSocialData {
  symbol: string;
  name: string;
  overallSentiment: number;
  socialMetrics: SocialMetric[];
  communityMetrics: CommunityMetric[];
  trendingRank?: number;
  whaleActivity: 'high' | 'medium' | 'low';
}

// Mock real-time social data generator
const generateSocialData = (symbol: string, name: string, change24h: number): TokenSocialData => {
  const baseSentiment = Math.min(100, Math.max(0, 50 + change24h * 3));
  
  return {
    symbol,
    name,
    overallSentiment: baseSentiment,
    trendingRank: Math.floor(Math.random() * 50) + 1,
    whaleActivity: change24h > 5 ? 'high' : change24h > 0 ? 'medium' : 'low',
    socialMetrics: [
      {
        platform: 'Twitter/X',
        icon: MessageCircle,
        color: 'text-[#1DA1F2]',
        mentions: Math.floor(Math.random() * 100000) + 10000,
        sentiment: baseSentiment + (Math.random() * 10 - 5),
        change: Math.floor(Math.random() * 40) - 10,
        influenceScore: Math.floor(Math.random() * 30) + 70,
      },
      {
        platform: 'Reddit',
        icon: MessageCircle,
        color: 'text-[#FF4500]',
        mentions: Math.floor(Math.random() * 50000) + 5000,
        sentiment: baseSentiment + (Math.random() * 10 - 5),
        change: Math.floor(Math.random() * 30) - 5,
        influenceScore: Math.floor(Math.random() * 20) + 60,
      },
      {
        platform: 'Telegram',
        icon: MessageCircle,
        color: 'text-[#0088CC]',
        mentions: Math.floor(Math.random() * 30000) + 2000,
        sentiment: baseSentiment + (Math.random() * 10 - 5),
        change: Math.floor(Math.random() * 25) - 5,
      },
      {
        platform: 'Discord',
        icon: MessageCircle,
        color: 'text-[#5865F2]',
        mentions: Math.floor(Math.random() * 20000) + 1000,
        sentiment: baseSentiment + (Math.random() * 10 - 5),
        change: Math.floor(Math.random() * 20) - 5,
      },
    ],
    communityMetrics: [
      {
        label: 'Holder Growth (7d)',
        value: `${(Math.random() * 5 + 0.5).toFixed(1)}%`,
        change: Math.random() * 10 - 2,
        icon: Users,
      },
      {
        label: 'Social Followers',
        value: `${Math.floor(Math.random() * 500 + 100)}K`,
        change: Math.random() * 8 - 1,
        icon: Users,
      },
      {
        label: 'Dev Activity',
        value: `${Math.floor(Math.random() * 200 + 20)} commits`,
        change: Math.random() * 15 - 3,
        icon: Github,
      },
      {
        label: 'Google Trends',
        value: `${Math.floor(Math.random() * 60 + 40)}/100`,
        change: Math.random() * 20 - 5,
        icon: SearchIcon,
      },
    ],
  };
};

interface SocialSentimentPanelProps {
  tokens: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume: number;
    marketCap: number;
  }>;
  onTokenClick?: (symbol: string) => void;
}

export function SocialSentimentPanel({ tokens, onTokenClick }: SocialSentimentPanelProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'platforms' | 'community'>('overview');

  const socialData = tokens.slice(0, 10).map(t => generateSocialData(t.symbol, t.name, t.change24h));
  const selectedData = selectedToken 
    ? socialData.find(d => d.symbol === selectedToken) 
    : socialData[0];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSentimentColor = (value: number) => {
    if (value >= 70) return 'text-success';
    if (value >= 40) return 'text-warning';
    return 'text-danger';
  };

  const getSentimentBg = (value: number) => {
    if (value >= 70) return 'bg-success';
    if (value >= 40) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="space-y-6">
      {/* Token Selector Row */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {socialData.map((data) => (
          <Button
            key={data.symbol}
            variant={selectedToken === data.symbol || (!selectedToken && data === socialData[0]) ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedToken(data.symbol)}
            className="gap-2 whitespace-nowrap shrink-0"
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              getSentimentBg(data.overallSentiment)
            )} />
            {data.symbol}
          </Button>
        ))}
      </div>

      {selectedData && (
        <>
          {/* Overall Sentiment Header */}
          <div className="holo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-xl">{selectedData.symbol}</h3>
                <p className="text-sm text-muted-foreground">{selectedData.name}</p>
              </div>
              <div className="text-right">
                <div className={cn("text-3xl font-display font-bold", getSentimentColor(selectedData.overallSentiment))}>
                  {Math.round(selectedData.overallSentiment)}
                </div>
                <div className="text-xs text-muted-foreground">Social Score</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Trending Rank</div>
                <div className="font-bold text-primary">#{selectedData.trendingRank}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Whale Activity</div>
                <div className={cn(
                  "font-bold",
                  selectedData.whaleActivity === 'high' ? 'text-success' :
                  selectedData.whaleActivity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                )}>
                  {selectedData.whaleActivity.toUpperCase()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Total Mentions</div>
                <div className="font-bold">
                  {formatNumber(selectedData.socialMetrics.reduce((sum, m) => sum + m.mentions, 0))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Platform Summary */}
              <div className="holo-card p-6">
                <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  REAL-TIME SENTIMENT BY PLATFORM
                </h4>
                <div className="space-y-4">
                  {selectedData.socialMetrics.map((metric) => (
                    <div key={metric.platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <metric.icon className={cn("w-4 h-4", metric.color)} />
                          <span className="font-medium text-sm">{metric.platform}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{formatNumber(metric.mentions)} mentions</span>
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded",
                            metric.change >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                          )}>
                            {metric.change >= 0 ? "+" : ""}{metric.change}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.sentiment} className="flex-1 h-2" />
                        <span className={cn("text-sm font-bold w-10", getSentimentColor(metric.sentiment))}>
                          {Math.round(metric.sentiment)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Growth */}
              <div className="holo-card p-6">
                <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  COMMUNITY METRICS
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedData.communityMetrics.map((metric) => (
                    <div key={metric.label} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <metric.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{metric.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{metric.value}</span>
                        <span className={cn(
                          "text-xs font-medium",
                          metric.change >= 0 ? "text-success" : "text-danger"
                        )}>
                          {metric.change >= 0 ? "+" : ""}{metric.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="space-y-4 mt-4">
              {selectedData.socialMetrics.map((metric) => (
                <div key={metric.platform} className="holo-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-muted", metric.color)}>
                        <metric.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold">{metric.platform}</h4>
                        <p className="text-sm text-muted-foreground">{formatNumber(metric.mentions)} mentions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-2xl font-bold", getSentimentColor(metric.sentiment))}>
                        {Math.round(metric.sentiment)}
                      </div>
                      <div className="text-xs text-muted-foreground">Sentiment</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                      <div className={cn("font-bold", metric.change >= 0 ? "text-success" : "text-danger")}>
                        {metric.change >= 0 ? "+" : ""}{metric.change}%
                      </div>
                    </div>
                    {metric.influenceScore && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Influence</div>
                        <div className="font-bold text-primary">{metric.influenceScore}</div>
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Reach</div>
                      <div className="font-bold">{formatNumber(metric.mentions * 10)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-4 mt-4">
              <div className="holo-card p-6">
                <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  GROWTH METRICS
                </h4>
                <div className="space-y-4">
                  {selectedData.communityMetrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <metric.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{metric.label}</div>
                          <div className="text-2xl font-bold">{metric.value}</div>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full font-bold",
                        metric.change >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                      )}>
                        {metric.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {metric.change >= 0 ? "+" : ""}{metric.change.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Whale Social Activity */}
              <div className="holo-card p-6">
                <h4 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-warning" />
                  WHALE SOCIAL ACTIVITY
                </h4>
                <div className="space-y-3">
                  {[
                    { wallet: '0x7a1f...8e3d', action: 'Tweeted about', sentiment: 'bullish', time: '2m ago' },
                    { wallet: '0x3b2c...9f1a', action: 'Reddit post on', sentiment: 'neutral', time: '15m ago' },
                    { wallet: '0x9d4e...2c7b', action: 'Discord mention', sentiment: 'bullish', time: '32m ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm">
                            <span className="font-mono text-primary">{activity.wallet}</span>
                            <span className="text-muted-foreground"> {activity.action} </span>
                            <span className="font-bold">{selectedData.symbol}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{activity.time}</div>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded font-bold",
                        activity.sentiment === 'bullish' ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                      )}>
                        {activity.sentiment.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
