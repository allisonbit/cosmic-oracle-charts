import { useState } from "react";
import { 
  Brain, TrendingUp, TrendingDown, Activity, Users, Waves, Zap,
  BarChart3, Target, Shield, Rocket, AlertTriangle, ChevronRight,
  ExternalLink, Info, Clock, Globe, DollarSign, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EnhancedOverviewPanelProps {
  fearGreedIndex: number;
  socialSentiment: number;
  volatilityIndex: number;
  whaleActivity: number;
  bullishCount: number;
  bearishCount: number;
  totalCoins: number;
  avgChange: number;
  totalVolume: number;
  onWhaleClick: () => void;
}

interface MetricDetails {
  title: string;
  description: string;
  currentValue: number;
  historicalComparison: string;
  implications: string[];
  relatedLinks: { name: string; url: string }[];
}

export function EnhancedOverviewPanel({
  fearGreedIndex,
  socialSentiment,
  volatilityIndex,
  whaleActivity,
  bullishCount,
  bearishCount,
  totalCoins,
  avgChange,
  totalVolume,
  onWhaleClick
}: EnhancedOverviewPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

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

  const marketMomentum = bullishCount > bearishCount ? "BULLISH" : bearishCount > bullishCount ? "BEARISH" : "NEUTRAL";

  const getMetricDetails = (metricId: string): MetricDetails => {
    switch (metricId) {
      case 'fear-greed':
        return {
          title: 'Fear & Greed Index',
          description: 'The Fear & Greed Index measures market sentiment by analyzing volatility, market momentum, social media, dominance, and trends. It ranges from 0 (Extreme Fear) to 100 (Extreme Greed).',
          currentValue: fearGreedIndex,
          historicalComparison: fearGreedIndex > 60 ? 'Above average - markets are optimistic' : fearGreedIndex < 40 ? 'Below average - fear is present' : 'At neutral levels',
          implications: [
            fearGreedIndex > 75 ? 'Extreme greed may signal overbought conditions' : '',
            fearGreedIndex < 25 ? 'Extreme fear often presents buying opportunities' : '',
            'Use as contrarian indicator for entry/exit timing',
            'Compare with historical readings for context',
            'Monitor alongside price action for confirmation'
          ].filter(Boolean),
          relatedLinks: [
            { name: 'Alternative.me F&G', url: 'https://alternative.me/crypto/fear-and-greed-index/' },
            { name: 'CoinMarketCap Fear & Greed', url: 'https://coinmarketcap.com/charts/fear-and-greed-index/' },
            { name: 'LookIntoBitcoin', url: 'https://www.lookintobitcoin.com/charts/bitcoin-fear-and-greed-index/' },
          ]
        };
      case 'social':
        return {
          title: 'Social Sentiment Score',
          description: 'Aggregated sentiment analysis from Twitter, Reddit, Telegram, and Discord. Measures the overall mood of crypto communities and influencers.',
          currentValue: socialSentiment,
          historicalComparison: socialSentiment > 60 ? 'Positive sentiment trending' : socialSentiment < 40 ? 'Negative sentiment detected' : 'Mixed sentiment',
          implications: [
            'Social sentiment often leads price movements by 24-48 hours',
            'Extreme readings can signal local tops/bottoms',
            'Monitor for sudden sentiment shifts',
            'Cross-reference with on-chain data',
            'Watch for influencer activity spikes'
          ],
          relatedLinks: [
            { name: 'LunarCrush', url: 'https://lunarcrush.com/' },
            { name: 'Santiment', url: 'https://app.santiment.net/' },
            { name: 'The TIE', url: 'https://www.thetie.io/' },
          ]
        };
      case 'volatility':
        return {
          title: 'Volatility Index',
          description: 'Measures the average price movement magnitude across top cryptocurrencies. High volatility indicates larger price swings and trading opportunities.',
          currentValue: volatilityIndex,
          historicalComparison: volatilityIndex > 60 ? 'High volatility - increased risk and opportunity' : volatilityIndex < 30 ? 'Low volatility - consolidation phase' : 'Normal market conditions',
          implications: [
            'High volatility requires tighter risk management',
            'Low volatility often precedes breakouts',
            'Consider position sizing based on volatility',
            'Options premiums increase with volatility',
            'Scalping more viable in high volatility'
          ],
          relatedLinks: [
            { name: 'Deribit BTC Vol', url: 'https://www.deribit.com/statistics/BTC/volatility-term-structure' },
            { name: 'CryptoVolatilityIndex', url: 'https://cvi.finance/' },
            { name: 'Skew Analytics', url: 'https://www.skew.com/' },
          ]
        };
      case 'whale':
        return {
          title: 'Whale Activity Index',
          description: 'Tracks large transactions and wallet movements. High activity suggests smart money is positioning, which often precedes significant price moves.',
          currentValue: whaleActivity,
          historicalComparison: whaleActivity > 70 ? 'Very high whale activity - major moves possible' : whaleActivity < 40 ? 'Quiet period - whales inactive' : 'Normal whale activity',
          implications: [
            'Whale accumulation often signals bullish moves',
            'Large exchange inflows may precede selling',
            'Track wallet clusters for entity behavior',
            'Monitor exchange whale ratios',
            'Watch for unusual transfer patterns'
          ],
          relatedLinks: [
            { name: 'Whale Alert', url: 'https://whale-alert.io/' },
            { name: 'WhaleMap', url: 'https://whalemap.io/' },
            { name: 'Nansen', url: 'https://www.nansen.ai/' },
            { name: 'Arkham Intelligence', url: 'https://platform.arkhamintelligence.com/' },
          ]
        };
      default:
        return {
          title: '',
          description: '',
          currentValue: 0,
          historicalComparison: '',
          implications: [],
          relatedLinks: []
        };
    }
  };

  const selectedDetails = selectedMetric ? getMetricDetails(selectedMetric) : null;

  return (
    <>
      {/* Main Sentiment Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Fear & Greed */}
        <button 
          onClick={() => setSelectedMetric('fear-greed')}
          className="holo-card p-4 md:p-6 text-center hover:border-primary/50 transition-all group cursor-pointer"
        >
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
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Info className="w-3 h-3" /> Click for details
          </div>
        </button>

        {/* Social Sentiment */}
        <button 
          onClick={() => setSelectedMetric('social')}
          className="holo-card p-4 md:p-6 text-center hover:border-primary/50 transition-all group cursor-pointer"
        >
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
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Info className="w-3 h-3" /> Click for details
          </div>
        </button>

        {/* Volatility */}
        <button 
          onClick={() => setSelectedMetric('volatility')}
          className="holo-card p-4 md:p-6 text-center hover:border-primary/50 transition-all group cursor-pointer"
        >
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
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Info className="w-3 h-3" /> Click for details
          </div>
        </button>

        {/* Whale Activity */}
        <button 
          onClick={() => setSelectedMetric('whale')}
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
            View Whale Tracker <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* Market Momentum Bar */}
      <div className="holo-card p-4 md:p-6 mb-6">
        <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          MARKET MOMENTUM
          <span className="ml-auto text-xs text-muted-foreground">Based on {totalCoins} coins</span>
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <span className="text-success font-bold">{bullishCount} Bullish</span>
            <span className="text-xs text-muted-foreground">({((bullishCount / totalCoins) * 100).toFixed(0)}%)</span>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full font-display font-bold text-sm",
            marketMomentum === "BULLISH" ? "bg-success/20 text-success" : 
            marketMomentum === "BEARISH" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
          )}>
            {marketMomentum}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">({((bearishCount / totalCoins) * 100).toFixed(0)}%)</span>
            <span className="text-danger font-bold">{bearishCount} Bearish</span>
            <TrendingDown className="w-5 h-5 text-danger" />
          </div>
        </div>
        <div className="h-4 rounded-full overflow-hidden flex bg-muted">
          <div className="bg-success transition-all" style={{ width: `${(bullishCount / totalCoins) * 100}%` }} />
          <div className="bg-warning transition-all" style={{ width: `${((totalCoins - bullishCount - bearishCount) / totalCoins) * 100}%` }} />
          <div className="bg-danger transition-all" style={{ width: `${(bearishCount / totalCoins) * 100}%` }} />
        </div>
        
        {/* Additional Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg 24h Change</div>
            <div className={cn("font-bold", avgChange >= 0 ? "text-success" : "text-danger")}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total Volume</div>
            <div className="font-bold">${(totalVolume / 1e9).toFixed(1)}B</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Neutral</div>
            <div className="font-bold text-warning">{totalCoins - bullishCount - bearishCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Bull/Bear Ratio</div>
            <div className={cn("font-bold", bullishCount >= bearishCount ? "text-success" : "text-danger")}>
              {bearishCount > 0 ? (bullishCount / bearishCount).toFixed(2) : bullishCount}:1
            </div>
          </div>
        </div>
      </div>

      {/* Metric Detail Modal */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedMetric === 'fear-greed' && <Brain className="w-6 h-6 text-primary" />}
                  {selectedMetric === 'social' && <Users className="w-6 h-6 text-primary" />}
                  {selectedMetric === 'volatility' && <Zap className="w-6 h-6 text-warning" />}
                  {selectedMetric === 'whale' && <Waves className="w-6 h-6 text-primary" />}
                  {selectedDetails.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Current Reading */}
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <div className={cn(
                    "text-5xl font-display font-bold mb-2",
                    getSentimentColor(selectedDetails.currentValue)
                  )}>
                    {selectedDetails.currentValue}
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedDetails.historicalComparison}</div>
                </div>

                {/* Description */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    What It Measures
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedDetails.description}</p>
                </div>

                {/* Implications */}
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Key Implications
                  </h4>
                  <ul className="space-y-2">
                    {selectedDetails.implications.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* External Links */}
                <div>
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    Explore More Data
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDetails.relatedLinks.map(link => (
                      <Button
                        key={link.name}
                        variant="outline"
                        className="justify-start gap-2 h-10"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <Globe className="w-4 h-4 text-primary" />
                        {link.name}
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedMetric === 'whale' && (
                  <Button onClick={onWhaleClick} className="w-full gap-2">
                    <Waves className="w-4 h-4" />
                    View Full Whale Tracker
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
