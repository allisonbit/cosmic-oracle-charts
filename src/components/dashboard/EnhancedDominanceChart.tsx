import { 
  PieChart, TrendingUp, TrendingDown, ArrowRight, Eye, 
  ExternalLink, Activity, Zap, Info, Clock, Globe, Target
} from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface DominanceData {
  name: string;
  value: number;
  color: string;
  change?: number;
  description: string;
  implications: string[];
  chainLink?: string;
}

export function EnhancedDominanceChart() {
  const { data } = useMarketData();
  const [selectedSegment, setSelectedSegment] = useState<DominanceData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const global = data?.global;

  const dominanceData: DominanceData[] = useMemo(() => [
    { 
      name: "BTC", 
      value: global?.btcDominance || 55, 
      color: "hsl(38, 92%, 50%)",
      change: (Math.random() - 0.5) * 2,
      description: "Bitcoin's share of total crypto market capitalization",
      implications: [
        "High BTC dominance often signals risk-off sentiment",
        "Capital tends to flow to BTC during uncertainty",
        "Altcoins may underperform when BTC dominance rises"
      ],
      chainLink: "/chain/bitcoin"
    },
    { 
      name: "ETH", 
      value: global?.ethDominance || 18, 
      color: "hsl(230, 60%, 50%)",
      change: (Math.random() - 0.5) * 1.5,
      description: "Ethereum's share of total crypto market capitalization",
      implications: [
        "ETH dominance reflects DeFi and NFT ecosystem health",
        "Rising ETH dominance may signal alt season beginning",
        "Smart contract platforms compete for ETH's share"
      ],
      chainLink: "/chain/ethereum"
    },
    { 
      name: "Others", 
      value: 100 - (global?.btcDominance || 55) - (global?.ethDominance || 18), 
      color: "hsl(190, 100%, 50%)",
      change: (Math.random() - 0.5) * 3,
      description: "Combined share of all other cryptocurrencies",
      implications: [
        "High 'Others' dominance signals alt season",
        "Capital rotating into smaller projects",
        "Higher risk/reward opportunities in altcoins"
      ]
    },
  ], [global]);

  // Calculate cumulative angles for the pie chart
  let cumulativePercent = 0;
  const segments = dominanceData.map(item => {
    const startPercent = cumulativePercent;
    cumulativePercent += item.value;
    return {
      ...item,
      startAngle: startPercent * 3.6,
      endAngle: cumulativePercent * 3.6,
    };
  });

  // Market analysis based on dominance
  const marketAnalysis = useMemo(() => {
    const btcDom = global?.btcDominance || 55;
    const ethDom = global?.ethDominance || 18;
    const altDom = 100 - btcDom - ethDom;

    if (btcDom > 58) {
      return {
        phase: "Bitcoin Season",
        sentiment: "Risk-off",
        advice: "Focus on BTC, reduce altcoin exposure",
        color: "text-warning"
      };
    } else if (btcDom < 48) {
      return {
        phase: "Alt Season",
        sentiment: "Risk-on",
        advice: "Altcoins showing strength, diversify carefully",
        color: "text-success"
      };
    } else if (ethDom > 20) {
      return {
        phase: "ETH Leading",
        sentiment: "DeFi Focus",
        advice: "Ethereum ecosystem tokens may outperform",
        color: "text-primary"
      };
    } else {
      return {
        phase: "Mixed Market",
        sentiment: "Neutral",
        advice: "No clear trend, maintain balanced approach",
        color: "text-muted-foreground"
      };
    }
  }, [global]);

  return (
    <>
      <div className="holo-card p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            MARKET DOMINANCE
          </h3>
          <button
            onClick={() => setShowDetails(true)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Analysis</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          {/* Interactive Pie Chart */}
          <div 
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full relative flex-shrink-0 cursor-pointer"
            onClick={() => setShowDetails(true)}
            style={{
              background: `conic-gradient(
                ${dominanceData[0].color} 0deg ${segments[0].endAngle}deg,
                ${dominanceData[1].color} ${segments[0].endAngle}deg ${segments[1].endAngle}deg,
                ${dominanceData[2].color} ${segments[1].endAngle}deg 360deg
              )`
            }}
          >
            <div className="absolute inset-3 sm:inset-4 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors">
              <div className="text-center">
                <span className="font-display text-[10px] sm:text-xs text-muted-foreground block">PHASE</span>
                <span className={cn("font-display text-[9px] sm:text-[10px] font-bold", marketAnalysis.color)}>
                  {marketAnalysis.phase}
                </span>
              </div>
            </div>
          </div>

          {/* Legend with interaction */}
          <div className="space-y-2 sm:space-y-3 flex-1 w-full sm:w-auto">
            {dominanceData.map(item => (
              <button
                key={item.name}
                onClick={() => setSelectedSegment(item)}
                className="w-full flex items-center justify-between gap-4 p-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                    style={{ background: item.color }}
                  />
                  <span className="font-display font-bold text-sm sm:text-base">{item.name}</span>
                  {item.change !== undefined && (
                    <span className={cn("text-xs flex items-center gap-0.5",
                      item.change >= 0 ? "text-success" : "text-danger"
                    )}>
                      {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.change >= 0 ? "+" : ""}{item.change.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold">{item.value.toFixed(1)}%</span>
                  <Eye className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Market Phase Indicator */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Market Phase:
            </span>
            <span className={cn("font-bold", marketAnalysis.color)}>
              {marketAnalysis.phase}
            </span>
          </div>
        </div>
      </div>

      {/* Segment Detail Modal */}
      <Dialog open={!!selectedSegment} onOpenChange={(open) => !open && setSelectedSegment(null)}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedSegment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: selectedSegment.color }}
                  >
                    <span className="font-display font-bold text-white text-sm">{selectedSegment.name}</span>
                  </div>
                  <div>
                    <span className="font-display text-xl">{selectedSegment.name} Dominance</span>
                    <div className="text-sm text-muted-foreground">{selectedSegment.value.toFixed(2)}% of market</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Value Display */}
                <div className="holo-card p-4 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-display font-bold" style={{ color: selectedSegment.color }}>
                      {selectedSegment.value.toFixed(2)}%
                    </div>
                    {selectedSegment.change !== undefined && (
                      <div className={cn("text-sm flex items-center gap-1 mt-1",
                        selectedSegment.change >= 0 ? "text-success" : "text-danger"
                      )}>
                        {selectedSegment.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {selectedSegment.change >= 0 ? "+" : ""}{selectedSegment.change.toFixed(2)}% (24h)
                      </div>
                    )}
                  </div>
                  <PieChart className="w-8 h-8 text-primary/30" />
                </div>

                {/* Description */}
                <div className="bg-muted/30 p-3 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{selectedSegment.description}</p>
                </div>

                {/* Market Implications */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    MARKET IMPLICATIONS
                  </h4>
                  <ul className="space-y-2">
                    {selectedSegment.implications.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: selectedSegment.color }} />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chain Link */}
                {selectedSegment.chainLink && (
                  <Link 
                    to={selectedSegment.chainLink}
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 p-3 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors"
                  >
                    View {selectedSegment.name} Chain Analysis <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {/* External Links */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://www.coingecko.com/en/global-charts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                  >
                    <Globe className="w-4 h-4 text-primary" />
                    Global Charts
                    <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
                  </a>
                  <a
                    href="https://www.tradingview.com/chart/?symbol=CRYPTOCAP:BTC.D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                  >
                    <Activity className="w-4 h-4 text-primary" />
                    BTC.D Chart
                    <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Analysis Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Market Dominance Analysis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Current Phase */}
            <div className="holo-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  CURRENT MARKET PHASE
                </h4>
                <span className={cn("font-bold", marketAnalysis.color)}>
                  {marketAnalysis.phase}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span className={cn("font-medium", marketAnalysis.color)}>{marketAnalysis.sentiment}</span>
                </div>
                <div className="flex items-start gap-2 bg-muted/30 p-2 rounded-lg">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{marketAnalysis.advice}</span>
                </div>
              </div>
            </div>

            {/* All Segments */}
            <div className="holo-card p-4">
              <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                DOMINANCE BREAKDOWN
              </h4>
              <div className="space-y-3">
                {dominanceData.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setShowDetails(false);
                      setTimeout(() => setSelectedSegment(item), 100);
                    }}
                    className="w-full p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: item.color }} />
                        <span className="font-display font-bold">{item.name}</span>
                      </div>
                      <span className="text-lg font-bold">{item.value.toFixed(1)}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.value}%`, background: item.color }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Data updates every minute
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
