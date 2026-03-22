import { useState, useEffect, useCallback, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/MainSEO";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BookOpen, Plus, TrendingUp, TrendingDown, DollarSign, Target,
  Percent, BarChart3, Trash2, X, Save, Calendar, Tag, Edit, Trophy,
  Flame, Activity, ArrowUpRight, ArrowDownRight, Shield, Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";

interface Trade {
  id: string;
  coin_id: string;
  symbol: string;
  name: string;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  fees: number;
  pnl: number | null;
  pnl_percent: number | null;
  notes: string | null;
  tags: string[];
  status: string;
  entered_at: string;
  exited_at: string | null;
}

const PIE_COLORS = ['hsl(var(--success))', 'hsl(var(--danger))', 'hsl(var(--warning))'];

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function MyTradeJournal() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fees, setFees] = useState("0");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const fetchTrades = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("trade_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("entered_at", { ascending: false });
    if (!error && data) setTrades(data as Trade[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const addTrade = async () => {
    if (!user || !symbol || !entryPrice || !quantity) return;
    setSaving(true);
    const posSize = parseFloat(entryPrice) * parseFloat(quantity);
    const { error } = await supabase.from("trade_journal").insert({
      user_id: user.id,
      coin_id: symbol.toLowerCase(),
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      trade_type: tradeType,
      entry_price: parseFloat(entryPrice),
      quantity: parseFloat(quantity),
      fees: parseFloat(fees || "0"),
      notes: notes || null,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      status: "open",
    });
    if (error) toast.error("Failed to add trade");
    else {
      toast.success(`Trade logged! Position: $${posSize.toFixed(2)}`);
      setShowForm(false);
      setSymbol(""); setName(""); setEntryPrice(""); setQuantity(""); setFees("0"); setNotes(""); setTags("");
      fetchTrades();
    }
    setSaving(false);
  };

  const closeTrade = async (trade: Trade, exitPrice: string) => {
    if (!exitPrice) return;
    const exit = parseFloat(exitPrice);
    const pnl = (exit - trade.entry_price) * trade.quantity * (trade.trade_type === 'buy' ? 1 : -1) - (trade.fees || 0);
    const pnlPct = ((exit - trade.entry_price) / trade.entry_price) * 100 * (trade.trade_type === 'buy' ? 1 : -1);
    const { error } = await supabase.from("trade_journal").update({
      exit_price: exit, pnl, pnl_percent: pnlPct, status: "closed", exited_at: new Date().toISOString(),
    }).eq("id", trade.id);
    if (error) toast.error("Failed to close trade");
    else { toast.success(`Trade closed! P&L: $${pnl.toFixed(2)}`); fetchTrades(); }
  };

  const deleteTrade = async (id: string) => {
    await supabase.from("trade_journal").delete().eq("id", id);
    fetchTrades();
  };

  // Analytics
  const filteredTrades = trades.filter(t => filter === 'all' || t.status === filter);
  const closedTrades = trades.filter(t => t.status === 'closed');
  const openTrades = trades.filter(t => t.status === 'open');
  const totalPnL = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const losses = closedTrades.filter(t => (t.pnl || 0) < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  const avgWin = wins > 0 ? closedTrades.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + (t.pnl || 0), 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(closedTrades.filter(t => (t.pnl || 0) < 0).reduce((s, t) => s + (t.pnl || 0), 0) / losses) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins) / (avgLoss * losses) : 0;
  const biggestWin = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnl || 0)) : 0;
  const biggestLoss = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.pnl || 0)) : 0;
  const openExposure = openTrades.reduce((s, t) => s + (t.entry_price * t.quantity), 0);

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...closedTrades].sort((a, b) => new Date(b.exited_at || '').getTime() - new Date(a.exited_at || '').getTime());
    if (sorted.length === 0) return 0;
    const isWinning = (sorted[0]?.pnl || 0) > 0;
    for (const t of sorted) {
      if (((t.pnl || 0) > 0) === isWinning) count++;
      else break;
    }
    return isWinning ? count : -count;
  }, [closedTrades]);

  // Cumulative P&L chart
  const cumulativeData = useMemo(() => {
    const sorted = [...closedTrades].sort((a, b) => new Date(a.exited_at || '').getTime() - new Date(b.exited_at || '').getTime());
    let cumPnl = 0;
    return sorted.map((t, i) => {
      cumPnl += t.pnl || 0;
      return { trade: i + 1, pnl: parseFloat(cumPnl.toFixed(2)), date: new Date(t.exited_at || t.entered_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) };
    });
  }, [closedTrades]);

  // P&L by month
  const pnlByMonth = closedTrades.reduce((acc, t) => {
    const month = new Date(t.exited_at || t.entered_at).toLocaleDateString('en', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + (t.pnl || 0);
    return acc;
  }, {} as Record<string, number>);
  const monthData = Object.entries(pnlByMonth).map(([month, pnl]) => ({ month, pnl: parseFloat(pnl.toFixed(2)) }));

  // By asset
  const byAsset = closedTrades.reduce((acc, t) => {
    acc[t.symbol] = (acc[t.symbol] || 0) + (t.pnl || 0);
    return acc;
  }, {} as Record<string, number>);
  const assetData = Object.entries(byAsset).map(([name, pnl]) => ({ name, pnl: parseFloat(pnl.toFixed(2)) })).sort((a, b) => b.pnl - a.pnl);

  const pieData = [
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses },
    { name: 'Open', value: openTrades.length },
  ].filter(d => d.value > 0);

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="Trade Journal – Log & Analyze Trades" description="Professional trade journal with P&L tracking, win rate, cumulative equity curve, and performance analytics." />
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-primary/15 border border-primary/20"><BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Trade Journal</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">{trades.length} trades · {closedTrades.length} closed · {openTrades.length} open</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 w-full sm:w-auto">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Log Trade'}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-3">
            <Card className={cn("border-border", totalPnL >= 0 ? "bg-success/5" : "bg-danger/5")}><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Total P&L</p>
              <p className={cn("text-lg font-bold font-mono", totalPnL >= 0 ? "text-success" : "text-danger")}>{formatCompact(totalPnL)}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Win Rate</p>
              <p className={cn("text-lg font-bold font-mono", winRate >= 50 ? "text-success" : "text-danger")}>{winRate.toFixed(1)}%</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Profit Factor</p>
              <p className={cn("text-lg font-bold font-mono", profitFactor >= 1 ? "text-success" : "text-danger")}>{profitFactor.toFixed(2)}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Streak</p>
              <p className={cn("text-lg font-bold font-mono flex items-center gap-1", streak > 0 ? "text-success" : streak < 0 ? "text-danger" : "text-foreground")}>
                {streak > 0 && <Flame className="w-4 h-4" />}{Math.abs(streak)} {streak > 0 ? 'W' : streak < 0 ? 'L' : ''}
              </p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Avg Win</p>
              <p className="text-sm font-bold font-mono text-success">{formatCompact(avgWin)}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Avg Loss</p>
              <p className="text-sm font-bold font-mono text-danger">{formatCompact(avgLoss)}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Best Trade</p>
              <p className="text-sm font-bold font-mono text-success">{formatCompact(biggestWin)}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[9px] text-muted-foreground uppercase">Open Exposure</p>
              <p className="text-sm font-bold font-mono">{formatCompact(openExposure)}</p>
            </CardContent></Card>
          </div>

          {/* Charts Tabs */}
          {closedTrades.length > 0 && (
            <Tabs defaultValue="equity">
              <TabsList>
                <TabsTrigger value="equity" className="text-xs gap-1"><Activity className="w-3.5 h-3.5" /> Equity Curve</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs gap-1"><BarChart3 className="w-3.5 h-3.5" /> Monthly P&L</TabsTrigger>
                <TabsTrigger value="assets" className="text-xs gap-1"><Target className="w-3.5 h-3.5" /> By Asset</TabsTrigger>
                <TabsTrigger value="breakdown" className="text-xs gap-1"><Percent className="w-3.5 h-3.5" /> Breakdown</TabsTrigger>
              </TabsList>
              <TabsContent value="equity" className="mt-3">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cumulativeData}>
                          <defs><linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" fill="url(#pnlGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="monthly" className="mt-3">
                <Card className="border-border"><CardContent className="p-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                          {monthData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="assets" className="mt-3">
                <Card className="border-border"><CardContent className="p-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetData} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                          {assetData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="breakdown" className="mt-3">
                <Card className="border-border"><CardContent className="p-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}
                        label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie></PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent></Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Add Trade Form */}
          {showForm && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm">Log New Trade</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="text-xs text-muted-foreground">Symbol *</label>
                    <Input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="BTC" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Bitcoin" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Type</label>
                    <div className="flex gap-1 mt-1">
                      <Button size="sm" variant={tradeType === 'buy' ? 'default' : 'outline'} onClick={() => setTradeType('buy')} className="flex-1 h-9 text-xs">Long</Button>
                      <Button size="sm" variant={tradeType === 'sell' ? 'default' : 'outline'} onClick={() => setTradeType('sell')} className="flex-1 h-9 text-xs">Short</Button>
                    </div>
                  </div>
                  <div><label className="text-xs text-muted-foreground">Entry Price *</label>
                    <Input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Quantity *</label>
                    <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Fees</label>
                    <Input type="number" value={fees} onChange={e => setFees(e.target.value)} placeholder="0" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Tags (comma-sep)</label>
                    <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="swing, BTC" className="h-9" /></div>
                  <div><label className="text-xs text-muted-foreground">Notes</label>
                    <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Trade thesis..." className="h-9" /></div>
                </div>
                {entryPrice && quantity && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                    Position size: <strong className="text-foreground">${(parseFloat(entryPrice) * parseFloat(quantity)).toFixed(2)}</strong>
                  </div>
                )}
                <Button onClick={addTrade} disabled={saving || !symbol || !entryPrice || !quantity} className="gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Trade'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'open', 'closed'] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'ghost'} onClick={() => setFilter(f)} className="text-xs capitalize">
                {f} ({f === 'all' ? trades.length : trades.filter(t => t.status === f).length})
              </Button>
            ))}
          </div>

          {/* Trades List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading trades...</div>
            ) : filteredTrades.length === 0 ? (
              <Card className="border-border"><CardContent className="p-10 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <h3 className="font-semibold text-foreground mb-1">No Trades Yet</h3>
                <p className="text-sm">Log your first trade to start building your equity curve</p>
              </CardContent></Card>
            ) : (
              filteredTrades.map(trade => (
                <TradeRow key={trade.id} trade={trade} onClose={closeTrade} onDelete={deleteTrade} />
              ))
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function TradeRow({ trade, onClose, onDelete }: { trade: Trade; onClose: (t: Trade, p: string) => void; onDelete: (id: string) => void }) {
  const [showClose, setShowClose] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const isOpen = trade.status === 'open';
  const isProfitable = (trade.pnl || 0) >= 0;
  const positionSize = trade.entry_price * trade.quantity;
  const holdingDays = trade.exited_at
    ? Math.ceil((new Date(trade.exited_at).getTime() - new Date(trade.entered_at).getTime()) / (1000 * 60 * 60 * 24))
    : Math.ceil((Date.now() - new Date(trade.entered_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={cn("border-border transition-all hover:shadow-sm", isOpen ? "border-l-2 border-l-primary" : isProfitable ? "border-l-2 border-l-success" : "border-l-2 border-l-danger")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              trade.trade_type === 'buy' ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            )}>
              {trade.trade_type === 'buy' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">{trade.symbol}</span>
                <Badge variant="outline" className="text-[9px]">{trade.trade_type === 'buy' ? 'LONG' : 'SHORT'}</Badge>
                <Badge variant={isOpen ? "default" : "secondary"} className="text-[9px]">{trade.status.toUpperCase()}</Badge>
                {trade.tags?.length > 0 && trade.tags.map(t => <Badge key={t} variant="outline" className="text-[8px] bg-muted/50">{t}</Badge>)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{trade.name}</span>
                <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {new Date(trade.entered_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {holdingDays}d</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right hidden md:block">
              <p className="text-muted-foreground">Position</p>
              <p className="font-mono font-medium">${positionSize.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Entry</p>
              <p className="font-mono font-medium">${trade.entry_price}</p>
            </div>
            {trade.exit_price && (
              <div className="text-right">
                <p className="text-muted-foreground">Exit</p>
                <p className="font-mono font-medium">${trade.exit_price}</p>
              </div>
            )}
            <div className="text-right">
              <p className="text-muted-foreground">Qty</p>
              <p className="font-mono font-medium">{trade.quantity}</p>
            </div>
            {trade.pnl !== null && (
              <div className="text-right">
                <p className="text-muted-foreground">P&L</p>
                <p className={cn("font-mono font-bold", isProfitable ? "text-success" : "text-danger")}>
                  {isProfitable ? '+' : ''}${trade.pnl?.toFixed(2)}
                </p>
                <p className={cn("text-[10px] font-mono", isProfitable ? "text-success" : "text-danger")}>
                  {(trade.pnl_percent || 0) >= 0 ? '+' : ''}{trade.pnl_percent?.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isOpen && !showClose && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowClose(true)}>Close Trade</Button>
            )}
            {showClose && (
              <div className="flex items-center gap-1">
                <Input type="number" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="Exit $" className="h-7 w-24 text-xs" />
                <Button size="sm" className="h-7 text-xs" onClick={() => { onClose(trade, exitPrice); setShowClose(false); }}>✓</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowClose(false)}>✕</Button>
              </div>
            )}
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => onDelete(trade.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {trade.notes && <p className="text-xs text-muted-foreground mt-2 pl-12">📝 {trade.notes}</p>}
      </CardContent>
    </Card>
  );
}
