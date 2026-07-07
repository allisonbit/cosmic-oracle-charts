import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState, useMemo, Fragment } from "react";
import { invokeFunction } from "@/integrations/supabase/functions";
import {
  Search, Wallet, Loader2, AlertTriangle, Shield, ExternalLink, Copy, Check,
  PieChart as PieChartIcon, Activity, Flame, TrendingUp, TrendingDown,
  Layers, Sparkles, Target, ChevronDown, Brain, Gauge, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CoinImage } from "@/components/ui/CoinImage";
import { toast } from "sonner";
import { SEO } from "@/components/MainSEO";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// ── Types (now surfacing the rich fields the scanner already returns) ─────────
interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  pumpPotential: "high" | "medium" | "low";
  riskLevel: "low" | "medium" | "high" | "extreme";
  recommendation: "hold" | "accumulate" | "take_profit" | "exit";
  insight: string;
  contractAddress: string;
  chain: string;
  logo?: string;
}

interface WalletAnalysis {
  address: string;
  totalValue: number;
  holdings: TokenHolding[];
  riskScore: number;
  diversificationScore: number;
  overallInsight: string;
  warnings: string[];
  topPicks?: string[];
  chainBreakdown?: Record<string, { value: number; count: number }>;
  riskBreakdown?: Record<string, number>;
  recommendationCounts?: Record<string, number>;
  chainsScanned?: string[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)', 'hsl(200 80% 50%)', 'hsl(350 80% 55%)', 'hsl(170 60% 45%)', 'hsl(var(--accent))'];

const EXAMPLE_WALLETS = [
  { label: 'Vitalik', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  { label: 'Whale', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18' },
];

const CHAIN_META: Record<string, { label: string; color: string }> = {
  ethereum: { label: 'Ethereum', color: 'hsl(217 90% 61%)' },
  polygon: { label: 'Polygon', color: 'hsl(269 80% 60%)' },
  arbitrum: { label: 'Arbitrum', color: 'hsl(199 89% 55%)' },
  base: { label: 'Base', color: 'hsl(221 83% 53%)' },
  optimism: { label: 'Optimism', color: 'hsl(0 84% 60%)' },
  solana: { label: 'Solana', color: 'hsl(265 84% 63%)' },
  unknown: { label: 'Other', color: 'hsl(var(--muted-foreground))' },
};
const chainLabel = (c: string) => CHAIN_META[c]?.label ?? (c.charAt(0).toUpperCase() + c.slice(1));
const chainColor = (c: string) => CHAIN_META[c]?.color ?? 'hsl(var(--muted-foreground))';

const CHAIN_EXPLORERS: Record<string, (a: string) => string> = {
  ethereum: (a) => `https://etherscan.io/token/${a}`,
  polygon: (a) => `https://polygonscan.com/token/${a}`,
  arbitrum: (a) => `https://arbiscan.io/token/${a}`,
  base: (a) => `https://basescan.org/token/${a}`,
  optimism: (a) => `https://optimistic.etherscan.io/token/${a}`,
  solana: (a) => `https://solscan.io/token/${a}`,
};

const RISK_META: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-success border-success/30 bg-success/10' },
  medium: { label: 'Medium', className: 'text-warning border-warning/30 bg-warning/10' },
  high: { label: 'High', className: 'text-orange-500 border-orange-500/30 bg-orange-500/10' },
  extreme: { label: 'Extreme', className: 'text-danger border-danger/30 bg-danger/10' },
};

const RECO_META: Record<string, { label: string; className: string; icon: typeof TrendingUp }> = {
  accumulate: { label: 'Accumulate', className: 'text-success border-success/30 bg-success/10', icon: TrendingUp },
  hold: { label: 'Hold', className: 'text-muted-foreground border-border bg-muted/40', icon: Shield },
  take_profit: { label: 'Take Profit', className: 'text-primary border-primary/30 bg-primary/10', icon: Target },
  exit: { label: 'Exit', className: 'text-danger border-danger/30 bg-danger/10', icon: TrendingDown },
};

const PUMP_META: Record<string, { label: string; className: string }> = {
  high: { label: 'High', className: 'text-success' },
  medium: { label: 'Medium', className: 'text-warning' },
  low: { label: 'Low', className: 'text-muted-foreground' },
};

function fmtUsd(n: number, max = 2): string {
  return `$${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: max })}`;
}
function fmtCompact(n: number): string {
  if (!n) return '$0';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function StatCard({ label, value, sub, className, valueClass }: { label: string; value: React.ReactNode; sub?: React.ReactNode; className?: string; valueClass?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-3 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={cn("text-lg font-bold font-mono", valueClass)}>{value}</p>
        {sub && <div className="mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function ScannerContent() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const scanWallet = async (addr?: string) => {
    const target = addr || address.trim();
    if (!target) { toast.error("Enter a wallet address"); return; }
    setLoading(true);
    setExpandedRow(null);
    try {
      const { data, error } = await invokeFunction<WalletAnalysis>("wallet-scanner", { body: { address: target } });
      if (error) throw error;
      if (!data || (data as any).error) throw new Error((data as any)?.error || "Scan failed");
      setAnalysis(data);
      setAddress(target);
      if (!scanHistory.includes(target)) setScanHistory(prev => [target, ...prev].slice(0, 5));
      toast.success("Wallet scanned successfully");
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskColor = (score: number) => score <= 30 ? "text-success" : score <= 60 ? "text-warning" : "text-danger";
  const getRiskBg = (score: number) => score <= 30 ? "bg-success/10" : score <= 60 ? "bg-warning/10" : "bg-danger/10";
  const getRiskLabel = (score: number) => score <= 30 ? "Low Risk" : score <= 60 ? "Medium Risk" : "High Risk";

  const sortedHoldings = useMemo(() => analysis ? [...analysis.holdings].sort((a, b) => b.value - a.value) : [], [analysis]);

  const pieData = useMemo(() => sortedHoldings.filter(h => h.value > 0).slice(0, 8).map(h => ({ name: h.symbol, value: parseFloat((h.value ?? 0).toFixed(2)) })), [sortedHoldings]);
  const barData = useMemo(() => sortedHoldings.filter(h => h.change24h !== 0).slice(0, 10).map(h => ({ name: h.symbol, change: parseFloat((h.change24h ?? 0).toFixed(2)) })), [sortedHoldings]);

  const topGainer = sortedHoldings.length ? sortedHoldings.reduce((a, b) => (a.change24h > b.change24h ? a : b)) : undefined;
  const topLoser = sortedHoldings.length ? sortedHoldings.reduce((a, b) => (a.change24h < b.change24h ? a : b)) : undefined;
  const stablecoins = sortedHoldings.filter(h => ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX'].includes(h.symbol.toUpperCase()));
  const stablePct = analysis ? ((stablecoins.reduce((s, h) => s + h.value, 0)) / Math.max(analysis.totalValue, 1)) * 100 : 0;
  const largest = sortedHoldings[0];
  const largestPct = analysis && largest ? (largest.value / Math.max(analysis.totalValue, 1)) * 100 : 0;

  // Real breakdowns from the backend (fall back to client compute if absent).
  const chainRows = useMemo(() => {
    if (!analysis) return [] as { chain: string; value: number; count: number; pct: number }[];
    const cb = analysis.chainBreakdown ?? {};
    const total = Math.max(analysis.totalValue, 1);
    return Object.entries(cb)
      .map(([chain, v]) => ({ chain, value: v.value, count: v.count, pct: (v.value / total) * 100 }))
      .sort((a, b) => b.value - a.value);
  }, [analysis]);

  const riskRows = useMemo(() => {
    if (!analysis?.riskBreakdown) return [];
    const total = Math.max(analysis.totalValue, 1);
    return (['low', 'medium', 'high', 'extreme'] as const)
      .map(level => ({ level, value: analysis.riskBreakdown![level] || 0, pct: ((analysis.riskBreakdown![level] || 0) / total) * 100 }))
      .filter(r => r.value > 0);
  }, [analysis]);

  const recoRows = useMemo(() => {
    if (!analysis?.recommendationCounts) return [];
    return (['accumulate', 'hold', 'take_profit', 'exit'] as const)
      .map(reco => ({ reco, count: analysis.recommendationCounts![reco] || 0 }))
      .filter(r => r.count > 0);
  }, [analysis]);

  const topPickHoldings = useMemo(() => {
    if (!analysis?.topPicks) return [];
    return analysis.topPicks
      .map(sym => sortedHoldings.find(h => h.symbol === sym))
      .filter((h): h is TokenHolding => !!h);
  }, [analysis, sortedHoldings]);

  return (
    <Layout>
      <SEO title="Wallet Scanner – Analyze Any Crypto Wallet Across All Chains" description="Deep-scan any wallet across Ethereum, Polygon, Arbitrum, Base and Solana. Holdings, per-token risk & AI recommendations, chain allocation, portfolio risk score and warnings." />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/20">
              <Wallet className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wallet Scanner</h1>
              <p className="text-sm text-muted-foreground">Deep multi-chain analysis — holdings, per-token risk & AI recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:ml-auto flex-wrap">
            {['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Solana'].map(c => (
              <Badge key={c} variant="outline" className="text-[10px] gap-1"><Globe className="w-2.5 h-2.5" />{c}</Badge>
            ))}
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex gap-3">
              <Input
                placeholder="Paste wallet address (0x..., ENS, or Solana address)"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === "Enter" && scanWallet()}
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={() => scanWallet()} disabled={loading} className="shrink-0 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Scanning...' : 'Scan'}
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Try:</span>
              {EXAMPLE_WALLETS.map(w => (
                <Button key={w.label} variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => scanWallet(w.address)}>{w.label}</Button>
              ))}
              {scanHistory.length > 0 && (
                <>
                  <span className="text-[10px] text-muted-foreground ml-2">Recent:</span>
                  {scanHistory.map((h, i) => (
                    <Button key={i} variant="ghost" size="sm" className="text-[10px] h-6 px-2 font-mono" onClick={() => scanWallet(h)}>{h.slice(0, 6)}...{h.slice(-4)}</Button>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {!analysis && !loading && (
          <Card>
            <CardContent className="py-16 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Scan any wallet on any chain</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Paste an Ethereum, Polygon, Arbitrum, Base or Solana address to see full holdings, a portfolio risk score,
                per-token AI recommendations, and where the money sits across chains.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-5">
            {/* Address bar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg flex-wrap">
              <span className="text-xs text-muted-foreground">Address:</span>
              <span className="text-xs font-mono text-foreground truncate">{analysis.address}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={copyAddress}>
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </Button>
              {chainRows.length > 0 && (
                <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {chainRows.length} chain{chainRows.length > 1 ? 's' : ''} with assets
                </span>
              )}
            </div>

            {/* Overview stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <StatCard label="Total Value" value={fmtUsd(analysis.totalValue)} />
              <StatCard label="Tokens" value={analysis.holdings.length} />
              <StatCard label="Risk Score" value={`${analysis.riskScore}/100`} valueClass={getRiskColor(analysis.riskScore)} className={getRiskBg(analysis.riskScore)} sub={<Badge variant="outline" className="text-[8px]">{getRiskLabel(analysis.riskScore)}</Badge>} />
              <StatCard label="Diversity" value={`${analysis.diversificationScore}/100`} />
              <StatCard label="Stablecoin %" value={`${stablePct.toFixed(1)}%`} />
              <StatCard label="Top Gainer" value={<span className="text-success text-sm">{topGainer?.symbol ?? '—'}</span>} sub={topGainer && <span className="text-[10px] text-success font-mono">+{(topGainer.change24h ?? 0).toFixed(1)}%</span>} />
              <StatCard label="Largest Pos." value={<span className="text-sm">{largest?.symbol ?? '—'}</span>} sub={largest && <span className="text-[10px] text-muted-foreground font-mono">{largestPct.toFixed(0)}%</span>} />
            </div>

            {/* AI insight */}
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Brain className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">AI Portfolio Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{analysis.overallInsight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Picks */}
            {topPickHoldings.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Flame className="w-4 h-4 text-success" /> Top Picks — High Momentum</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {topPickHoldings.map((h, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-background/60 border border-border">
                        <CoinImage symbol={h.symbol} image={h.logo} size={30} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{h.symbol}</p>
                          <p className={cn("text-[11px] font-mono", h.change24h >= 0 ? "text-success" : "text-danger")}>{h.change24h >= 0 ? '+' : ''}{(h.change24h ?? 0).toFixed(2)}%</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">{fmtCompact(h.value)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Breakdowns: chain / risk / recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chain allocation */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Chain Allocation</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  {chainRows.length === 0 && <p className="text-xs text-muted-foreground">No data.</p>}
                  {chainRows.map(r => (
                    <div key={r.chain}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: chainColor(r.chain) }} />{chainLabel(r.chain)}</span>
                        <span className="text-muted-foreground font-mono">{fmtCompact(r.value)} · {r.pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: chainColor(r.chain) }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk distribution */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /> Risk Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2.5">
                  {riskRows.length === 0 && <p className="text-xs text-muted-foreground">No data.</p>}
                  {riskRows.map(r => (
                    <div key={r.level}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={cn("font-medium px-1.5 py-0.5 rounded border text-[10px]", RISK_META[r.level].className)}>{RISK_META[r.level].label}</span>
                        <span className="text-muted-foreground font-mono">{fmtCompact(r.value)} · {r.pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", r.level === 'low' ? 'bg-success' : r.level === 'medium' ? 'bg-warning' : r.level === 'high' ? 'bg-orange-500' : 'bg-danger')} style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendation summary */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> AI Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {recoRows.length === 0 && <p className="text-xs text-muted-foreground">No data.</p>}
                  {recoRows.map(r => {
                    const meta = RECO_META[r.reco];
                    const Icon = meta.icon;
                    return (
                      <div key={r.reco} className={cn("flex items-center justify-between px-2.5 py-1.5 rounded-lg border", meta.className)}>
                        <span className="text-xs font-semibold flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {meta.label}</span>
                        <span className="text-xs font-mono font-bold">{r.count}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> {analysis.warnings.length} Warning{analysis.warnings.length > 1 ? 's' : ''}</h3>
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="text-warning mt-0.5">-</span><span>{w}</span></div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="holdings">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="holdings" className="text-xs gap-1"><Wallet className="w-3.5 h-3.5" /> Holdings ({analysis.holdings.length})</TabsTrigger>
                <TabsTrigger value="signals" className="text-xs gap-1"><Brain className="w-3.5 h-3.5" /> AI Signals</TabsTrigger>
                <TabsTrigger value="charts" className="text-xs gap-1"><PieChartIcon className="w-3.5 h-3.5" /> Allocation</TabsTrigger>
                <TabsTrigger value="performance" className="text-xs gap-1"><Activity className="w-3.5 h-3.5" /> 24h Performance</TabsTrigger>
              </TabsList>

              {/* Holdings */}
              <TabsContent value="holdings" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[860px]">
                        <thead>
                          <tr className="border-b border-border text-[11px] text-muted-foreground">
                            <th className="text-left p-3 font-medium">#</th>
                            <th className="text-left p-3 font-medium">Token</th>
                            <th className="text-left p-3 font-medium">Chain</th>
                            <th className="text-right p-3 font-medium">Balance</th>
                            <th className="text-right p-3 font-medium">Price</th>
                            <th className="text-right p-3 font-medium">Value</th>
                            <th className="text-right p-3 font-medium">24h</th>
                            <th className="text-center p-3 font-medium">Risk</th>
                            <th className="text-center p-3 font-medium">AI Action</th>
                            <th className="text-right p-3 font-medium">Share</th>
                            <th className="p-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedHoldings.map((token, i) => {
                            const share = analysis.totalValue > 0 ? (token.value / analysis.totalValue) * 100 : 0;
                            const reco = RECO_META[token.recommendation] ?? RECO_META.hold;
                            const RecoIcon = reco.icon;
                            const explorer = CHAIN_EXPLORERS[token.chain];
                            const isOpen = expandedRow === i;
                            return (
                              <Fragment key={i}>
                                <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setExpandedRow(isOpen ? null : i)}>
                                  <td className="p-3 text-xs text-muted-foreground">{i + 1}</td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <CoinImage symbol={token.symbol} image={token.logo} size={28} />
                                      <div><p className="font-medium">{token.symbol}</p><p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{token.name}</p></div>
                                    </div>
                                  </td>
                                  <td className="p-3"><Badge variant="outline" className="text-[9px]" style={{ borderColor: chainColor(token.chain) + '55', color: chainColor(token.chain) }}>{chainLabel(token.chain)}</Badge></td>
                                  <td className="p-3 text-right font-mono text-xs">{(token.balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                  <td className="p-3 text-right font-mono text-xs">${token.price < 0.01 ? (token.price ?? 0).toExponential(2) : (token.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                  <td className="p-3 text-right font-mono text-xs font-medium">{fmtUsd(token.value)}</td>
                                  <td className="p-3 text-right"><span className={cn("text-xs font-mono", token.change24h >= 0 ? "text-success" : "text-danger")}>{token.change24h >= 0 ? '+' : ''}{(token.change24h ?? 0).toFixed(2)}%</span></td>
                                  <td className="p-3 text-center"><span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", (RISK_META[token.riskLevel] ?? RISK_META.medium).className)}>{(RISK_META[token.riskLevel] ?? RISK_META.medium).label}</span></td>
                                  <td className="p-3 text-center"><span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border", reco.className)}><RecoIcon className="w-3 h-3" />{reco.label}</span></td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, background: COLORS[i % COLORS.length] }} /></div>
                                      <span className="text-[10px] text-muted-foreground w-8 text-right">{share.toFixed(1)}%</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right"><ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} /></td>
                                </tr>
                                {isOpen && (
                                  <tr className="bg-muted/20 border-b border-border/50">
                                    <td colSpan={11} className="p-4">
                                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        <div className="flex-1">
                                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> AI Insight</p>
                                          <p className="text-sm text-muted-foreground leading-relaxed">{token.insight}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <div className="text-center px-3"><p className="text-[9px] text-muted-foreground uppercase">Pump</p><p className={cn("text-xs font-bold", PUMP_META[token.pumpPotential]?.className)}>{PUMP_META[token.pumpPotential]?.label}</p></div>
                                          {token.contractAddress && token.contractAddress !== 'native' && explorer && (
                                            <Button variant="outline" size="sm" className="text-[10px] gap-1 h-7" asChild>
                                              <a href={explorer(token.contractAddress)} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" /> Contract</a>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Signals */}
              <TabsContent value="signals" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sortedHoldings.slice(0, 20).map((token, i) => {
                    const reco = RECO_META[token.recommendation] ?? RECO_META.hold;
                    const RecoIcon = reco.icon;
                    return (
                      <Card key={i}>
                        <CardContent className="p-3.5">
                          <div className="flex items-center gap-2.5 mb-2">
                            <CoinImage symbol={token.symbol} image={token.logo} size={28} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{token.symbol} <span className="text-[10px] text-muted-foreground font-normal">{chainLabel(token.chain)}</span></p>
                              <p className={cn("text-[11px] font-mono", token.change24h >= 0 ? "text-success" : "text-danger")}>{token.change24h >= 0 ? '+' : ''}{(token.change24h ?? 0).toFixed(2)}% · {fmtCompact(token.value)}</p>
                            </div>
                            <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border shrink-0", reco.className)}><RecoIcon className="w-3 h-3" />{reco.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{token.insight}</p>
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/40 text-[10px]">
                            <span className="text-muted-foreground">Risk: <span className={cn("font-bold", (RISK_META[token.riskLevel] ?? RISK_META.medium).className.split(' ')[0])}>{(RISK_META[token.riskLevel] ?? RISK_META.medium).label}</span></span>
                            <span className="text-muted-foreground">Pump: <span className={cn("font-bold", PUMP_META[token.pumpPotential]?.className)}>{PUMP_META[token.pumpPotential]?.label}</span></span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Allocation charts */}
              <TabsContent value="charts" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Allocation</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: number) => fmtUsd(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Value by Token</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={pieData.slice(0, 8)} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
                            <Tooltip formatter={(v: number) => fmtUsd(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>{pieData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance */}
              <TabsContent value="performance" className="mt-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">24h Price Changes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="change" radius={[4, 4, 0, 0]}>{barData.map((e, i) => <Cell key={i} fill={e.change >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* External links */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Etherscan', url: `https://etherscan.io/address/${analysis.address}` },
                { label: 'DeBank', url: `https://debank.com/profile/${analysis.address}` },
                { label: 'Zerion', url: `https://app.zerion.io/${analysis.address}` },
                { label: 'Arkham', url: `https://platform.arkhamintelligence.com/explorer/address/${analysis.address}` },
                { label: 'Solscan', url: `https://solscan.io/account/${analysis.address}` },
              ].map(link => (
                <Button key={link.label} variant="outline" size="sm" className="text-xs gap-1" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3" /> {link.label}</a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function MyWalletScanner() {
  return (
    <ProtectedRoute>
      <ScannerContent />
    </ProtectedRoute>
  );
}
