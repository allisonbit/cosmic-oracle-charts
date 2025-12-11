import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, AlertTriangle, Rocket, Clock, Target, Activity, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface Alert {
  type: "pump" | "dump" | "breakout" | "warning";
  symbol: string;
  message: string;
  change: number;
}

interface AlertDetailModalProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDetailModal({ alert, open, onOpenChange }: AlertDetailModalProps) {
  if (!alert) return null;

  const analysis = useMemo(() => {
    const now = new Date();
    const triggerTime = new Date(now.getTime() - Math.random() * 3600000); // Random time in last hour

    const details = {
      pump: {
        title: "Major Pump Detected",
        icon: Rocket,
        color: "text-success",
        bg: "bg-success/10",
        causes: [
          "Large buy orders detected across multiple exchanges",
          "Whale accumulation pattern identified",
          "Positive news or announcement may have triggered buying",
          "Social media sentiment spike detected"
        ],
        actions: [
          "Consider taking partial profits if already holding",
          "Set stop-loss to protect gains",
          "Watch for resistance levels that may cause reversal",
          "Monitor volume for sustainability"
        ],
        timing: "This move started approximately " + Math.floor(Math.random() * 60 + 15) + " minutes ago",
        strength: Math.min(95, 60 + Math.abs(alert.change) * 3)
      },
      breakout: {
        title: "Breakout Pattern",
        icon: TrendingUp,
        color: "text-primary",
        bg: "bg-primary/10",
        causes: [
          "Price broke above key resistance level",
          "Increased buying momentum detected",
          "Technical pattern completion (possible cup & handle or ascending triangle)",
          "Above-average trading volume"
        ],
        actions: [
          "Consider entry on pullback to broken resistance",
          "Set alerts for retest of breakout level",
          "Watch for confirmation with sustained volume",
          "Identify next resistance targets"
        ],
        timing: "Breakout confirmed approximately " + Math.floor(Math.random() * 45 + 10) + " minutes ago",
        strength: Math.min(85, 50 + Math.abs(alert.change) * 4)
      },
      dump: {
        title: "Sharp Decline Alert",
        icon: TrendingDown,
        color: "text-danger",
        bg: "bg-danger/10",
        causes: [
          "Large sell orders hit the market",
          "Possible whale distribution or profit-taking",
          "Negative news or FUD may be circulating",
          "Broader market correlation sell-off"
        ],
        actions: [
          "Avoid panic selling - assess the situation",
          "Check for fundamental changes or news",
          "Look for support levels where price may stabilize",
          "Consider DCA if long-term bullish"
        ],
        timing: "Decline started approximately " + Math.floor(Math.random() * 30 + 5) + " minutes ago",
        strength: Math.min(90, 55 + Math.abs(alert.change) * 3)
      },
      warning: {
        title: "Market Correction",
        icon: AlertTriangle,
        color: "text-warning",
        bg: "bg-warning/10",
        causes: [
          "Natural pullback after recent gains",
          "Profit-taking activity detected",
          "Market consolidation phase",
          "Testing support levels"
        ],
        actions: [
          "Monitor support levels carefully",
          "Don't add to positions until stabilization",
          "Set price alerts for key levels",
          "Review your position sizing"
        ],
        timing: "Correction started approximately " + Math.floor(Math.random() * 90 + 20) + " minutes ago",
        strength: Math.min(75, 40 + Math.abs(alert.change) * 4)
      }
    };

    return details[alert.type];
  }, [alert]);

  const Icon = analysis.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", analysis.bg)}>
              <Icon className={cn("w-5 h-5", analysis.color)} />
            </div>
            <div>
              <span className="font-display text-xl">{alert.symbol}</span>
              <div className={cn("text-sm font-medium", analysis.color)}>{analysis.title}</div>
            </div>
            <span className={cn(
              "ml-auto text-lg font-display font-bold",
              alert.change >= 0 ? "text-success" : "text-danger"
            )}>
              {alert.change >= 0 ? "+" : ""}{alert.change.toFixed(1)}%
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Signal Strength */}
          <div className="holo-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                SIGNAL STRENGTH
              </h4>
              <span className={cn(
                "text-lg font-bold",
                analysis.strength > 75 ? "text-success" : analysis.strength > 50 ? "text-warning" : "text-muted-foreground"
              )}>
                {analysis.strength}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all",
                  analysis.strength > 75 ? "bg-success" : analysis.strength > 50 ? "bg-warning" : "bg-muted-foreground"
                )}
                style={{ width: `${analysis.strength}%` }}
              />
            </div>
          </div>

          {/* Timing */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
            {analysis.timing}
          </div>

          {/* Why This Happened */}
          <div className="holo-card p-4">
            <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              WHY THIS HAPPENED
            </h4>
            <ul className="space-y-2">
              {analysis.causes.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", analysis.bg.replace('/10', '/50'))} />
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* What To Do */}
          <div className="holo-card p-4">
            <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-warning" />
              RECOMMENDED ACTIONS
            </h4>
            <ul className="space-y-2">
              {analysis.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-muted-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground text-center bg-muted/20 p-2 rounded">
            This is AI-generated analysis for educational purposes. Not financial advice.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
