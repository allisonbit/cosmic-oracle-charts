import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Shield, AlertTriangle, ExternalLink, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface TokenModalData {
  symbol: string;
  name: string;
  price?: number;
  change24h?: number;
  change7d?: number;
  volume24h?: number;
  marketCap?: number;
  rank?: number;
  logo?: string;
  momentum?: number;
  volumeSpike?: number;
  volatility?: number;
  liquidityScore?: number;
  sparkline?: number[];
  riskLevel?: string;
  riskScore?: number;
  reasons?: string[];
  coingeckoId?: string;
}

interface TokenDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: TokenModalData | null;
}

export function TokenDetailModal({ open, onOpenChange, token }: TokenDetailModalProps) {
  if (!token) return null;

  const formatPrice = (price: number | undefined) => {
    if (!price) return "$0.00";
    const p = Number(price) || 0;
    if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.0001) return `$${p.toFixed(6)}`;
    return `$${p.toExponential(2)}`;
  };

  const formatLargeNumber = (num: number | undefined) => {
    if (!num) return "$0";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(0)}`;
  };

  const renderSparkline = () => {
    const sparkline = token.sparkline;
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const height = 80;
    const width = 280;
    const points = sparkline.map((val, i) => {
      const x = (i / (sparkline.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    const isUp = sparkline[sparkline.length - 1] > sparkline[0];
    
    return (
      <svg width={width} height={height} className="w-full">
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isUp ? 'hsl(var(--success))' : 'hsl(var(--danger))'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isUp ? 'hsl(var(--success))' : 'hsl(var(--danger))'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#sparklineGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke={isUp ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-danger";
      case "extreme": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {token.logo && (
              <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display">{token.symbol}</span>
                {token.rank && token.rank <= 100 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">#{token.rank}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">{token.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Section */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-3xl font-bold text-foreground">{formatPrice(token.price)}</p>
            </div>
            <div className="text-right">
              <div className={cn(
                "flex items-center gap-1 text-lg font-semibold",
                (token.change24h || 0) >= 0 ? "text-success" : "text-danger"
              )}>
                {(token.change24h || 0) >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {(token.change24h || 0) >= 0 ? "+" : ""}{(token.change24h || 0).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">24h change</p>
            </div>
          </div>

          {/* Chart */}
          <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
            <p className="text-xs text-muted-foreground mb-2">7 Day Price Chart</p>
            {renderSparkline()}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Volume 24h</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{formatLargeNumber(token.volume24h)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Market Cap</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{formatLargeNumber(token.marketCap)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">7D Change</span>
              </div>
              <p className={cn(
                "text-lg font-semibold",
                (token.change7d || 0) >= 0 ? "text-success" : "text-danger"
              )}>
                {(token.change7d || 0) >= 0 ? "+" : ""}{(token.change7d || 0).toFixed(2)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-xs">Volatility</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{(token.volatility || 50).toFixed(0)}%</p>
            </div>
          </div>

          {/* Momentum Indicators */}
          {(token.momentum !== undefined || token.volumeSpike !== undefined) && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Momentum Indicators</p>
              <div className="space-y-2">
                {token.momentum !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Momentum</span>
                      <span className="text-foreground">{token.momentum.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, token.momentum)}%` }} />
                    </div>
                  </div>
                )}
                {token.volumeSpike !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Volume Spike</span>
                      <span className="text-foreground">{token.volumeSpike.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${Math.min(100, token.volumeSpike)}%` }} />
                    </div>
                  </div>
                )}
                {token.liquidityScore !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Liquidity</span>
                      <span className="text-foreground">{token.liquidityScore.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${Math.min(100, token.liquidityScore)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Risk Analysis */}
          {token.riskLevel && (
            <div className="p-4 rounded-xl border border-border/30 bg-muted/10">
              <div className="flex items-center gap-2 mb-3">
                {token.riskLevel === "low" ? <Shield className="h-5 w-5 text-success" /> : <AlertTriangle className={cn("h-5 w-5", getRiskColor(token.riskLevel))} />}
                <span className="font-medium text-foreground capitalize">{token.riskLevel} Risk</span>
                {token.riskScore !== undefined && (
                  <span className="ml-auto text-sm text-muted-foreground">{token.riskScore}/100</span>
                )}
              </div>
              {token.reasons && token.reasons.length > 0 && (
                <ul className="space-y-1">
                  {token.reasons.map((reason, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {token.coingeckoId && (
              <a
                href={`https://www.coingecko.com/en/coins/${token.coingeckoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                View Details
              </a>
            )}
            <button
              onClick={() => copyToClipboard(token.symbol)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted/20 text-foreground hover:bg-muted/30 transition-colors text-sm"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
