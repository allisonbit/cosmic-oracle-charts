import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Target, Flame, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d?: number;
  volume: number;
  marketCap: number;
  rank?: number;
  image?: string;
  sentiment?: "bullish" | "bearish" | "neutral";
  signalType?: string;
  signalMessage?: string;
}

interface CoinDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coin: CoinData | null;
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

export function CoinDetailModal({ open, onOpenChange, coin }: CoinDetailModalProps) {
  if (!coin) return null;

  const isPositive = coin.change24h >= 0;
  const volatility = Math.abs(coin.change24h);
  const riskLevel = volatility > 10 ? "High" : volatility > 5 ? "Medium" : "Low";
  const volumeToMcap = (coin.volume / coin.marketCap) * 100;

  const getInsight = () => {
    if (coin.change24h > 10) return "Strong bullish momentum. Consider partial profit-taking if already in position.";
    if (coin.change24h > 5) return "Positive trend forming. Monitor for continuation or resistance levels.";
    if (coin.change24h > 0) return "Mild bullish sentiment. Wait for confirmation before entering.";
    if (coin.change24h > -5) return "Minor selling pressure. Could be accumulation opportunity.";
    if (coin.change24h > -10) return "Bearish momentum building. Consider tightening stop-losses.";
    return "Sharp decline detected. High risk - wait for stabilization.";
  };

  const getSupportResistance = () => {
    const support = coin.price * 0.95;
    const resistance = coin.price * 1.08;
    return { support, resistance };
  };

  const { support, resistance } = getSupportResistance();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {coin.image && (
              <img src={coin.image} alt={coin.symbol} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display">{coin.symbol}</span>
                {coin.rank && coin.rank <= 100 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">#{coin.rank}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">{coin.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Price & Change */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-3xl font-bold text-foreground">
                ${coin.price.toLocaleString(undefined, { maximumFractionDigits: coin.price < 1 ? 6 : 2 })}
              </p>
            </div>
            <div className="text-right">
              <div className={cn(
                "flex items-center gap-1 text-lg font-semibold",
                isPositive ? "text-success" : "text-danger"
              )}>
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {isPositive ? "+" : ""}{coin.change24h.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">24h change</p>
            </div>
          </div>

          {/* Signal Box */}
          {coin.signalType && (
            <div className={cn(
              "p-4 rounded-xl border",
              coin.signalType === "pump" || coin.signalType === "bullish" 
                ? "bg-success/10 border-success/30" 
                : coin.signalType === "dump" || coin.signalType === "bearish"
                ? "bg-danger/10 border-danger/30"
                : "bg-warning/10 border-warning/30"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {coin.signalType === "pump" && <Flame className="w-4 h-4 text-success" />}
                <span className="font-display font-bold text-sm uppercase">{coin.signalType} Signal</span>
              </div>
              <p className="text-sm text-muted-foreground">{coin.signalMessage}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Volume 24h</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{formatLargeNumber(coin.volume)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Market Cap</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{formatLargeNumber(coin.marketCap)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-xs">Vol/MCap</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{volumeToMcap.toFixed(2)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs">Risk Level</span>
              </div>
              <p className={cn(
                "text-lg font-semibold",
                riskLevel === "High" ? "text-danger" : riskLevel === "Medium" ? "text-warning" : "text-success"
              )}>
                {riskLevel}
              </p>
            </div>
          </div>

          {/* Support/Resistance */}
          <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
            <h4 className="text-sm font-medium text-foreground mb-3">Key Levels (Estimated)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Support</p>
                <p className="text-lg font-bold text-success">
                  ${support.toLocaleString(undefined, { maximumFractionDigits: support < 1 ? 6 : 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Resistance</p>
                <p className="text-lg font-bold text-danger">
                  ${resistance.toLocaleString(undefined, { maximumFractionDigits: resistance < 1 ? 6 : 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-sm text-primary">AI INSIGHT</span>
            </div>
            <p className="text-sm text-foreground">{getInsight()}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={`https://www.coingecko.com/en/coins/${coin.name.toLowerCase().replace(/\s+/g, '-')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              View Details
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}