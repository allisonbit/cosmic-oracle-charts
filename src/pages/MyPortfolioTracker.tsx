import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Plus, Trash2, TrendingUp, TrendingDown, Loader2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Holding {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  quantity: number;
  buy_price: number;
  bought_at: string;
  notes: string | null;
}

function TrackerContent() {
  const { user } = useAuth();
  const { data: prices } = useCryptoPrices();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formSymbol, setFormSymbol] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formBuyPrice, setFormBuyPrice] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchHoldings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHoldings((data as any[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const addHolding = async () => {
    if (!user || !formSymbol || !formQuantity || !formBuyPrice) {
      toast.error("Fill in symbol, quantity, and buy price");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("portfolio_holdings").insert({
      user_id: user.id,
      coin_id: formSymbol.toLowerCase(),
      symbol: formSymbol.toUpperCase(),
      name: formSymbol.toUpperCase(),
      quantity: parseFloat(formQuantity),
      buy_price: parseFloat(formBuyPrice),
      notes: formNotes || null,
    });
    if (error) {
      toast.error("Failed to add holding");
    } else {
      toast.success("Holding added");
      setFormSymbol("");
      setFormQuantity("");
      setFormBuyPrice("");
      setFormNotes("");
      setShowForm(false);
      fetchHoldings();
    }
    setSaving(false);
  };

  const deleteHolding = async (id: string) => {
    await supabase.from("portfolio_holdings").delete().eq("id", id);
    setHoldings((prev) => prev.filter((h) => h.id !== id));
    toast.success("Holding removed");
  };

  // Calculate P&L
  const getCurrentPrice = (symbol: string): number => {
    if (!prices) return 0;
    const coin = Object.values(prices).find(
      (c: any) => c.symbol?.toUpperCase() === symbol.toUpperCase()
    ) as any;
    return coin?.current_price || 0;
  };

  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.buy_price, 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + h.quantity * getCurrentPrice(h.symbol), 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Portfolio Tracker</h1>
              <p className="text-sm text-muted-foreground">Track buy prices & real profit/loss</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" /> Add Trade
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Invested</p>
              <p className="text-lg font-bold text-foreground">${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current Value</p>
              <p className="text-lg font-bold text-foreground">${totalCurrent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
              <p className={cn("text-lg font-bold", totalPnL >= 0 ? "text-emerald-500" : "text-red-500")}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Return</p>
              <p className={cn("text-lg font-bold", totalPnLPct >= 0 ? "text-emerald-500" : "text-red-500")}>
                {totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Add New Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input placeholder="Symbol (BTC)" value={formSymbol} onChange={(e) => setFormSymbol(e.target.value)} />
                <Input placeholder="Quantity" type="number" value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} />
                <Input placeholder="Buy Price ($)" type="number" value={formBuyPrice} onChange={(e) => setFormBuyPrice(e.target.value)} />
                <Input placeholder="Notes (optional)" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={addHolding} disabled={saving} size="sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Save Trade
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Holdings list */}
        {holdings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <PieChart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Holdings Yet</h3>
              <p className="text-sm text-muted-foreground">Add your first trade to start tracking P&L</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Holdings ({holdings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {holdings.map((h) => {
                  const currentPrice = getCurrentPrice(h.symbol);
                  const pnl = (currentPrice - h.buy_price) * h.quantity;
                  const pnlPct = h.buy_price > 0 ? ((currentPrice - h.buy_price) / h.buy_price) * 100 : 0;
                  return (
                    <div key={h.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{h.symbol.slice(0, 2)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground text-sm">{h.symbol}</p>
                            <Badge variant="outline" className="text-[10px]">{h.quantity} units</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Buy: ${h.buy_price.toLocaleString(undefined, { maximumFractionDigits: 4 })} • Now: ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={cn("font-semibold text-sm", pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {pnl >= 0 ? "+" : ""}${pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            {pnl >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                            <span className={cn("text-xs", pnl >= 0 ? "text-emerald-500" : "text-red-500")}>{pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteHolding(h.id)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default function MyPortfolioTracker() {
  return (
    <ProtectedRoute>
      <TrackerContent />
    </ProtectedRoute>
  );
}
