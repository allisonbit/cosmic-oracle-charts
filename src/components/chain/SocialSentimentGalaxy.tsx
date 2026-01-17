import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { SocialSentiment } from "@/hooks/useChainForecast";
import { Twitter, MessageCircle, Send, Newspaper, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SocialSentimentGalaxyProps {
  chain: ChainConfig;
  socialSentiment: SocialSentiment | undefined;
  isLoading: boolean;
}

export function SocialSentimentGalaxy({ chain, socialSentiment, isLoading }: SocialSentimentGalaxyProps) {
  const [platformsExpanded, setPlatformsExpanded] = useState<Record<string, boolean>>({});
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const platforms = [
    { key: "twitter", label: "Twitter/X", icon: Twitter, data: socialSentiment?.twitter, link: chain.twitter, color: "text-[#1DA1F2]" },
    { key: "reddit", label: "Reddit", icon: MessageCircle, data: socialSentiment?.reddit, link: `https://reddit.com/r/${chain.id}`, color: "text-[#FF4500]" },
    { key: "telegram", label: "Telegram", icon: Send, data: socialSentiment?.telegram, link: "https://telegram.org", color: "text-[#0088CC]" },
    { key: "news", label: "News", icon: Newspaper, data: socialSentiment?.news, link: `https://cryptopanic.com/news/${chain.symbol?.toLowerCase()}/`, color: "text-warning" },
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

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">Social Sentiment Galaxy</h3>
          <p className="text-sm text-muted-foreground">Community mood for {chain.name}</p>
        </div>

        {socialSentiment && (
          <div className="flex items-center gap-3">
            {getSentimentIcon(socialSentiment.overallSentiment)}
            <div className={cn(
              "px-3 py-1.5 rounded-lg font-display text-sm",
              socialSentiment.overallSentiment >= 55 && "bg-success/20 text-success",
              socialSentiment.overallSentiment >= 45 && socialSentiment.overallSentiment < 55 && "bg-warning/20 text-warning",
              socialSentiment.overallSentiment < 45 && "bg-danger/20 text-danger"
            )}>
              {overallSentimentText(socialSentiment.overallSentiment)} ({socialSentiment.overallSentiment}%)
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse bg-muted/20 rounded-xl" />
      ) : (
        <>
          {/* Galaxy Visualization */}
          <div className="relative h-48 mb-6">
            {/* Star clusters representing sentiment */}
            <svg viewBox="0 0 400 150" className="w-full h-full">
              {/* Background nebula */}
              <defs>
                <radialGradient id="nebula-green" cx="30%" cy="40%">
                  <stop offset="0%" stopColor="hsl(160 84% 39% / 0.3)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="nebula-yellow" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="hsl(38 92% 50% / 0.2)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="nebula-red" cx="70%" cy="60%">
                  <stop offset="0%" stopColor="hsl(0 84% 60% / 0.3)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              <ellipse cx="100" cy="60" rx="80" ry="50" fill="url(#nebula-green)" />
              <ellipse cx="200" cy="75" rx="60" ry="40" fill="url(#nebula-yellow)" />
              <ellipse cx="300" cy="70" rx="70" ry="45" fill="url(#nebula-red)" />

              {/* Labels */}
              <text x="100" y="130" textAnchor="middle" fill="hsl(160 84% 39%)" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
                Positive
              </text>
              <text x="200" y="130" textAnchor="middle" fill="hsl(38 92% 50%)" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
                Neutral
              </text>
              <text x="300" y="130" textAnchor="middle" fill="hsl(0 84% 60%)" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
                Negative
              </text>

              {/* Star particles */}
              {socialSentiment && Array.from({ length: Math.floor(socialSentiment.overallSentiment / 5) }).map((_, i) => (
                <circle
                  key={`pos-${i}`}
                  cx={60 + Math.random() * 80}
                  cy={30 + Math.random() * 60}
                  r={2 + Math.random() * 3}
                  fill="hsl(160 84% 50%)"
                  opacity={0.4 + Math.random() * 0.6}
                >
                  <animate
                    attributeName="opacity"
                    values={`${0.3 + Math.random() * 0.3};${0.7 + Math.random() * 0.3};${0.3 + Math.random() * 0.3}`}
                    dur={`${2 + Math.random() * 2}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}

              {socialSentiment && Array.from({ length: Math.floor((100 - socialSentiment.overallSentiment) / 10) }).map((_, i) => (
                <circle
                  key={`neu-${i}`}
                  cx={160 + Math.random() * 80}
                  cy={40 + Math.random() * 50}
                  r={2 + Math.random() * 2}
                  fill="hsl(38 92% 50%)"
                  opacity={0.3 + Math.random() * 0.4}
                >
                  <animate
                    attributeName="opacity"
                    values={`${0.3};${0.6};${0.3}`}
                    dur={`${2 + Math.random() * 3}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}

              {socialSentiment && Array.from({ length: Math.floor((100 - socialSentiment.overallSentiment) / 8) }).map((_, i) => (
                <circle
                  key={`neg-${i}`}
                  cx={260 + Math.random() * 80}
                  cy={35 + Math.random() * 55}
                  r={2 + Math.random() * 3}
                  fill="hsl(0 84% 60%)"
                  opacity={0.3 + Math.random() * 0.5}
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

          {/* Expandable Platform Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {platforms.map((platform) => {
              const data = platform.data;
              if (!data) return null;

              const total = data.positive + data.neutral + data.negative;
              const positivePercent = (data.positive / total) * 100;
              const isExpanded = platformsExpanded[platform.key];

              return (
                <Collapsible
                  key={platform.key}
                  open={isExpanded}
                  onOpenChange={() => togglePlatform(platform.key)}
                >
                  <div className="p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-all">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <platform.icon className={cn("h-4 w-4", platform.color)} />
                          <span className="text-sm font-medium text-foreground">{platform.label}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </div>
                    </CollapsibleTrigger>

                    {/* Sentiment bars */}
                    <div className="h-2 rounded-full overflow-hidden flex mb-2">
                      <div
                        className="bg-success transition-all"
                        style={{ width: `${(data.positive / total) * 100}%` }}
                      />
                      <div
                        className="bg-warning transition-all"
                        style={{ width: `${(data.neutral / total) * 100}%` }}
                      />
                      <div
                        className="bg-danger transition-all"
                        style={{ width: `${(data.negative / total) * 100}%` }}
                      />
                    </div>

                    {/* Percentages */}
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span className="text-success">{((data.positive / total) * 100).toFixed(0)}%</span>
                      <span className="text-warning">{((data.neutral / total) * 100).toFixed(0)}%</span>
                      <span className="text-danger">{((data.negative / total) * 100).toFixed(0)}%</span>
                    </div>

                    {/* Volume */}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {"volume" in data ? `${data.volume.toLocaleString()} mentions` : `${(data as any).count} articles`}
                    </p>

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

          {/* Expanded Analytics Section */}
          <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
            <CollapsibleTrigger className="w-full mt-4 flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Community Analytics</span>
              </div>
              {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 p-4 rounded-xl border border-border/30 bg-background/50 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/10">
                    <p className="text-xs text-muted-foreground mb-1">Total Mentions (24h)</p>
                    <p className="text-lg font-display text-foreground">
                      {socialSentiment ? 
                        ((socialSentiment.twitter?.volume || 0) + 
                         (socialSentiment.reddit?.volume || 0) + 
                         (socialSentiment.telegram?.volume || 0)).toLocaleString() 
                        : "0"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/10">
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
                  <div className="p-3 rounded-lg bg-muted/10">
                    <p className="text-xs text-muted-foreground mb-1">Influencer Score</p>
                    <p className="text-lg font-display text-foreground">8.4/10</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/10">
                    <p className="text-xs text-muted-foreground mb-1">Viral Potential</p>
                    <p className="text-lg font-display text-warning">Medium</p>
                  </div>
                </div>

                {/* External Links */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://lunarcrush.com/coins/${chain.symbol?.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> LunarCrush
                  </a>
                  <a
                    href={`https://santiment.net/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Santiment
                  </a>
                  {chain.twitter && (
                    <a
                      href={chain.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                    >
                      <Twitter className="h-3 w-3" /> Official Twitter
                    </a>
                  )}
                  {chain.discord && (
                    <a
                      href={chain.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="h-3 w-3" /> Discord
                    </a>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
