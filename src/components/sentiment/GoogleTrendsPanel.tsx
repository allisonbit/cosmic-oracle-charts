import { Search, TrendingUp, TrendingDown, Globe, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface TrendData {
  keyword: string;
  score: number;
  change: number;
  region: string;
}

const mockTrends: TrendData[] = [
  { keyword: "Bitcoin price", score: 92, change: 15, region: "Global" },
  { keyword: "Ethereum upgrade", score: 78, change: 28, region: "Global" },
  { keyword: "Crypto news", score: 71, change: 5, region: "US" },
  { keyword: "Solana", score: 68, change: 42, region: "Global" },
  { keyword: "NFT", score: 45, change: -12, region: "Global" },
  { keyword: "DeFi yield", score: 38, change: 8, region: "EU" },
  { keyword: "Meme coins", score: 55, change: 65, region: "Global" },
  { keyword: "Crypto wallet", score: 62, change: 3, region: "Asia" },
];

export function GoogleTrendsPanel() {
  return (
    <div className="holo-card p-6">
      <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        GOOGLE TRENDS
      </h3>

      <div className="space-y-4">
        {mockTrends.map((trend, i) => (
          <div key={trend.keyword} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                <span className="font-medium text-sm">{trend.keyword}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  {trend.region}
                </div>
                <span className={cn(
                  "text-xs font-bold flex items-center gap-1",
                  trend.change >= 0 ? "text-success" : "text-danger"
                )}>
                  {trend.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trend.change >= 0 ? "+" : ""}{trend.change}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={trend.score} className="flex-1 h-2" />
              <span className="text-xs font-bold text-primary w-8">{trend.score}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs font-display text-muted-foreground">TREND SUMMARY</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Crypto search interest is <span className="text-success font-medium">up 18%</span> this week. 
          "Solana" and "Meme coins" showing strongest growth in search volume.
        </p>
      </div>
    </div>
  );
}
