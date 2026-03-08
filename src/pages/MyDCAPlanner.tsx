import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Repeat, Plus, X, Save, DollarSign, TrendingUp, Calendar,
  Pause, Play, Trash2, BarChart3, Target, Coins, ArrowUpRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DcaPlan {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  amount_per_buy: number;
  frequency: string;
  total_invested: number;
  total_units: number;
  avg_buy_price: number;
  next_buy_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

function formatCompact(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function MyDCAPlanner() {
  const { user } = useAuth();
  const { data: priceData } = useCryptoPrices();
  const [plans, setPlans] = useState<DcaPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [notes, setNotes] = useState("");

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("dca_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setPlans(data as DcaPlan[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const getPrice = (sym: string) => {
    const coin = priceData?.prices?.find(p => p.symbol?.toUpperCase() === sym.toUpperCase());
    return coin?.price || 0;
  };

  const addPlan = async () => {
    if (!user || !symbol || !amount) return;
    setSaving(true);
    const nextDate = new Date();
    if (frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    const { error } = await supabase.from("dca_plans").insert({
      user_id: user.id,
      coin_id: symbol.toLowerCase(),
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      amount_per_buy: parseFloat(amount),
      frequency,
      next_buy_date: nextDate.toISOString(),
      notes: notes || null,
    });
    if (error) toast.error("Failed to create plan");
    else { toast.success("DCA plan created!"); setShowForm(false); setSymbol(""); setName(""); setAmount(""); setNotes(""); fetchPlans(); }
    setSaving(false);
  };

  const recordBuy = async (plan: DcaPlan) => {
    const currentPrice = getPrice(plan.symbol);
    if (!currentPrice || !user) { toast.error("Price not available"); return; }

    const unitsBought = plan.amount_per_buy / currentPrice;
    const newTotalInvested = plan.total_invested + plan.amount_per_buy;
    const newTotalUnits = plan.total_units + unitsBought;
    const newAvgPrice = newTotalInvested / newTotalUnits;

    const nextDate = new Date();
    if (plan.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (plan.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (plan.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    const { error: entryError } = await supabase.from("dca_entries").insert({
      plan_id: plan.id,
      user_id: user.id,
      amount: plan.amount_per_buy,
      price_at_buy: currentPrice,
      units_bought: unitsBought,
    });

    const { error: planError } = await supabase.from("dca_plans").update({
      total_invested: newTotalInvested,
      total_units: newTotalUnits,
      avg_buy_price: newAvgPrice,
      next_buy_date: nextDate.toISOString(),
    }).eq("id", plan.id);

    if (entryError || planError) toast.error("Failed to record buy");
    else { toast.success(`Bought ${unitsBought.toFixed(6)} ${plan.symbol} at $${currentPrice.toLocaleString()}`); fetchPlans(); }
  };

  const togglePlan = async (plan: DcaPlan) => {
    await supabase.from("dca_plans").update({ is_active: !plan.is_active }).eq("id", plan.id);
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    await supabase.from("dca_plans").delete().eq("id", id);
    fetchPlans();
  };

  const totalInvested = plans.reduce((s, p) => s + p.total_invested, 0);
  const totalValue = plans.reduce((s, p) => s + (p.total_units * getPrice(p.symbol)), 0);
  const totalPnL = totalValue - totalInvested;
  const activePlans = plans.filter(p => p.is_active).length;

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="DCA Planner – Dollar Cost Average Calculator" description="Plan and track dollar-cost averaging strategies for any cryptocurrency." />
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20"><Repeat className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-2xl font-bold">DCA Planner</h1>
                <p className="text-sm text-muted-foreground">Automate your buying strategy, reduce timing risk</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'New Plan'}
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Total Invested</p>
              <p className="text-lg font-bold font-mono">{formatCompact(totalInvested)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Current Value</p>
              <p className="text-lg font-bold font-mono">{formatCompact(totalValue)}</p>
            </CardContent></Card>
            <Card><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Total P&L</p>
              <p className={cn("text-lg font-bold font-mono", totalPnL >= 0 ? "text-success" : "text-danger")}>
                {totalPnL >= 0 ? '+' : ''}{formatCompact(totalPnL)}
              </p>
            </CardContent></Card>
            <Card><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Active Plans</p>
              <p className="text-lg font-bold font-mono">{activePlans}</p>
            </CardContent></Card>
          </div>

          {/* New Plan Form */}
          {showForm && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm">Create DCA Plan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="text-xs text-muted-foreground">Symbol *</label>
                    <Input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="BTC" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Bitcoin" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Amount per Buy ($) *</label>
                    <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Frequency</label>
                    <select value={frequency} onChange={e => setFrequency(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addPlan} disabled={saving || !symbol || !amount} className="gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Creating...' : 'Create Plan'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Plans */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading plans...</div>
            ) : plans.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">
                <Repeat className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No DCA plans yet. Create your first plan to start systematic investing!</p>
              </CardContent></Card>
            ) : (
              plans.map(plan => {
                const currentPrice = getPrice(plan.symbol);
                const currentValue = plan.total_units * currentPrice;
                const pnl = currentValue - plan.total_invested;
                const pnlPct = plan.total_invested > 0 ? (pnl / plan.total_invested) * 100 : 0;
                const nextBuy = plan.next_buy_date ? new Date(plan.next_buy_date) : null;
                const isDue = nextBuy && nextBuy <= new Date();

                return (
                  <Card key={plan.id} className={cn("border-border", !plan.is_active && "opacity-50")}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{plan.symbol[0]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{plan.symbol}</span>
                              <Badge variant="outline" className="text-[9px]">{plan.frequency}</Badge>
                              <Badge variant={plan.is_active ? "default" : "secondary"} className="text-[9px]">
                                {plan.is_active ? 'ACTIVE' : 'PAUSED'}
                              </Badge>
                              {isDue && plan.is_active && (
                                <Badge className="text-[9px] bg-warning/20 text-warning border-warning/30">BUY DUE</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{plan.name} · ${plan.amount_per_buy}/buy</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-right">
                            <p className="text-muted-foreground">Invested</p>
                            <p className="font-mono font-medium">{formatCompact(plan.total_invested)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Value</p>
                            <p className="font-mono font-medium">{formatCompact(currentValue)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Avg Price</p>
                            <p className="font-mono font-medium">${plan.avg_buy_price > 0 ? plan.avg_buy_price.toFixed(2) : '—'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">P&L</p>
                            <p className={cn("font-mono font-bold", pnl >= 0 ? "text-success" : "text-danger")}>
                              {pnl >= 0 ? '+' : ''}{formatCompact(pnl)} ({pnlPct.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {plan.is_active && (
                            <Button size="sm" variant={isDue ? "default" : "outline"} className="h-7 text-xs gap-1" onClick={() => recordBuy(plan)}>
                              <DollarSign className="w-3 h-3" /> Record Buy
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => togglePlan(plan)}>
                            {plan.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deletePlan(plan.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {nextBuy && plan.is_active && (
                        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Next buy: {nextBuy.toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
