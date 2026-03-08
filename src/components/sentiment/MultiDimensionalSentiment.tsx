import { useState } from "react";
import { Brain, Users, TrendingUp, Waves, Activity, ChevronRight, ChevronDown, Info, ExternalLink, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DimensionData {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  score: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  dataPoints: string[];
  sources: { name: string; url: string }[];
}

interface MultiDimensionalSentimentProps {
  fearGreedIndex: number;
  socialSentiment: number;
  volatilityIndex: number;
  whaleActivity: number;
  fundingRate?: number;
  onchainSentiment?: number;
}

export function MultiDimensionalSentiment({
  fearGreedIndex, socialSentiment, volatilityIndex, whaleActivity,
  fundingRate = 0.015, onchainSentiment = 58
}: MultiDimensionalSentimentProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const fundingScore = 50 + (fundingRate * 1000);
  
  const dimensions: DimensionData[] = [
    { id: 'social', name: 'Social Volume', shortName: 'Social', icon: <Users className="w-5 h-5" />, score: socialSentiment, weight: 0.20, trend: socialSentiment > 55 ? 'up' : socialSentiment < 45 ? 'down' : 'stable', description: 'Aggregated sentiment from Twitter, Reddit, Telegram, and Discord communities.', dataPoints: ['Twitter mention velocity', 'Reddit post sentiment', 'Telegram group activity', 'Discord server engagement'], sources: [{ name: 'LunarCrush', url: 'https://lunarcrush.com/' }, { name: 'Santiment', url: 'https://app.santiment.net/' }] },
    { id: 'fear_greed', name: 'Fear & Greed', shortName: 'F&G', icon: <Brain className="w-5 h-5" />, score: fearGreedIndex, weight: 0.25, trend: fearGreedIndex > 55 ? 'up' : fearGreedIndex < 45 ? 'down' : 'stable', description: 'The market Fear & Greed Index combining volatility, momentum, and social signals.', dataPoints: ['Market volatility', 'Trading momentum', 'Social media trends', 'Bitcoin dominance'], sources: [{ name: 'Alternative.me', url: 'https://alternative.me/crypto/fear-and-greed-index/' }] },
    { id: 'derivatives', name: 'Derivatives Data', shortName: 'Deriv.', icon: <TrendingUp className="w-5 h-5" />, score: fundingScore, weight: 0.20, trend: fundingRate > 0.01 ? 'up' : fundingRate < -0.01 ? 'down' : 'stable', description: 'Funding rates and open interest from perpetual futures markets.', dataPoints: [`Current funding: ${(fundingRate * 100).toFixed(3)}%`, 'Open interest trend', 'Long/Short ratio', 'Liquidation levels'], sources: [{ name: 'Coinglass', url: 'https://www.coinglass.com/' }] },
    { id: 'onchain', name: 'On-Chain Sentiment', shortName: 'On-Chain', icon: <Activity className="w-5 h-5" />, score: onchainSentiment, weight: 0.20, trend: onchainSentiment > 55 ? 'up' : onchainSentiment < 45 ? 'down' : 'stable', description: 'NUPL (Net Unrealized Profit/Loss) and holder behavior analysis.', dataPoints: ['NUPL indicator', 'Holder distribution', 'Coin days destroyed', 'Exchange reserves'], sources: [{ name: 'Glassnode', url: 'https://glassnode.com/' }] },
    { id: 'whale', name: 'Whale Activity', shortName: 'Whales', icon: <Waves className="w-5 h-5" />, score: whaleActivity, weight: 0.15, trend: whaleActivity > 60 ? 'up' : whaleActivity < 40 ? 'down' : 'stable', description: 'Large transaction monitoring and smart money flow analysis.', dataPoints: ['Large tx count (24h)', 'Exchange inflows', 'Exchange outflows', 'Accumulation patterns'], sources: [{ name: 'Whale Alert', url: 'https://whale-alert.io/' }] }
  ];

  const compositeScore = dimensions.reduce((sum, dim) => sum + (dim.score * dim.weight), 0);
  
  const getScoreColor = (score: number) => score >= 70 ? 'text-success' : score >= 50 ? 'text-primary' : score >= 35 ? 'text-warning' : 'text-danger';
  const getScoreLabel = (score: number) => score >= 80 ? 'Extreme Greed' : score >= 65 ? 'Greed' : score >= 50 ? 'Neutral-Bullish' : score >= 35 ? 'Neutral-Bearish' : score >= 20 ? 'Fear' : 'Extreme Fear';
  const getTrendArrow = (trend: 'up' | 'down' | 'stable') => trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';

  return (
    <div className="holo-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            ORACLEBULL SENTIMENT ENGINE
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Multi-dimensional weighted analysis</p>
        </div>
        <div className="text-right">
          <div className={cn("text-4xl font-display font-bold", getScoreColor(compositeScore))}>
            {compositeScore.toFixed(0)}
          </div>
          <div className={cn("text-sm font-medium", getScoreColor(compositeScore))}>
            {getScoreLabel(compositeScore)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-4 rounded-full overflow-hidden bg-gradient-to-r from-danger via-warning to-success relative">
          <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${compositeScore}%`, transform: 'translateX(-50%)' }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
      </div>

      <div className="space-y-3">
        {dimensions.map(dim => {
          const isExpanded = expandedDimension === dim.id;
          return (
            <div key={dim.id}>
              <button onClick={() => setExpandedDimension(isExpanded ? null : dim.id)} className="w-full group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded", getScoreColor(dim.score).replace('text-', 'bg-') + '/20')}>
                      {dim.icon}
                    </div>
                    <span className="text-sm font-medium">{dim.name}</span>
                    <span className="text-xs text-muted-foreground">({(dim.weight * 100).toFixed(0)}%)</span>
                    <span className="text-xs">{getTrendArrow(dim.trend)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-bold", getScoreColor(dim.score))}>{dim.score.toFixed(0)}</span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all",
                    dim.score >= 70 ? "bg-success" : dim.score >= 50 ? "bg-primary" : dim.score >= 35 ? "bg-warning" : "bg-danger"
                  )} style={{ width: `${dim.score}%` }} />
                </div>
              </button>
              
              {isExpanded && (
                <div className="ml-10 mt-2 mb-3 p-3 rounded-lg bg-muted/20 border border-border/30 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-sm text-muted-foreground mb-3">{dim.description}</p>
                  <div className="text-xs text-muted-foreground mb-2 font-display flex items-center gap-1">
                    <Info className="w-3 h-3" /> DATA POINTS
                  </div>
                  <div className="space-y-1 mb-3">
                    {dim.dataPoints.map((point, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {point}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dim.sources.map(source => (
                      <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded border border-border/50 hover:border-primary/50 text-primary flex items-center gap-1">
                        {source.name} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
