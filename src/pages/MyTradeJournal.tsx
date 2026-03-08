import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BookOpen, Plus, TrendingUp, TrendingDown, DollarSign, Target,
  Percent, BarChart3, Trash2, X, Save, Calendar, Tag, Edit, ChevronDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

export default function MyTradeJournal() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  // Form state
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
      toast.success("Trade logged!");
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
    else { toast.success("Trade closed!"); fetchTrades(); }
  };

  const deleteTrade = async (id: string) => {
    await supabase.from("trade_journal").delete().eq("id", id);
    fetchTrades();
  };

  const filteredTrades = trades.filter(t => filter === 'all' || t.status === filter);
  const closedTrades = trades.filter(t => t.status === 'closed');
  const totalPnL = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const losses = closedTrades.filter(t => (t.pnl || 0) < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  const avgWin = wins > 0 ? closedTrades.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + (t.pnl || 0), 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(closedTrades.filter(t => (t.pnl || 0) < 0).reduce((s, t) => s + (t.pnl || 0), 0) / losses) : 0;

  const pnlByMonth = closedTrades.reduce((acc, t) => {
    const month = new Date(t.exited_at || t.entered_at).toLocaleDateString('en', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + (t.pnl || 0);
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(pnlByMonth).map(([month, pnl]) => ({ month, pnl: parseFloat(pnl.toFixed(2)) }));

  const pieData = [
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses },
    { name: 'Open', value: trades.filter(t => t.status === 'open').length },
  ].filter(d => d.value > 0);

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="Trade Journal – Log & Analyze Your Trades" description="Track every crypto trade with entry/exit prices, P&L, win rate, and performance analytics." />
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20"><BookOpen className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-2xl font-bold">Trade Journal</h1>
                <p className="text-sm text-muted-foreground">Log trades, track P&L, improve your strategy</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Log Trade'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Total P&L</p>
              <p className={cn("text-lg font-bold font-mono", totalPnL >= 0 ? "text-success" : "text-danger")}>
                ${totalPnL.toFixed(2)}
              </p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
              <p className={cn("text-lg font-bold font-mono", winRate >= 50 ? "text-success" : "text-danger")}>
                {winRate.toFixed(1)}%
              </p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Total Trades</p>
              <p className="text-lg font-bold font-mono">{trades.length}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Avg Win</p>
              <p className="text-lg font-bold font-mono text-success">${avgWin.toFixed(2)}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Avg Loss</p>
              <p className="text-lg font-bold font-mono text-danger">${avgLoss.toFixed(2)}</p>
            </CardContent></Card>
          </div>

          {/* Charts */}
          {closedTrades.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border md:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm">P&L by Month</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                          {chartData.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Win/Loss Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35} label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie></PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                <Button onClick={addTrade} disabled={saving || !symbol || !entryPrice || !quantity} className="gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Trade'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'open', 'closed'] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'ghost'} onClick={() => setFilter(f)} className="text-xs capitalize">{f} ({f === 'all' ? trades.length : trades.filter(t => t.status === f).length})</Button>
            ))}
          </div>

          {/* Trades List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading trades...</div>
            ) : filteredTrades.length === 0 ? (
              <Card className="border-border"><CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No trades yet. Log your first trade to start tracking!</p>
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

  return (
    <Card className={cn("border-border", isOpen && "border-l-2 border-l-primary")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              trade.trade_type === 'buy' ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
            )}>
              {trade.trade_type === 'buy' ? '↑' : '↓'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{trade.symbol}</span>
                <Badge variant="outline" className="text-[9px]">{trade.trade_type === 'buy' ? 'LONG' : 'SHORT'}</Badge>
                <Badge variant={isOpen ? "default" : "secondary"} className="text-[9px]">{trade.status.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{trade.name} · {new Date(trade.entered_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
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
                  {isProfitable ? '+' : ''}${trade.pnl?.toFixed(2)} ({trade.pnl_percent?.toFixed(1)}%)
                </p>
              </div>
            )}
            {trade.tags && trade.tags.length > 0 && (
              <div className="hidden md:flex gap-1">{trade.tags.map(t => <Badge key={t} variant="outline" className="text-[8px]">{t}</Badge>)}</div>
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
        {trade.notes && <p className="text-xs text-muted-foreground mt-2 pl-11">{trade.notes}</p>}
      </CardContent>
    </Card>
  );
}
