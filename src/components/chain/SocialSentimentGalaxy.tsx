import { ChainConfig } from "@/lib/chainConfig";
import { SocialSentiment } from "@/hooks/useChainForecast";
import { Twitter, MessageCircle, Send, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialSentimentGalaxyProps {
  chain: ChainConfig;
  socialSentiment: SocialSentiment | undefined;
  isLoading: boolean;
}

export function SocialSentimentGalaxy({ chain, socialSentiment, isLoading }: SocialSentimentGalaxyProps) {
  const platforms = [
    { key: "twitter", label: "Twitter/X", icon: Twitter, data: socialSentiment?.twitter },
    { key: "reddit", label: "Reddit", icon: MessageCircle, data: socialSentiment?.reddit },
    { key: "telegram", label: "Telegram", icon: Send, data: socialSentiment?.telegram },
    { key: "news", label: "News", icon: Newspaper, data: socialSentiment?.news },
  ] as const;

  const overallSentimentText = (score: number) => {
    if (score >= 70) return "Bullish";
    if (score >= 55) return "Slightly Bullish";
    if (score >= 45) return "Neutral";
    if (score >= 30) return "Slightly Bearish";
    return "Bearish";
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
            <span className="text-sm text-muted-foreground">Overall:</span>
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
          <text x="100" y="130" textAnchor="middle" fill="hsl(160 84% 39%)" fontSize="12" fontFamily="Orbitron">
            Positive
          </text>
          <text x="200" y="130" textAnchor="middle" fill="hsl(38 92% 50%)" fontSize="12" fontFamily="Orbitron">
            Neutral
          </text>
          <text x="300" y="130" textAnchor="middle" fill="hsl(0 84% 60%)" fontSize="12" fontFamily="Orbitron">
            Negative
          </text>

          {/* Star particles - Positive zone */}
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

          {/* Star particles - Neutral zone */}
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

          {/* Star particles - Negative zone */}
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

      {/* Platform Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platforms.map((platform) => {
          const data = platform.data;
          if (!data) return null;

          const total = data.positive + data.neutral + data.negative;

          return (
            <div
              key={platform.key}
              className="p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <platform.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{platform.label}</span>
              </div>

              {/* Sentiment bars */}
              <div className="h-2 rounded-full overflow-hidden flex mb-2">
                <div
                  className="bg-success"
                  style={{ width: `${(data.positive / total) * 100}%` }}
                />
                <div
                  className="bg-warning"
                  style={{ width: `${(data.neutral / total) * 100}%` }}
                />
                <div
                  className="bg-danger"
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
