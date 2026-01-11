import { useState } from "react";
import { Bell, Plus, Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Alert {
  id: string;
  condition: string;
  type: string;
  channels: string;
  status: "active" | "pending" | "triggered";
}

const QUICK_TEMPLATES = [
  "Large Volume Spike",
  "Whale Movement",
  "Funding Rate > 0.01%",
  "Fear & Greed < 20"
];

export function CustomAlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "1", condition: "BTC > $95,000", type: "Price Alert", channels: "Email + Push", status: "active" },
    { id: "2", condition: "ETH Volatility > 5%", type: "Volatility Alert", channels: "Push only", status: "pending" },
    { id: "3", condition: "SOL drops 10%", type: "Price Alert", channels: "Email", status: "triggered" },
  ]);

  const handleAddAlert = (template: string) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      condition: template,
      type: "Quick Alert",
      channels: "Push",
      status: "active"
    };
    setAlerts(prev => [newAlert, ...prev]);
    toast.success(`Alert created: ${template}`);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.info("Alert removed");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Check className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "triggered": return <Bell className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success bg-success/20";
      case "pending": return "text-warning bg-warning/20";
      case "triggered": return "text-primary bg-primary/20";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          CUSTOM ALERTS
        </h3>
        <button className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">New Alert</span>
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-2 sm:space-y-3 mb-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="min-w-0">
              <div className="font-medium text-xs sm:text-sm truncate">{alert.condition}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{alert.type} • {alert.channels}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                getStatusColor(alert.status)
              )}>
                {getStatusIcon(alert.status)}
                {alert.status}
              </span>
              <button 
                onClick={() => handleRemoveAlert(alert.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/20 rounded transition-all"
              >
                <X className="w-3 h-3 text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Templates */}
      <div className="pt-3 border-t border-border">
        <div className="text-[10px] sm:text-xs text-muted-foreground mb-2">Quick Alert Templates:</div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <button
              key={template}
              onClick={() => handleAddAlert(template)}
              className="px-2 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-[10px] sm:text-xs hover:bg-primary/20 transition-colors"
            >
              {template}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
