import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/hooks/useStrengthMeter";

interface DivergenceWatchlistProps {
  assets: StrengthData[];
}

interface DivergenceSignal {
  asset: StrengthData;
  type: 'bullish' | 'bearish';
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
  priceAction: string;
  strengthAction: string;
}

export function DivergenceWatchlist({ assets }: DivergenceWatchlistProps) {
  const divergences = useMemo<DivergenceSignal[]>(() => {
    return assets.map(asset => {
      // Calculate divergence between price action and strength
      const priceDown = asset.priceChange24h < -2;
      const priceUp = asset.priceChange24h > 2;
      const strengthHigh = asset.strengthScore >= 55;
      const strengthLow = asset.strengthScore < 45;
      const sentimentHigh = (asset.sentimentScore || 50) >= 55;
      const sentimentLow = (asset.sentimentScore || 50) < 45;

      // Bullish divergence: Price falling but strength/sentiment rising
      if (priceDown && (strengthHigh || sentimentHigh)) {
        const magnitude = Math.abs(asset.priceChange24h) + (asset.strengthScore - 50);
        return {
          asset,
          type: 'bullish' as const,
          strength: magnitude > 15 ? 'strong' : magnitude > 8 ? 'moderate' : 'weak',
          description: 'Price weakness not confirmed by fundamentals',
          priceAction: `${asset.priceChange24h.toFixed(2)}%`,
          strengthAction: `Strength: ${asset.strengthScore}`,
        };
      }

      // Bearish divergence: Price rising but strength/sentiment falling
      if (priceUp && (strengthLow || sentimentLow)) {
        const magnitude = asset.priceChange24h + (50 - asset.strengthScore);
        return {
          asset,
          type: 'bearish' as const,
          strength: magnitude > 15 ? 'strong' : magnitude > 8 ? 'moderate' : 'weak',
          description: 'Price rally not supported by fundamentals',
          priceAction: `+${asset.priceChange24h.toFixed(2)}%`,
          strengthAction: `Strength: ${asset.strengthScore}`,
        };
      }

      return null;
    }).filter((d): d is DivergenceSignal => d !== null)
      .sort((a, b) => {
        const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
        return strengthOrder[b.strength] - strengthOrder[a.strength];
      })
      .slice(0, 6);
  }, [assets]);

  if (divergences.length === 0) {
    return (
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Divergence Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No significant divergences detected. Market price and strength are aligned.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Divergence Watchlist
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Divergences occur when price action doesn't match underlying strength metrics. Bullish divergence (price falls, strength rises) can signal buying opportunities. Bearish divergence (price rises, strength falls) may indicate caution.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          Contrarian signals where price and strength diverge
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {divergences.map((divergence) => (
            <Link 
              key={divergence.asset.id}
              to={`/price-prediction/${divergence.asset.id}/daily`}
              className="block"
            >
              <div className={cn(
                "p-3 rounded-lg border transition-all hover:scale-[1.01]",
                divergence.type === 'bullish' 
                  ? "bg-success/10 border-success/30 hover:border-success/50" 
                  : "bg-danger/10 border-danger/30 hover:border-danger/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={divergence.asset.logo} 
                      alt={divergence.asset.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{divergence.asset.symbol}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            divergence.type === 'bullish' ? "border-success text-success" : "border-danger text-danger"
                          )}
                        >
                          {divergence.type === 'bullish' ? (
                            <><ArrowUpRight className="w-3 h-3 mr-1" /> Bullish</>
                          ) : (
                            <><ArrowDownRight className="w-3 h-3 mr-1" /> Bearish</>
                          )}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {divergence.strength}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {divergence.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "text-xs",
                        divergence.asset.priceChange24h >= 0 ? "text-success" : "text-danger"
                      )}>
                        {divergence.priceAction}
                      </div>
                      <span className="text-muted-foreground text-xs">vs</span>
                      <div className={cn(
                        "text-xs",
                        divergence.asset.strengthScore >= 55 ? "text-success" : divergence.asset.strengthScore >= 45 ? "text-warning" : "text-danger"
                      )}>
                        {divergence.strengthAction}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
