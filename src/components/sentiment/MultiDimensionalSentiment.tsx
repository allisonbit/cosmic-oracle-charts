import { Brain, Users, TrendingUp, Waves, Activity, Info, ExternalLink, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  /** % of top coins above water on the day (0-100) — real breadth. */
  breadth: number;
  /** Realized short-term volatility index (0-100) — real, derived from moves. */
  volatilityIndex: number;
  /** Median volume-to-marketcap turnover across top coins (%). */
  turnover: number;
}

export function MultiDimensionalSentiment({
  fearGreedIndex, breadth, volatilityIndex, turnover
}: MultiDimensionalSentimentProps) {
  const turnoverScore = Math.min(100, (turnover / 15) * 100); // 15%+ daily turnover = very hot
  // Low volatility reads as "calm" — invert for the sentiment framing.
  const calmScore = Math.max(0, Math.min(100, 100 - volatilityIndex));
  
  const dimensions: DimensionData[] = [
    { id: 'fear_greed', name: 'Fear & Greed', shortName: 'F&G', icon: <Brain className="w-5 h-5" />, score: fearGreedIndex, weight: 0.35, trend: fearGreedIndex > 55 ? 'up' : fearGreedIndex < 45 ? 'down' : 'stable', description: 'The live market Fear & Greed Index from alternative.me, combining volatility, momentum and dominance signals.', dataPoints: ['Market volatility', 'Trading momentum', 'Bitcoin dominance', 'Trend strength'], sources: [{ name: 'Alternative.me', url: 'https://alternative.me/crypto/fear-and-greed-index/' }] },
    { id: 'breadth', name: 'Market Breadth', shortName: 'Breadth', icon: <Users className="w-5 h-5" />, score: breadth, weight: 0.25, trend: breadth > 55 ? 'up' : breadth < 45 ? 'down' : 'stable', description: 'Share of the top coins trading higher over 24h — a real measure of how broad the move is.', dataPoints: ['Coins above water (24h)', 'Advance/decline ratio', 'Momentum leaders', 'Laggards'], sources: [{ name: 'CoinGecko (live)', url: 'https://www.coingecko.com/' }] },
    { id: 'volatility', name: 'Volatility Regime', shortName: 'Vol.', icon: <Activity className="w-5 h-5" />, score: calmScore, weight: 0.20, trend: calmScore > 55 ? 'up' : calmScore < 45 ? 'down' : 'stable', description: 'Average absolute 24h move across the top coins, inverted: high calm = orderly market, low = turbulent.', dataPoints: ['Avg |24h move|', 'Risk level', 'Range expansion', 'Regime read'], sources: [{ name: 'CoinGecko (live)', url: 'https://www.coingecko.com/' }] },
    { id: 'turnover', name: 'Volume Turnover', shortName: 'Volume', icon: <TrendingUp className="w-5 h-5" />, score: turnoverScore, weight: 0.20, trend: turnoverScore > 55 ? 'up' : turnoverScore < 45 ? 'down' : 'stable', description: '24h volume relative to market cap across the top coins — how actively capital is moving today.', dataPoints: [`${turnover.toFixed(1)}% median turnover`, 'Volume vs market cap', 'Liquidity depth', 'Participation'], sources: [{ name: 'CoinGecko (live)', url: 'https://www.coingecko.com/' }] }
  ];

  const compositeScore = dimensions.reduce((sum, dim) => sum + (dim.score * dim.weight), 0);
  
  const getScoreColor = (score: number) => score >= 70 ? 'text-success' : score >= 50 ? 'text-primary' : score >= 35 ? 'text-warning' : 'text-danger';
  const getScoreLabel = (score: number) => score >= 80 ? 'Extreme Greed' : score >= 65 ? 'Greed' : score >= 50 ? 'Neutral-Bullish' : score >= 35 ? 'Neutral-Bearish' : score >= 20 ? 'Fear' : 'Extreme Fear';
  const getTrendArrow = (trend: 'up' | 'down' | 'stable') => trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stable';

  return (
    <div className="border-t border-border/30 pt-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="section-label flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            OracleBull Sentiment Engine
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Multi-dimensional weighted analysis</p>
        </div>
        <div className="text-right">
          <div className={cn("text-4xl font-display font-bold", getScoreColor(compositeScore))}>
            {(compositeScore ?? 0).toFixed(0)}
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

      {/* All dimensions shown inline - no dropdowns */}
      <div>
        {dimensions.map(dim => (
          <div key={dim.id} className="border-b border-border/20 last:border-b-0 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn("flex-shrink-0", getScoreColor(dim.score))}>
                  {dim.icon}
                </span>
                <span className="text-sm font-medium">{dim.name}</span>
                <span className="text-xs text-muted-foreground">({(dim.weight * 100).toFixed(0)}%)</span>
                <span className="text-xs">{getTrendArrow(dim.trend)}</span>
              </div>
              <span className={cn("font-bold text-lg", getScoreColor(dim.score))}>{(dim.score ?? 0).toFixed(0)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div className={cn("h-full rounded-full transition-all",
                dim.score >= 70 ? "bg-success" : dim.score >= 50 ? "bg-primary" : dim.score >= 35 ? "bg-warning" : "bg-danger"
              )} style={{ width: `${dim.score}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">{dim.description}</p>
            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
              {dim.dataPoints.map((point, i) => (
                <span key={i} className="text-xs text-muted-foreground">• {point}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {dim.sources.map(source => (
                <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1">
                  {source.name} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
