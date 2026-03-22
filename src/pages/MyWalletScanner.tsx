import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Wallet, Loader2, TrendingUp, TrendingDown, AlertTriangle, Shield, ExternalLink, Copy, Check, PieChart as PieChartIcon, BarChart3, Activity, Zap, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SEO } from "@/components/MainSEO";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  value_usd: number;
  price: number;
  change_24h: number;
}

interface WalletAnalysis {
  address: string;
  totalValue: number;
  holdings: TokenHolding[];
  riskScore: number;
  diversificationScore: number;
  insight: string;
  warnings: string[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)', 'hsl(200 80% 50%)', 'hsl(350 80% 55%)', 'hsl(170 60% 45%)', 'hsl(var(--accent))'];

const EXAMPLE_WALLETS = [
  { label: 'Vitalik', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  { label: 'Whale 1', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18' },
];

function ScannerContent() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);

  const scanWallet = async (addr?: string) => {
    const target = addr || address.trim();
    if (!target) { toast.error("Enter a wallet address"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-scanner", {
        body: { address: target },
      });
      if (error) throw error;
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

  const pieData = analysis?.holdings.filter(h => h.value_usd > 0).slice(0, 8).map(h => ({
    name: h.symbol, value: parseFloat(h.value_usd.toFixed(2)),
  })) || [];

  const barData = analysis?.holdings.filter(h => h.change_24h !== 0).slice(0, 10).map(h => ({
    name: h.symbol, change: parseFloat(h.change_24h.toFixed(2)),
  })) || [];

  const topGainer = analysis?.holdings.reduce((a, b) => (a.change_24h > b.change_24h ? a : b), analysis.holdings[0]);
  const topLoser = analysis?.holdings.reduce((a, b) => (a.change_24h < b.change_24h ? a : b), analysis.holdings[0]);
  const stablecoins = analysis?.holdings.filter(h => ['USDT', 'USDC', 'DAI', 'BUSD'].includes(h.symbol.toUpperCase()));
  const stablePct = analysis ? ((stablecoins?.reduce((s, h) => s + h.value_usd, 0) || 0) / Math.max(analysis.totalValue, 1)) * 100 : 0;

  return (
    <Layout>
      <SEO title="Wallet Scanner – Analyze Any Crypto Wallet" description="Deep-scan any wallet address for holdings, risk score, AI insights, and portfolio analytics." />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/20">
            <Wallet className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wallet Scanner</h1>
            <p className="text-sm text-muted-foreground">Deep analysis of any wallet — holdings, risk & AI insights</p>
          </div>
        </div>

        {/* Search */}
        <Card className="border-primary/20">
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
                <Button key={w.label} variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => scanWallet(w.address)}>
                  {w.label}
                </Button>
              ))}
              {scanHistory.length > 0 && (
                <>
                  <span className="text-[10px] text-muted-foreground ml-2">Recent:</span>
                  {scanHistory.map((h, i) => (
                    <Button key={i} variant="ghost" size="sm" className="text-[10px] h-6 px-2 font-mono" onClick={() => scanWallet(h)}>
                      {h.slice(0, 6)}...{h.slice(-4)}
                    </Button>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <div className="space-y-5">
            {/* Address Bar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <span className="text-xs text-muted-foreground">Address:</span>
              <span className="text-xs font-mono text-foreground truncate">{analysis.address}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={copyAddress}>
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <Card className="border-border"><CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Total Value</p>
                <p className="text-lg font-bold font-mono">${analysis.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </CardContent></Card>
              <Card className="border-border"><CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Tokens</p>
                <p className="text-lg font-bold font-mono">{analysis.holdings.length}</p>
              </CardContent></Card>
              <Card className={cn("border-border", getRiskBg(analysis.riskScore))}><CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Risk Score</p>
                <p className={cn("text-lg font-bold", getRiskColor(analysis.riskScore))}>{analysis.riskScore}/100</p>
                <Badge variant="outline" className="text-[8px]">{getRiskLabel(analysis.riskScore)}</Badge>
              </CardContent></Card>
              <Card className="border-border"><CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Diversity</p>
                <p className="text-lg font-bold font-mono">{analysis.diversificationScore}/100</p>
              </CardContent></Card>
              <Card className="border-border"><CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Top Gainer</p>
                <p className="text-sm font-bold text-success">{topGainer?.symbol}</p>
                <p className="text-xs text-success font-mono">+{topGainer?.change_24h.toFixed(1)}%</p>
              </CardContent></Card>
              <Card className="border-border"><CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Stablecoin %</p>
                <p className="text-lg font-bold font-mono">{stablePct.toFixed(1)}%</p>
              </CardContent></Card>
            </div>

            {/* AI Insight */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">AI Portfolio Analysis</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{analysis.insight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" /> {analysis.warnings.length} Warning{analysis.warnings.length > 1 ? 's' : ''}
                  </h3>
                  {analysis.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-warning mt-0.5">⚠</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="holdings">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="holdings" className="text-xs gap-1"><Wallet className="w-3.5 h-3.5" /> Holdings ({analysis.holdings.length})</TabsTrigger>
                <TabsTrigger value="charts" className="text-xs gap-1"><PieChartIcon className="w-3.5 h-3.5" /> Charts</TabsTrigger>
                <TabsTrigger value="performance" className="text-xs gap-1"><Activity className="w-3.5 h-3.5" /> 24h Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="holdings" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">#</th>
                            <th className="text-left p-3 text-xs text-muted-foreground font-medium">Token</th>
                            <th className="text-right p-3 text-xs text-muted-foreground font-medium">Balance</th>
                            <th className="text-right p-3 text-xs text-muted-foreground font-medium">Price</th>
                            <th className="text-right p-3 text-xs text-muted-foreground font-medium">Value</th>
                            <th className="text-right p-3 text-xs text-muted-foreground font-medium">24h</th>
                            <th className="text-right p-3 text-xs text-muted-foreground font-medium">Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.holdings.sort((a, b) => b.value_usd - a.value_usd).map((token, i) => {
                            const share = analysis.totalValue > 0 ? (token.value_usd / analysis.totalValue) * 100 : 0;
                            return (
                              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                <td className="p-3 text-xs text-muted-foreground">{i + 1}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}>
                                      {token.symbol.slice(0, 2)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{token.symbol}</p>
                                      <p className="text-[10px] text-muted-foreground">{token.name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-right font-mono text-xs">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                <td className="p-3 text-right font-mono text-xs">${token.price < 0.01 ? token.price.toExponential(2) : token.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                <td className="p-3 text-right font-mono text-xs font-medium">${token.value_usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                <td className="p-3 text-right">
                                  <span className={cn("text-xs font-mono", token.change_24h >= 0 ? "text-success" : "text-danger")}>
                                    {token.change_24h >= 0 ? '+' : ''}{token.change_24h.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center gap-1 justify-end">
                                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, background: COLORS[i % COLORS.length] }} />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground w-8 text-right">{share.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Allocation</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}
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
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Value by Token</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={pieData.slice(0, 8)} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {pieData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">24h Price Changes</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                          <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                            {barData.map((e, i) => <Cell key={i} fill={e.change >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* External Links */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Etherscan', url: `https://etherscan.io/address/${analysis.address}` },
                { label: 'DeBank', url: `https://debank.com/profile/${analysis.address}` },
                { label: 'Zerion', url: `https://app.zerion.io/${analysis.address}` },
                { label: 'Arkham', url: `https://platform.arkhamintelligence.com/explorer/address/${analysis.address}` },
              ].map(link => (
                <Button key={link.label} variant="outline" size="sm" className="text-xs gap-1" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" /> {link.label}
                  </a>
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
