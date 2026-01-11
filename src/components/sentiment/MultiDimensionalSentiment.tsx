import { useState } from "react";
import { Brain, Users, TrendingUp, Waves, Activity, ChevronRight, Info, ExternalLink, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  fearGreedIndex,
  socialSentiment,
  volatilityIndex,
  whaleActivity,
  fundingRate = 0.015,
  onchainSentiment = 58
}: MultiDimensionalSentimentProps) {
  const [selectedDimension, setSelectedDimension] = useState<DimensionData | null>(null);

  // Normalize funding rate to 0-100 scale
  const fundingScore = 50 + (fundingRate * 1000);
  
  const dimensions: DimensionData[] = [
    {
      id: 'social',
      name: 'Social Volume',
      shortName: 'Social',
      icon: <Users className="w-5 h-5" />,
      score: socialSentiment,
      weight: 0.20,
      trend: socialSentiment > 55 ? 'up' : socialSentiment < 45 ? 'down' : 'stable',
      description: 'Aggregated sentiment from Twitter, Reddit, Telegram, and Discord communities.',
      dataPoints: [
        'Twitter mention velocity',
        'Reddit post sentiment',
        'Telegram group activity',
        'Discord server engagement'
      ],
      sources: [
        { name: 'LunarCrush', url: 'https://lunarcrush.com/' },
        { name: 'Santiment', url: 'https://app.santiment.net/' }
      ]
    },
    {
      id: 'fear_greed',
      name: 'Fear & Greed',
      shortName: 'F&G',
      icon: <Brain className="w-5 h-5" />,
      score: fearGreedIndex,
      weight: 0.25,
      trend: fearGreedIndex > 55 ? 'up' : fearGreedIndex < 45 ? 'down' : 'stable',
      description: 'The market Fear & Greed Index combining volatility, momentum, and social signals.',
      dataPoints: [
        'Market volatility',
        'Trading momentum',
        'Social media trends',
        'Bitcoin dominance'
      ],
      sources: [
        { name: 'Alternative.me', url: 'https://alternative.me/crypto/fear-and-greed-index/' },
        { name: 'CoinMarketCap', url: 'https://coinmarketcap.com/' }
      ]
    },
    {
      id: 'derivatives',
      name: 'Derivatives Data',
      shortName: 'Deriv.',
      icon: <TrendingUp className="w-5 h-5" />,
      score: fundingScore,
      weight: 0.20,
      trend: fundingRate > 0.01 ? 'up' : fundingRate < -0.01 ? 'down' : 'stable',
      description: 'Funding rates and open interest from perpetual futures markets.',
      dataPoints: [
        `Current funding: ${(fundingRate * 100).toFixed(3)}%`,
        'Open interest trend',
        'Long/Short ratio',
        'Liquidation levels'
      ],
      sources: [
        { name: 'Coinglass', url: 'https://www.coinglass.com/' },
        { name: 'CryptoQuant', url: 'https://cryptoquant.com/' }
      ]
    },
    {
      id: 'onchain',
      name: 'On-Chain Sentiment',
      shortName: 'On-Chain',
      icon: <Activity className="w-5 h-5" />,
      score: onchainSentiment,
      weight: 0.20,
      trend: onchainSentiment > 55 ? 'up' : onchainSentiment < 45 ? 'down' : 'stable',
      description: 'NUPL (Net Unrealized Profit/Loss) and holder behavior analysis.',
      dataPoints: [
        'NUPL indicator',
        'Holder distribution',
        'Coin days destroyed',
        'Exchange reserves'
      ],
      sources: [
        { name: 'Glassnode', url: 'https://glassnode.com/' },
        { name: 'IntoTheBlock', url: 'https://www.intotheblock.com/' }
      ]
    },
    {
      id: 'whale',
      name: 'Whale Activity',
      shortName: 'Whales',
      icon: <Waves className="w-5 h-5" />,
      score: whaleActivity,
      weight: 0.15,
      trend: whaleActivity > 60 ? 'up' : whaleActivity < 40 ? 'down' : 'stable',
      description: 'Large transaction monitoring and smart money flow analysis.',
      dataPoints: [
        'Large tx count (24h)',
        'Exchange inflows',
        'Exchange outflows',
        'Accumulation patterns'
      ],
      sources: [
        { name: 'Whale Alert', url: 'https://whale-alert.io/' },
        { name: 'Nansen', url: 'https://www.nansen.ai/' }
      ]
    }
  ];

  // Calculate composite OracleBull score
  const compositeScore = dimensions.reduce((sum, dim) => sum + (dim.score * dim.weight), 0);
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 50) return 'text-primary';
    if (score >= 35) return 'text-warning';
    return 'text-danger';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Extreme Greed';
    if (score >= 65) return 'Greed';
    if (score >= 50) return 'Neutral-Bullish';
    if (score >= 35) return 'Neutral-Bearish';
    if (score >= 20) return 'Fear';
    return 'Extreme Fear';
  };

  const getTrendArrow = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  return (
    <>
      <div className="holo-card p-4 md:p-6">
        {/* Main Composite Score */}
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

        {/* Composite Progress Bar */}
        <div className="mb-6">
          <div className="h-4 rounded-full overflow-hidden bg-gradient-to-r from-danger via-warning to-success relative">
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${compositeScore}%`, transform: 'translateX(-50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Extreme Fear</span>
            <span>Neutral</span>
            <span>Extreme Greed</span>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-3">
          {dimensions.map(dim => (
            <button
              key={dim.id}
              onClick={() => setSelectedDimension(dim)}
              className="w-full group"
            >
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
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    dim.score >= 70 ? "bg-success" :
                    dim.score >= 50 ? "bg-primary" :
                    dim.score >= 35 ? "bg-warning" : "bg-danger"
                  )}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dimension Detail Modal */}
      <Dialog open={!!selectedDimension} onOpenChange={() => setSelectedDimension(null)}>
        <DialogContent className="max-w-md">
          {selectedDimension && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-xl",
                    getScoreColor(selectedDimension.score).replace('text-', 'bg-') + '/20'
                  )}>
                    {selectedDimension.icon}
                  </div>
                  <div>
                    <div className="text-lg font-display">{selectedDimension.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      Weight: {(selectedDimension.weight * 100).toFixed(0)}% of composite
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Score */}
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className={cn("text-4xl font-display font-bold", getScoreColor(selectedDimension.score))}>
                    {selectedDimension.score.toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Score {getTrendArrow(selectedDimension.trend)}
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-sm">{selectedDimension.description}</p>
                </div>

                {/* Data Points */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2 font-display flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    DATA POINTS ANALYZED
                  </div>
                  <div className="space-y-1">
                    {selectedDimension.dataPoints.map((point, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {point}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2 font-display flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    DATA SOURCES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDimension.sources.map(source => (
                      <Button
                        key={source.name}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(source.url, '_blank')}
                        className="text-xs"
                      >
                        {source.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
