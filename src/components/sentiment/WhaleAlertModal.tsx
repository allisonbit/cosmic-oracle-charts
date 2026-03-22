import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Waves, Clock, AlertTriangle, BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WhaleAlert {
  symbol: string;
  type: "accumulation" | "distribution";
  amount: string;
  time: string;
  volume?: number;
  price?: number;
  change24h?: number;
}

interface WhaleAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: WhaleAlert | null;
}

export function WhaleAlertModal({ open, onOpenChange, alert }: WhaleAlertModalProps) {
  if (!alert) return null;

  const isAccumulation = alert.type === "accumulation";

  const getImplication = () => {
    if (isAccumulation) {
      return "Large wallets are accumulating this asset, which often precedes upward price movement. This could indicate smart money positioning for an anticipated rally.";
    }
    return "Large holders are reducing their positions, which may signal profit-taking or risk reduction. Monitor for potential support level tests.";
  };

  const getAction = () => {
    if (isAccumulation) {
      return "Consider this a potential bullish signal. Look for confirmation from price action and volume before entering positions.";
    }
    return "Exercise caution. Wait for price stabilization before considering new entries. Set tight stop-losses if already in position.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isAccumulation ? "bg-success/20" : "bg-danger/20"
            )}>
              {isAccumulation ? 
                <TrendingUp className="w-6 h-6 text-success" /> : 
                <TrendingDown className="w-6 h-6 text-danger" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display">{alert.symbol}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-bold",
                  isAccumulation ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                )}>
                  {alert.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-normal">Whale Activity Detected</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Alert Summary */}
          <div className={cn(
            "p-4 rounded-xl border",
            isAccumulation ? "bg-success/10 border-success/30" : "bg-danger/10 border-danger/30"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-primary" />
                <span className="font-display font-bold">Volume</span>
              </div>
              <span className="text-xl font-bold">${alert.amount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Detected {alert.time}</span>
            </div>
          </div>

          {/* Stats Grid */}
          {(alert.price || alert.change24h !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              {alert.price && (
                <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs">Current Price</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    ${alert.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {alert.change24h !== undefined && (
                <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-xs">24h Change</span>
                  </div>
                  <p className={cn(
                    "text-lg font-semibold",
                    alert.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {alert.change24h >= 0 ? "+" : ""}{alert.change24h.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What This Means */}
          <div className="p-4 rounded-xl bg-muted/10 border border-border/30">
            <h4 className="font-display font-bold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              What This Means
            </h4>
            <p className="text-sm text-muted-foreground">{getImplication()}</p>
          </div>

          {/* Suggested Action */}
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <h4 className="font-display font-bold text-sm mb-2 text-primary">Suggested Action</h4>
            <p className="text-sm text-foreground">{getAction()}</p>
          </div>

          {/* Risk Warning */}
          <p className="text-xs text-muted-foreground text-center">
            Whale activity is one of many indicators. Always do your own research and manage risk appropriately.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
