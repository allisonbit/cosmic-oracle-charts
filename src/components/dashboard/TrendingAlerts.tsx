import { Flame, TrendingUp, TrendingDown, AlertTriangle, Rocket, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { AlertDetailModal } from "./AlertDetailModal";

interface Alert {
  type: "pump" | "dump" | "breakout" | "warning";
  symbol: string;
  message: string;
  change: number;
}

interface TrendingAlertsProps {
  compact?: boolean;
}

export function TrendingAlerts({ compact }: TrendingAlertsProps) {
  const { data } = useMarketData();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const alerts = useMemo(() => {
    const topCoins = data?.topCoins || [];
    const alertList: Alert[] = [];

    topCoins.forEach(coin => {
      if (coin.change24h > 10) {
        alertList.push({
          type: "pump",
          symbol: coin.symbol,
          message: `Major pump detected - up ${coin.change24h.toFixed(1)}% in 24h`,
          change: coin.change24h
        });
      } else if (coin.change24h > 5) {
        alertList.push({
          type: "breakout",
          symbol: coin.symbol,
          message: `Breaking out with ${coin.change24h.toFixed(1)}% gains`,
          change: coin.change24h
        });
      } else if (coin.change24h < -10) {
        alertList.push({
          type: "dump",
          symbol: coin.symbol,
          message: `Sharp decline - down ${Math.abs(coin.change24h).toFixed(1)}%`,
          change: coin.change24h
        });
      } else if (coin.change24h < -5) {
        alertList.push({
          type: "warning",
          symbol: coin.symbol,
          message: `Correction underway - ${coin.change24h.toFixed(1)}%`,
          change: coin.change24h
        });
      }
    });

    return alertList.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, compact ? 3 : 5);
  }, [data, compact]);

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "pump": return { icon: Rocket, color: "text-success", bg: "bg-success/10 border-success/30" };
      case "breakout": return { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 border-primary/30" };
      case "dump": return { icon: TrendingDown, color: "text-danger", bg: "bg-danger/10 border-danger/30" };
      case "warning": return { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/30" };
      default: return { icon: Flame, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  return (
    <>
      <div className="holo-card p-4 md:p-6">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-warning" />
          LIVE ALERTS
          <span className="ml-auto text-xs text-muted-foreground font-normal">Click for details</span>
        </h3>
        
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const style = getAlertStyle(alert.type);
              const AlertIcon = style.icon;
              return (
                <button 
                  key={`${alert.symbol}-${i}`}
                  onClick={() => setSelectedAlert(alert)}
                  className={cn(
                    "w-full p-3 rounded-lg border flex items-center gap-3 animate-fade-in transition-all hover:scale-[1.02] text-left group",
                    style.bg
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <AlertIcon className={cn("w-5 h-5", style.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold">{alert.symbol}</span>
                      <span className={cn("text-xs font-bold", alert.change >= 0 ? "text-success" : "text-danger")}>
                        {alert.change >= 0 ? "+" : ""}{alert.change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No major alerts at the moment</p>
            <p className="text-xs mt-1">Market is relatively stable</p>
          </div>
        )}
      </div>

      <AlertDetailModal
        alert={selectedAlert}
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
      />
    </>
  );
}
