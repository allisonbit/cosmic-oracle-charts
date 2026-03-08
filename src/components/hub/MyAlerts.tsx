import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  coin_id: string;
  symbol: string;
  target_price: number;
  condition: string;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
  note: string | null;
}

export function MyAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setAlerts(data as Alert[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const addAlert = async () => {
    if (!user || !symbol || !price) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_alerts").insert({
        user_id: user.id,
        coin_id: symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        target_price: parseFloat(price),
        condition,
        note: note || null,
      });
      if (error) throw error;
      toast.success(`Alert set: ${symbol.toUpperCase()} ${condition} $${price}`);
      setSymbol(""); setPrice(""); setNote(""); setShowForm(false);
      fetchAlerts();
    } catch (e) {
      toast.error("Failed to create alert");
    } finally {
      setSaving(false);
    }
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase.from("user_alerts").delete().eq("id", id);
    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Alert removed");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Add alert button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Alert
        </Button>
      )}

      {/* Create alert form */}
      {showForm && (
        <div className="p-5 rounded-xl bg-card border border-border space-y-4">
          <h3 className="font-semibold text-foreground">Create Price Alert</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Symbol (e.g. BTC)" value={symbol} onChange={e => setSymbol(e.target.value)} />
            <Input placeholder="Target price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            <div className="flex gap-2">
              <Button
                variant={condition === "above" ? "default" : "outline"}
                onClick={() => setCondition("above")}
                className="flex-1 gap-1"
                size="sm"
              >
                <ArrowUp className="w-3 h-3" /> Above
              </Button>
              <Button
                variant={condition === "below" ? "default" : "outline"}
                onClick={() => setCondition("below")}
                className="flex-1 gap-1"
                size="sm"
              >
                <ArrowDown className="w-3 h-3" /> Below
              </Button>
            </div>
          </div>
          <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <div className="flex gap-3">
            <Button onClick={addAlert} disabled={saving || !symbol || !price} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Set Alert
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Alerts list */}
      {alerts.length === 0 && !showForm ? (
        <div className="text-center py-16 space-y-4">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">No alerts yet</h3>
            <p className="text-muted-foreground">Set price alerts to never miss a move</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl bg-card border transition-all",
                alert.is_triggered ? "border-success/30 bg-success/5" : "border-border"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  alert.is_triggered ? "bg-success/10" : "bg-primary/10"
                )}>
                  {alert.is_triggered ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : alert.condition === "above" ? (
                    <ArrowUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{alert.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {alert.condition === "above" ? "rises above" : "drops below"}
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      ${alert.target_price.toLocaleString()}
                    </span>
                  </div>
                  {alert.note && (
                    <p className="text-xs text-muted-foreground mt-1">{alert.note}</p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)} className="h-8 w-8">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
