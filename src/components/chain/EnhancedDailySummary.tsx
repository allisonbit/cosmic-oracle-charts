import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { ChainForecast } from "@/hooks/useChainForecast";
import { Sparkles, Quote, ExternalLink, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Activity, Clock, RefreshCw, Info, BarChart3, Target, Zap, Brain, MessageCircle, Newspaper, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface EnhancedDailySummaryProps {
  chain: ChainConfig;
  forecast: ChainForecast | undefined;
  isLoading: boolean;
  onRefresh?: () => void;
}

interface SummaryModalData {
  type: 'insights' | 'signals' | 'methodology' | 'history';
  title: string;
  data: any;
}

export function EnhancedDailySummary({ chain, forecast, isLoading, onRefresh }: EnhancedDailySummaryProps) {
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<SummaryModalData | null>(null);

  const getMarketSignal = () => {
    if (!forecast?.dailySummary) return null;
    const summary = forecast.dailySummary.toLowerCase();
    if (summary.includes('bullish') || summary.includes('upward') || summary.includes('positive')) {
      return { signal: 'Bullish', color: 'text-success', bgColor: 'bg-success/20', icon: TrendingUp, score: 75 + Math.random() * 20 };
    }
    if (summary.includes('bearish') || summary.includes('downward') || summary.includes('negative')) {
      return { signal: 'Bearish', color: 'text-danger', bgColor: 'bg-danger/20', icon: TrendingDown, score: 20 + Math.random() * 25 };
    }
    return { signal: 'Neutral', color: 'text-warning', bgColor: 'bg-warning/20', icon: Activity, score: 45 + Math.random() * 15 };
  };

  const marketSignal = getMarketSignal();

  const openDetailModal = (type: SummaryModalData['type'], title: string, data: any) => {
    setModalData({ type, title, data });
    setModalOpen(true);
  };

  // Mock key metrics
  const keyMetrics = {
    confidence: Math.floor(75 + Math.random() * 20),
    dataPoints: Math.floor(1000 + Math.random() * 500),
    sentiment: marketSignal?.score || 50,
    volatility: Math.floor(20 + Math.random() * 40),
  };

  // Mock signals
  const tradingSignals = [
    { signal: "Support Level", value: `$${(Math.random() * 1000 + 2000).toFixed(0)}`, type: "support", strength: 75 },
    { signal: "Resistance Level", value: `$${(Math.random() * 1000 + 3000).toFixed(0)}`, type: "resistance", strength: 82 },
    { signal: "RSI", value: Math.floor(30 + Math.random() * 40).toString(), type: "indicator", strength: 65 },
    { signal: "MACD", value: "Bullish Cross", type: "indicator", strength: 78 },
  ];

  // Mock news headlines
  const newsHeadlines = [
    { title: `${chain.name} sees increased institutional interest`, sentiment: "positive", time: "2h ago" },
    { title: `Network activity hits new weekly high`, sentiment: "positive", time: "5h ago" },
    { title: `Major upgrade announcement expected soon`, sentiment: "neutral", time: "8h ago" },
  ];

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: `linear-gradient(135deg, hsl(${chain.color} / 0.15), hsl(var(--card)), hsl(var(--secondary) / 0.1))`,
          border: `1px solid hsl(${chain.color} / 0.3)`,
        }}
      >
        {/* Decorative elements */}
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, hsl(${chain.color} / 0.4), transparent 70%)` }}
        />
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 pointer-events-none bg-gradient-to-tr from-secondary to-transparent rounded-full" />

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${chain.color} / 0.3), hsl(${chain.color} / 0.1))`,
                  boxShadow: `0 0 30px hsl(${chain.color} / 0.3)`,
                }}
              >
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-display text-foreground glow-text">Enhanced Daily AI Summary</h3>
                <p className="text-sm text-muted-foreground">Cosmic Oracle Analysis for {chain.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {marketSignal && (
                <button
                  onClick={() => openDetailModal('signals', 'Market Signal Analysis', { signal: marketSignal, metrics: keyMetrics })}
                  className={cn("px-4 py-2 rounded-lg flex items-center gap-2 transition-colors", marketSignal.bgColor, `hover:${marketSignal.bgColor}`)}
                >
                  <marketSignal.icon className={cn("h-4 w-4", marketSignal.color)} />
                  <span className={cn("text-sm font-medium", marketSignal.color)}>{marketSignal.signal}</span>
                  <span className={cn("text-xs", marketSignal.color)}>({marketSignal.score.toFixed(0)}%)</span>
                </button>
              )}
              <button onClick={() => openDetailModal('methodology', 'AI Methodology', {})} className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => openDetailModal('insights', 'Confidence Score', keyMetrics)}
              className="p-3 rounded-xl bg-background/40 hover:bg-background/60 transition-all border border-border/30 text-center"
            >
              <Target className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-lg font-display text-foreground">{keyMetrics.confidence}%</p>
            </button>
            <button
              onClick={() => openDetailModal('insights', 'Data Points', keyMetrics)}
              className="p-3 rounded-xl bg-background/40 hover:bg-background/60 transition-all border border-border/30 text-center"
            >
              <BarChart3 className="h-5 w-5 mx-auto text-secondary mb-1" />
              <p className="text-xs text-muted-foreground">Data Points</p>
              <p className="text-lg font-display text-foreground">{keyMetrics.dataPoints}</p>
            </button>
            <button
              onClick={() => openDetailModal('insights', 'Sentiment Score', keyMetrics)}
              className={cn("p-3 rounded-xl transition-all border text-center", keyMetrics.sentiment >= 50 ? "bg-success/10 border-success/30" : "bg-danger/10 border-danger/30")}
            >
              {keyMetrics.sentiment >= 50 ? <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" /> : <TrendingDown className="h-5 w-5 mx-auto text-danger mb-1" />}
              <p className="text-xs text-muted-foreground">Sentiment</p>
              <p className={cn("text-lg font-display", keyMetrics.sentiment >= 50 ? "text-success" : "text-danger")}>{keyMetrics.sentiment.toFixed(0)}%</p>
            </button>
            <button
              onClick={() => openDetailModal('insights', 'Volatility Index', keyMetrics)}
              className={cn("p-3 rounded-xl transition-all border text-center", keyMetrics.volatility < 30 ? "bg-success/10 border-success/30" : keyMetrics.volatility < 50 ? "bg-warning/10 border-warning/30" : "bg-danger/10 border-danger/30")}
            >
              <Zap className={cn("h-5 w-5 mx-auto mb-1", keyMetrics.volatility < 30 ? "text-success" : keyMetrics.volatility < 50 ? "text-warning" : "text-danger")} />
              <p className="text-xs text-muted-foreground">Volatility</p>
              <p className="text-lg font-display text-foreground">{keyMetrics.volatility}%</p>
            </button>
          </div>

          {/* Summary Content */}
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-muted/20 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted/20 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted/20 rounded animate-pulse w-4/5" />
            </div>
          ) : forecast?.dailySummary ? (
            <div className="relative p-4 rounded-xl bg-background/40 border border-border/30">
              <Quote className="absolute top-2 left-2 h-6 w-6 text-primary/20" />
              <p className="text-foreground leading-relaxed pl-6 pr-4 text-lg italic">
                {forecast.dailySummary}
              </p>
              <Quote className="absolute bottom-2 right-2 h-6 w-6 text-primary/20 rotate-180" />
            </div>
          ) : (
            <p className="text-muted-foreground italic p-4 rounded-xl bg-background/40 border border-border/30">
              Generating daily analysis...
            </p>
          )}

          {/* Tabs for Additional Info */}
          <Tabs defaultValue="signals" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signals">Trading Signals</TabsTrigger>
              <TabsTrigger value="news">Latest News</TabsTrigger>
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="signals" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {tradingSignals.map((signal, i) => (
                  <button
                    key={i}
                    onClick={() => openDetailModal('signals', signal.signal, signal)}
                    className="p-3 rounded-xl bg-background/40 hover:bg-background/60 transition-all border border-border/30 text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{signal.signal}</span>
                      <span className={cn("text-xs font-medium", signal.type === 'support' ? "text-success" : signal.type === 'resistance' ? "text-danger" : "text-primary")}>
                        {signal.strength}%
                      </span>
                    </div>
                    <p className="text-lg font-display text-foreground">{signal.value}</p>
                    <Progress value={signal.strength} className="h-1 mt-2" />
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="news" className="mt-4">
              <div className="space-y-3">
                {newsHeadlines.map((news, i) => (
                  <button
                    key={i}
                    onClick={() => openDetailModal('insights', news.title, news)}
                    className="w-full p-3 rounded-xl bg-background/40 hover:bg-background/60 transition-all border border-border/30 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Newspaper className={cn("h-5 w-5 mt-0.5", news.sentiment === 'positive' ? "text-success" : news.sentiment === 'negative' ? "text-danger" : "text-warning")} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{news.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{news.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <Collapsible open={insightsExpanded} onOpenChange={setInsightsExpanded}>
                <div className="p-4 rounded-xl border border-border/30 bg-background/50 space-y-4">
                  <CollapsibleTrigger className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Activity className="h-4 w-4" />
                      <span>Key Market Insights</span>
                    </div>
                    {insightsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground mb-1">Market Mood</p>
                      <p className={cn("text-lg font-display", marketSignal?.color || "text-foreground")}>
                        {marketSignal?.signal || "Analyzing..."}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground mb-1">AI Model</p>
                      <p className="text-lg font-display text-primary">GPT-4</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground mb-1">Analysis Time</p>
                      <p className="text-lg font-display text-foreground">~15s</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground mb-1">Sources</p>
                      <p className="text-lg font-display text-foreground">12+</p>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-2 pt-3">
                      <a href={`https://cryptopanic.com/news/${chain.symbol?.toLowerCase()}/`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Latest News
                      </a>
                      <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Fear & Greed
                      </a>
                      <a href={`https://www.tradingview.com/symbols/${chain.symbol}USD/`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> TradingView
                      </a>
                      <a href={`https://messari.io/asset/${chain.coingeckoId}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Messari
                      </a>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </TabsContent>
          </Tabs>

          {/* Timestamp */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <Clock className="h-3 w-3" />
              <span>Updated {new Date().toLocaleTimeString()}</span>
            </div>
            <a href={chain.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> {chain.name} Official
            </a>
          </div>
        </div>
      </div>

    </>
  );
}
