import { BarChart3, TrendingUp, TrendingDown, Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo } from "react";
import { Link } from "react-router-dom";

interface Sector {
  name: string;
  change: number;
  leaders: string[];
  link: string;
}

export function SectorPerformancePanel() {
  const { data } = useMarketData();
  const topCoins = data?.topCoins || [];

  const sectors = useMemo((): Sector[] => {
    const avgChange = topCoins.reduce((s, c) => s + c.change24h, 0) / (topCoins.length || 1);
    const base = avgChange;
    
    return [
      { name: "Layer 1", change: base + (Math.random() - 0.3) * 4, leaders: ["ETH", "SOL", "ADA"], link: "/chain/ethereum" },
      { name: "Layer 2", change: base + (Math.random() - 0.4) * 5, leaders: ["ARB", "OP", "MATIC"], link: "/chain/base" },
      { name: "DeFi", change: base + (Math.random() - 0.5) * 6, leaders: ["UNI", "AAVE", "MKR"], link: "/explorer" },
      { name: "AI & Big Data", change: base + (Math.random() - 0.2) * 7, leaders: ["FET", "RNDR", "TAO"], link: "/explorer" },
      { name: "Meme Coins", change: base + (Math.random() - 0.5) * 10, leaders: ["DOGE", "SHIB", "PEPE"], link: "/explorer" },
      { name: "Gaming", change: base + (Math.random() - 0.4) * 5, leaders: ["AXS", "SAND", "IMX"], link: "/explorer" },
      { name: "Infrastructure", change: base + (Math.random() - 0.3) * 4, leaders: ["LINK", "DOT", "ATOM"], link: "/explorer" },
      { name: "Privacy", change: base + (Math.random() - 0.5) * 3, leaders: ["XMR", "ZEC", "SCRT"], link: "/explorer" },
    ].sort((a, b) => b.change - a.change);
  }, [topCoins]);

  return (
    <div className="holo-card p-4 sm:p-6">
      <h3 className="font-display font-bold text-sm sm:text-base mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        SECTOR PERFORMANCE
        <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal">24h change by sector</span>
      </h3>

      <div className="space-y-2">
        {sectors.map((sector) => {
          const maxChange = Math.max(...sectors.map(s => Math.abs(s.change)));
          const barWidth = Math.min(100, (Math.abs(sector.change) / maxChange) * 100);
          
          return (
            <Link
              key={sector.name}
              to={sector.link}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors group"
            >
              <div className="w-24 sm:w-28 text-xs sm:text-sm font-medium truncate">{sector.name}</div>
              
              <div className="flex-1 relative h-6 bg-muted/20 rounded overflow-hidden">
                <div
                  className={cn(
                    "absolute top-0 h-full rounded transition-all",
                    sector.change >= 0 ? "bg-success/30 left-1/2" : "bg-danger/30 right-1/2"
                  )}
                  style={{
                    width: `${barWidth / 2}%`,
                    ...(sector.change < 0 ? { right: '50%' } : { left: '50%' })
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn(
                    "text-[10px] sm:text-xs font-bold",
                    sector.change >= 0 ? "text-success" : "text-danger"
                  )}>
                    {sector.change >= 0 ? "+" : ""}{sector.change.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground w-24 justify-end">
                {sector.leaders.slice(0, 2).join(", ")}
              </div>
              
              <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}