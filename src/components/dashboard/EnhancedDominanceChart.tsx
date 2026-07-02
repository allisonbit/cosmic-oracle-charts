import {
  PieChart, TrendingUp, TrendingDown, Activity
} from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { useState, useMemo } from "react";
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
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const global = data?.global;

  const dominanceData: DominanceData[] = useMemo(() => [
    {
      name: "BTC", value: global?.btcDominance || 55, color: "hsl(38, 92%, 50%)",
      description: "Bitcoin's share of total crypto market capitalization",
      implications: ["High BTC dominance often signals risk-off sentiment", "Capital tends to flow to BTC during uncertainty", "Altcoins may underperform when BTC dominance rises"],
      chainLink: "/chain/bitcoin"
    },
    {
      name: "ETH", value: global?.ethDominance || 18, color: "hsl(230, 60%, 50%)",
      description: "Ethereum's share of total crypto market capitalization",
      implications: ["ETH dominance reflects DeFi and NFT ecosystem health", "Rising ETH dominance may signal alt season beginning"],
      chainLink: "/chain/ethereum"
    },
    {
      name: "Others", value: 100 - (global?.btcDominance || 55) - (global?.ethDominance || 18), color: "hsl(190, 100%, 50%)",
      description: "Combined share of all other cryptocurrencies",
      implications: ["High 'Others' dominance signals alt season", "Capital rotating into smaller projects"]
    },
  ], [global]);

  let cumulativePercent = 0;
  const segments = dominanceData.map(item => {
    const startPercent = cumulativePercent;
    cumulativePercent += item.value;
    return { ...item, startAngle: startPercent * 3.6, endAngle: cumulativePercent * 3.6 };
  });

  const marketAnalysis = useMemo(() => {
    const btcDom = global?.btcDominance || 55;
    if (btcDom > 58) return { phase: "Bitcoin Season", color: "text-warning" };
    if (btcDom < 48) return { phase: "Alt Season", color: "text-success" };
    return { phase: "Mixed Market", color: "text-muted-foreground" };
  }, [global]);

  return (
    <div className="border-t border-border/30 pt-5 pb-5">
      <div className="section-header mb-2">
        <span className="section-label flex items-center gap-1.5">
          <PieChart className="w-3 h-3 text-primary" />
          Market Dominance
        </span>
        <span className={cn("text-xs font-bold", marketAnalysis.color)}>{marketAnalysis.phase}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 mt-4">
        {/* Conic pie chart — keep as-is, it's a visualization not chrome */}
        <div
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full relative flex-shrink-0"
          style={{
            background: `conic-gradient(
              ${dominanceData[0].color} 0deg ${segments[0].endAngle}deg,
              ${dominanceData[1].color} ${segments[0].endAngle}deg ${segments[1].endAngle}deg,
              ${dominanceData[2].color} ${segments[1].endAngle}deg 360deg
            )`
          }}
        >
          <div className="absolute inset-3 sm:inset-4 rounded-full bg-card flex items-center justify-center">
            <div className="text-center">
              <span className="font-display text-[10px] sm:text-xs text-muted-foreground block">PHASE</span>
              <span className={cn("font-display text-[9px] sm:text-[10px] font-bold", marketAnalysis.color)}>
                {marketAnalysis.phase.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Dominance list — editorial rows */}
        <div className="flex-1 w-full">
          {dominanceData.map(item => (
            <div key={item.name}>
              <button
                onClick={() => setExpandedSegment(expandedSegment === item.name ? null : item.name)}
                className="w-full editorial-row items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="font-display font-bold text-sm">{item.name}</span>
                  {item.change !== undefined && (
                    <span className={cn("text-xs flex items-center gap-0.5", item.change >= 0 ? "text-success" : "text-danger")}>
                      {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.change >= 0 ? "+" : ""}{(item.change ?? 0).toFixed(1)}%
                    </span>
                  )}
                </div>
                <span className="text-base font-bold">{(item.value ?? 0).toFixed(1)}%</span>
              </button>

              {expandedSegment === item.name && (
                <div className="ml-5 pb-3 border-l-2 pl-3 animate-in fade-in slide-in-from-top-1 duration-150" style={{ borderColor: item.color }}>
                  <p className="text-xs text-muted-foreground mb-1.5">{item.description}</p>
                  <ul className="space-y-1 mb-2">
                    {item.implications.map((imp, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                        {imp}
                      </li>
                    ))}
                  </ul>
                  {item.chainLink && (
                    <Link to={item.chainLink} className="text-xs text-primary hover:underline flex items-center gap-1">
                      View {item.name} Analysis →
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" /> Market Phase
        </span>
        <span className={cn("font-bold", marketAnalysis.color)}>{marketAnalysis.phase}</span>
      </div>
    </div>
  );
}
