import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PieChart as PieChartIcon, Plus, Trash2, TrendingUp, TrendingDown, Loader2, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Percent, Coins, Eye, EyeOff, Edit2, X, Save, SortAsc, SortDesc, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SEO } from "@/components/MainSEO";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

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

const COLORS = [
  'hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)',
  'hsl(280 65% 60%)', 'hsl(200 80% 50%)', 'hsl(350 80% 55%)', 'hsl(170 60% 45%)',
];

function formatCompact(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function TrackerContent() {
  const { user } = useAuth();
  const { data: priceData } = useCryptoPrices();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [sortBy, setSortBy] = useState<'value' | 'pnl' | 'pnl_pct'>('value');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [formSymbol, setFormSymbol] = useState("");
  const [formName, setFormName] = useState("");
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

  useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

  const getPrice = (symbol: string): number => {
    const coin = priceData?.prices?.find(p => p.symbol?.toUpperCase() === symbol.toUpperCase());
    return coin?.price || 0;
  };

  const getChange = (symbol: string): number => {
    const coin = priceData?.prices?.find(p => p.symbol?.toUpperCase() === symbol.toUpperCase());
    return coin?.change24h || 0;
  };

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
      name: formName || formSymbol.toUpperCase(),
      quantity: parseFloat(formQuantity),
      buy_price: parseFloat(formBuyPrice),
      notes: formNotes || null,
    });
    if (error) toast.error("Failed to add holding");
    else {
      toast.success("Holding added!");
      setFormSymbol(""); setFormName(""); setFormQuantity(""); setFormBuyPrice(""); setFormNotes("");
      setShowForm(false);
      fetchHoldings();
    }
    setSaving(false);
  };

  const updateHolding = async (id: string) => {
    const { error } = await supabase.from("portfolio_holdings").update({
      quantity: parseFloat(editQty),
      buy_price: parseFloat(editPrice),
    }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success("Updated!"); setEditingId(null); fetchHoldings(); }
  };

  const deleteHolding = async (id: string) => {
    await supabase.from("portfolio_holdings").delete().eq("id", id);
    setHoldings(prev => prev.filter(h => h.id !== id));
    toast.success("Removed");
  };

  const enriched = useMemo(() => {
    return holdings.map(h => {
      const currentPrice = getPrice(h.symbol);
      const change24h = getChange(h.symbol);
      const invested = h.quantity * h.buy_price;
      const currentValue = h.quantity * currentPrice;
      const pnl = currentValue - invested;
      const pnlPct = h.buy_price > 0 ? ((currentPrice - h.buy_price) / h.buy_price) * 100 : 0;
      return { ...h, currentPrice, change24h, invested, currentValue, pnl, pnlPct };
    }).sort((a, b) => {
      if (sortBy === 'pnl') return Math.abs(b.pnl) - Math.abs(a.pnl);
      if (sortBy === 'pnl_pct') return Math.abs(b.pnlPct) - Math.abs(a.pnlPct);
      return b.currentValue - a.currentValue;
    });
  }, [holdings, priceData, sortBy]);

  const totalInvested = enriched.reduce((s, h) => s + h.invested, 0);
  const totalCurrent = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const bestPerformer = enriched.length > 0 ? enriched.reduce((a, b) => a.pnlPct > b.pnlPct ? a : b) : null;
  const worstPerformer = enriched.length > 0 ? enriched.reduce((a, b) => a.pnlPct < b.pnlPct ? a : b) : null;
  const profitableCount = enriched.filter(h => h.pnl > 0).length;

  const pieData = enriched.filter(h => h.currentValue > 0).map(h => ({
    name: h.symbol,
    value: parseFloat(h.currentValue.toFixed(2)),
  }));

  const barData = enriched.map(h => ({
    name: h.symbol,
    pnl: parseFloat(h.pnl.toFixed(2)),
    pnlPct: parseFloat(h.pnlPct.toFixed(1)),
  }));

  const mask = (val: string) => hideBalances ? '•••••' : val;

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
      <SEO title="Portfolio Tracker – Track Crypto P&L" description="Track your crypto portfolio with real-time P&L, allocation charts, and performance analytics." />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
              <p className="text-sm text-muted-foreground">
                {enriched.length} assets · Real-time P&L tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setHideBalances(!hideBalances)} className="gap-1.5">
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Add Trade'}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="border-border"><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Invested</p>
            <p className="text-lg font-bold font-mono">{mask(formatCompact(totalInvested))}</p>
          </CardContent></Card>
          <Card className="border-border"><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current Value</p>
            <p className="text-lg font-bold font-mono">{mask(formatCompact(totalCurrent))}</p>
          </CardContent></Card>
          <Card className={cn("border-border", totalPnL >= 0 ? "bg-success/5" : "bg-danger/5")}><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total P&L</p>
            <p className={cn("text-lg font-bold font-mono", totalPnL >= 0 ? "text-success" : "text-danger")}>
              {mask(`${totalPnL >= 0 ? '+' : ''}${formatCompact(totalPnL)}`)}
            </p>
            <p className={cn("text-xs font-mono", totalPnLPct >= 0 ? "text-success" : "text-danger")}>
              {totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%
            </p>
          </CardContent></Card>
          <Card className="border-border"><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Assets</p>
            <p className="text-lg font-bold font-mono">{enriched.length}</p>
            <p className="text-xs text-muted-foreground">{profitableCount} profitable</p>
          </CardContent></Card>
          <Card className="border-border"><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Best</p>
            <p className="text-sm font-bold text-success">{bestPerformer?.symbol || '—'}</p>
            <p className="text-xs text-success font-mono">{bestPerformer ? `+${bestPerformer.pnlPct.toFixed(1)}%` : ''}</p>
          </CardContent></Card>
          <Card className="border-border"><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Worst</p>
            <p className="text-sm font-bold text-danger">{worstPerformer?.symbol || '—'}</p>
            <p className="text-xs text-danger font-mono">{worstPerformer ? `${worstPerformer.pnlPct.toFixed(1)}%` : ''}</p>
          </CardContent></Card>
        </div>

        {/* Charts */}
        {enriched.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChartIcon className="w-4 h-4" /> Allocation</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> P&L by Asset</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {barData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm">Add New Holding</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div><label className="text-xs text-muted-foreground">Symbol *</label>
                  <Input value={formSymbol} onChange={e => setFormSymbol(e.target.value)} placeholder="BTC" className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground">Name</label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Bitcoin" className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground">Quantity *</label>
                  <Input type="number" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} placeholder="0.5" className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground">Buy Price *</label>
                  <Input type="number" value={formBuyPrice} onChange={e => setFormBuyPrice(e.target.value)} placeholder="50000" className="h-9" /></div>
                <div><label className="text-xs text-muted-foreground">Notes</label>
                  <Input value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="DCA buy..." className="h-9" /></div>
              </div>
              {formSymbol && formQuantity && formBuyPrice && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <span>Cost basis: <strong className="text-foreground">${(parseFloat(formQuantity || '0') * parseFloat(formBuyPrice || '0')).toFixed(2)}</strong></span>
                  {getPrice(formSymbol) > 0 && (
                    <span>Current value: <strong className="text-foreground">${(parseFloat(formQuantity || '0') * getPrice(formSymbol)).toFixed(2)}</strong></span>
                  )}
                </div>
              )}
              <Button onClick={addHolding} disabled={saving || !formSymbol || !formQuantity || !formBuyPrice} className="gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Holding'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sort Controls */}
        {enriched.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            {[
              { key: 'value' as const, label: 'Value' },
              { key: 'pnl' as const, label: 'P&L $' },
              { key: 'pnl_pct' as const, label: 'P&L %' },
            ].map(s => (
              <Button key={s.key} size="sm" variant={sortBy === s.key ? 'default' : 'ghost'} onClick={() => setSortBy(s.key)} className="text-xs h-7">{s.label}</Button>
            ))}
          </div>
        )}

        {/* Holdings List */}
        {enriched.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">
            <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <h3 className="font-semibold text-foreground mb-1">No Holdings Yet</h3>
            <p className="text-sm">Add your first trade to start tracking your portfolio</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {enriched.map((h, idx) => {
              const allocationPct = totalCurrent > 0 ? (h.currentValue / totalCurrent) * 100 : 0;
              const isEditing = editingId === h.id;

              return (
                <Card key={h.id} className={cn("border-border transition-all hover:shadow-sm", h.pnl >= 0 ? "border-l-2 border-l-success" : "border-l-2 border-l-danger")}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}>
                            {h.symbol.slice(0, 2)}
                          </div>
                          <span className="absolute -bottom-1 -right-1 text-[8px] bg-muted rounded-full px-1 font-mono">#{idx + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{h.symbol}</span>
                            <span className="text-xs text-muted-foreground">{h.name}</span>
                            <Badge variant="outline" className="text-[8px]">{allocationPct.toFixed(1)}%</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>{h.quantity} units</span>
                            <span>Buy: ${h.buy_price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                            <span>Now: ${h.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                            <span className={cn(h.change24h >= 0 ? "text-success" : "text-danger")}>
                              24h: {h.change24h >= 0 ? '+' : ''}{h.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-mono font-medium">{mask(formatCompact(h.currentValue))}</p>
                          <p className={cn("text-xs font-mono font-bold", h.pnl >= 0 ? "text-success" : "text-danger")}>
                            {h.pnl >= 0 ? '+' : ''}{mask(formatCompact(h.pnl))} ({h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(1)}%)
                          </p>
                        </div>
                        {/* Allocation bar */}
                        <div className="hidden md:block w-16">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(allocationPct, 100)}%`, background: COLORS[idx % COLORS.length] }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {!isEditing ? (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingId(h.id); setEditQty(String(h.quantity)); setEditPrice(String(h.buy_price)); }}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} className="h-7 w-20 text-xs" placeholder="Qty" />
                              <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="h-7 w-20 text-xs" placeholder="Price" />
                              <Button size="sm" className="h-7 text-xs" onClick={() => updateHolding(h.id)}>✓</Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>✕</Button>
                            </div>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteHolding(h.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {h.notes && <p className="text-xs text-muted-foreground mt-2 pl-[52px]">📝 {h.notes}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center">Prices refresh every 15s · Not financial advice</p>
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
