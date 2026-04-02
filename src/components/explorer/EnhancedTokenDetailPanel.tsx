import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Copy, CheckCircle, ExternalLink, 
  Shield, Zap, Globe, Users, BarChart3, Activity, Clock, 
  Wallet, Droplets, Building, Lock, Unlock, AlertTriangle,
  BadgeCheck, Link2, Target, Brain, Rocket, PieChart, Eye,
  ArrowUpRight, ArrowDownRight, DollarSign, Flame, Star,
  Info, ChevronRight, Twitter, MessageCircle, Share2, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeButtons } from "@/components/trading/TradeButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { SearchToken } from "@/hooks/useTokenSearch";
import { ExplorerChain } from "@/lib/explorerChains";

interface EnhancedTokenDetailPanelProps {
  token: SearchToken;
  chain: ExplorerChain;
  forecast?: {
    trend?: string;
    shortTerm?: string;
    longTerm?: string;
    riskLevel?: number;
    confidence?: number;
  };
  aiLoading?: boolean;
}

function formatPrice(price: number): string {
  if (price === 0) return 'N/A';
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  if (num === 0) return '$0';
  return `$${num.toFixed(2)}`;
}

function formatNumberRaw(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(0);
}

export function EnhancedTokenDetailPanel({ token, chain, forecast, aiLoading }: EnhancedTokenDetailPanelProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [detailModal, setDetailModal] = useState<{ type: string; data: any } | null>(null);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getExplorerUrl = (address: string) => `${chain.explorer}/token/${address}`;

  // Generate mock data for demonstration
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}h`,
    price: token.price * (0.97 + Math.random() * 0.06),
    volume: Math.random() * 1000000,
  }));
  chartData[chartData.length - 1].price = token.price;

  const volumeData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    volume: Math.random() * 5000000 + 1000000,
    buys: Math.random() * 3000000,
    sells: Math.random() * 2000000,
  }));

  const mockStats = {
    marketCap: token.price * 1000000000,
    fdv: token.price * 1500000000,
    volume24h: Math.random() * 100000000 + 1000000,
    volumeChange: (Math.random() - 0.5) * 100,
    liquidity: Math.random() * 50000000 + 1000000,
    holders: Math.floor(Math.random() * 100000) + 1000,
    transactions24h: Math.floor(Math.random() * 50000) + 1000,
    buys24h: Math.floor(Math.random() * 25000) + 500,
    sells24h: Math.floor(Math.random() * 25000) + 500,
    ath: token.price * (1 + Math.random() * 2),
    atl: token.price * Math.random() * 0.3,
    athDate: '2024-03-15',
    atlDate: '2023-11-20',
  };

  const socialLinks = [
    { name: 'Website', icon: Globe, url: '#', color: 'text-primary' },
    { name: 'Twitter', icon: Twitter, url: `https://twitter.com/search?q=$${token.symbol}`, color: 'text-[#1DA1F2]' },
    { name: 'Telegram', icon: MessageCircle, url: '#', color: 'text-[#0088cc]' },
    { name: 'Discord', icon: MessageCircle, url: '#', color: 'text-[#5865F2]' },
  ];

  const externalLinks = [
    { name: chain.name + ' Explorer', url: getExplorerUrl(token.contractAddress || ''), icon: '🔍' },
  ];

  const renderStatCard = (label: string, value: string, change?: number, icon?: any, onClick?: () => void) => {
    const Icon = icon;
    return (
      <button 
        onClick={onClick}
        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all text-left w-full group"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            <span className="text-xs text-muted-foreground font-display">{label}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="font-bold text-lg">{value}</div>
        {change !== undefined && (
          <div className={cn("text-xs flex items-center gap-1", change >= 0 ? "text-success" : "text-danger")}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change >= 0 ? "+" : ""}{change.toFixed(2)}%
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Price and Actions */}
      <div className="holo-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {token.logo ? (
              <img src={token.logo} alt={token.symbol} className="w-16 h-16 rounded-full bg-muted" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-display font-bold text-primary text-2xl">{token.symbol[0]}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl lg:text-3xl font-bold">{token.name}</h2>
                {token.verified && <BadgeCheck className="w-6 h-6 text-primary" />}
                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-display">{chain.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-lg text-muted-foreground">{token.symbol}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{chain.tokenStandard}</span>
                {token.rank && <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Rank #{token.rank}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2">
            <div className="text-3xl lg:text-4xl font-bold">{formatPrice(token.price)}</div>
            {token.change24h !== 0 && (
              <div className={cn("flex items-center gap-1 text-lg font-medium", token.change24h >= 0 ? "text-success" : "text-danger")}>
                {token.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}% (24h)
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Star className="w-4 h-4" /> Watchlist
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Address */}
        {token.contractAddress && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg bg-muted/50 mb-6">
            <span className="text-xs text-muted-foreground shrink-0">Contract:</span>
            <code className="text-xs text-primary flex-1 truncate font-mono">{token.contractAddress}</code>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => copyAddress(token.contractAddress)} className="gap-1">
                {copiedAddress ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.open(getExplorerUrl(token.contractAddress), "_blank")} className="gap-1">
                <ExternalLink className="w-4 h-4" /> Explorer
              </Button>
            </div>
          </div>
        )}

        {/* Key Stats Grid - All Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {renderStatCard("Market Cap", formatNumber(mockStats.marketCap), undefined, DollarSign, () => setDetailModal({ type: 'marketCap', data: mockStats }))}
          {renderStatCard("FDV", formatNumber(mockStats.fdv), undefined, Target, () => setDetailModal({ type: 'fdv', data: mockStats }))}
          {renderStatCard("24h Volume", formatNumber(mockStats.volume24h), mockStats.volumeChange, BarChart3, () => setDetailModal({ type: 'volume', data: { ...mockStats, volumeData } }))}
          {renderStatCard("Liquidity", formatNumber(mockStats.liquidity), undefined, Droplets, () => setDetailModal({ type: 'liquidity', data: mockStats }))}
          {renderStatCard("Holders", formatNumberRaw(mockStats.holders), undefined, Users, () => setDetailModal({ type: 'holders', data: mockStats }))}
          {renderStatCard("24h Txns", formatNumberRaw(mockStats.transactions24h), undefined, Activity, () => setDetailModal({ type: 'transactions', data: mockStats }))}
        </div>
      </div>

      {/* Social & External Links */}
      <div className="holo-card p-6">
        <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          QUICK ACCESS & LINKS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {externalLinks.map((link) => (
            <Button
              key={link.name}
              variant="outline"
              size="sm"
              className="gap-1 text-xs h-auto py-2 flex-col"
              onClick={() => window.open(link.url, "_blank")}
              disabled={!token.contractAddress && !link.url.includes('coingecko')}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="truncate w-full text-center">{link.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs for Detailed Information */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="text-xs py-2">Overview</TabsTrigger>
          <TabsTrigger value="trading" className="text-xs py-2">Trading</TabsTrigger>
          <TabsTrigger value="holders" className="text-xs py-2">Holders</TabsTrigger>
          <TabsTrigger value="liquidity" className="text-xs py-2">Liquidity</TabsTrigger>
          <TabsTrigger value="security" className="text-xs py-2">Security</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs py-2">AI Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Price Chart */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                PRICE CHART (24H)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={["dataMin * 0.99", "dataMax * 1.01"]} tickFormatter={(v) => formatPrice(v)} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [formatPrice(value), "Price"]} />
                    <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Stats */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                PRICE STATISTICS
              </h3>
              <div className="space-y-3">
                <button onClick={() => setDetailModal({ type: 'ath', data: mockStats })} className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-success" />
                    <span className="text-sm">All-Time High</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success">{formatPrice(mockStats.ath)}</div>
                    <div className="text-xs text-muted-foreground">{mockStats.athDate}</div>
                  </div>
                </button>
                <button onClick={() => setDetailModal({ type: 'atl', data: mockStats })} className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-danger" />
                    <span className="text-sm">All-Time Low</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-danger">{formatPrice(mockStats.atl)}</div>
                    <div className="text-xs text-muted-foreground">{mockStats.atlDate}</div>
                  </div>
                </button>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-2">Price from ATH</div>
                  <Progress value={((mockStats.ath - token.price) / mockStats.ath) * 100} className="h-2" />
                  <div className="text-xs text-danger mt-1">-{(((mockStats.ath - token.price) / mockStats.ath) * 100).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              7-DAY VOLUME (BUYS VS SELLS)
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value: number) => [formatNumber(value), ""]} />
                  <Bar dataKey="buys" fill="hsl(var(--success))" name="Buys" />
                  <Bar dataKey="sells" fill="hsl(var(--danger))" name="Sells" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                24H TRADING ACTIVITY
              </h3>
              <div className="space-y-3">
                <button onClick={() => setDetailModal({ type: 'buys', data: mockStats })} className="w-full flex items-center justify-between p-3 rounded-lg bg-success/10 hover:bg-success/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-success" />
                    <span className="text-sm">Buy Transactions</span>
                  </div>
                  <span className="font-bold text-success">{mockStats.buys24h.toLocaleString()}</span>
                </button>
                <button onClick={() => setDetailModal({ type: 'sells', data: mockStats })} className="w-full flex items-center justify-between p-3 rounded-lg bg-danger/10 hover:bg-danger/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-danger" />
                    <span className="text-sm">Sell Transactions</span>
                  </div>
                  <span className="font-bold text-danger">{mockStats.sells24h.toLocaleString()}</span>
                </button>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-2">Buy/Sell Ratio</div>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    <div className="bg-success" style={{ width: `${(mockStats.buys24h / mockStats.transactions24h) * 100}%` }} />
                    <div className="bg-danger" style={{ width: `${(mockStats.sells24h / mockStats.transactions24h) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-success">{((mockStats.buys24h / mockStats.transactions24h) * 100).toFixed(1)}%</span>
                    <span className="text-danger">{((mockStats.sells24h / mockStats.transactions24h) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                TOP DEX PAIRS
              </h3>
              <div className="space-y-2">
                {[
                  { pair: `${token.symbol}/WETH`, dex: 'Uniswap V3', volume: 2500000, liquidity: 8500000 },
                  { pair: `${token.symbol}/USDC`, dex: 'Uniswap V3', volume: 1800000, liquidity: 5200000 },
                  { pair: `${token.symbol}/USDT`, dex: 'SushiSwap', volume: 950000, liquidity: 2800000 },
                ].map((pair) => (
                  <button
                    key={pair.pair}
                    onClick={() => setDetailModal({ type: 'pair', data: pair })}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{pair.pair}</div>
                      <div className="text-xs text-muted-foreground">{pair.dex}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Vol: {formatNumber(pair.volume)}</div>
                      <div className="text-xs text-muted-foreground">Liq: {formatNumber(pair.liquidity)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Holders Tab */}
        <TabsContent value="holders" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                HOLDER DISTRIBUTION
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={[
                        { name: 'Top 10', value: 35, color: 'hsl(var(--primary))' },
                        { name: 'Top 50', value: 25, color: 'hsl(var(--secondary))' },
                        { name: 'Others', value: 40, color: 'hsl(var(--muted))' },
                      ]}
                      cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {[
                        { color: 'hsl(var(--primary))' },
                        { color: 'hsl(var(--secondary))' },
                        { color: 'hsl(var(--muted))' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                TOP HOLDERS
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[
                  { rank: 1, address: '0x28c6c...ea2d', balance: '8.2M', pct: 12.5, label: 'Exchange' },
                  { rank: 2, address: '0x47f2a...8bc1', balance: '5.1M', pct: 7.8, label: 'Whale' },
                  { rank: 3, address: '0x9e3d1...4f7a', balance: '3.8M', pct: 5.8, label: 'Contract' },
                  { rank: 4, address: '0x7c2b5...9d2e', balance: '2.4M', pct: 3.7, label: 'Whale' },
                  { rank: 5, address: '0x5a1f8...6c3b', balance: '1.9M', pct: 2.9, label: 'Exchange' },
                ].map((holder) => (
                  <button
                    key={holder.rank}
                    onClick={() => setDetailModal({ type: 'holder', data: holder })}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">#{holder.rank}</span>
                      <code className="text-xs font-mono text-primary">{holder.address}</code>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{holder.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold">{holder.balance}</div>
                      <div className="text-[10px] text-muted-foreground">{holder.pct}%</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Liquidity Tab */}
        <TabsContent value="liquidity" className="space-y-4 mt-4">
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              LIQUIDITY POOLS
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Uniswap V3', value: 45, tvl: 12500000, apr: 24.5, fee: '0.3%' },
                { name: 'SushiSwap', value: 20, tvl: 5500000, apr: 18.2, fee: '0.25%' },
                { name: 'Curve', value: 25, tvl: 7000000, apr: 12.8, fee: '0.04%' },
                { name: 'Balancer', value: 10, tvl: 2800000, apr: 15.6, fee: '0.3%' },
              ].map((pool) => (
                <button
                  key={pool.name}
                  onClick={() => setDetailModal({ type: 'pool', data: pool })}
                  className="w-full p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{pool.name}</span>
                    <span className="text-success font-bold">{pool.apr}% APR</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>TVL: {formatNumber(pool.tvl)}</span>
                    <span>Fee: {pool.fee}</span>
                    <span>{pool.value}% of total</span>
                  </div>
                  <Progress value={pool.value} className="mt-2 h-1" />
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                SECURITY SCORE
              </h3>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-success mb-2">85</div>
                <div className="text-sm text-muted-foreground">Out of 100</div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Contract Verified', status: true },
                  { label: 'No Mint Function', status: true },
                  { label: 'Liquidity Locked', status: true },
                  { label: 'No Proxy Contract', status: false },
                  { label: 'Ownership Renounced', status: false },
                ].map((check) => (
                  <div key={check.label} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm">{check.label}</span>
                    {check.status ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                AUDIT & VERIFICATION
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'TokenSniffer', score: '85/100', url: `https://tokensniffer.com/token/${chain.id}/${token.contractAddress}` },
                  { name: 'GoPlus Security', score: 'Safe', url: `https://gopluslabs.io/token-security/${chain.id}/${token.contractAddress}` },
                  { name: 'De.Fi Scanner', score: 'Low Risk', url: `https://de.fi/scanner/contract/${token.contractAddress}` },
                  { name: 'Honeypot Check', score: 'Passed', url: `https://honeypot.is/${chain.id}?address=${token.contractAddress}` },
                ].map((audit) => (
                  <button
                    key={audit.name}
                    onClick={() => window.open(audit.url, "_blank")}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{audit.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-success font-medium">{audit.score}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              AI-POWERED ANALYSIS
            </h3>
            {aiLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Analyzing token...</p>
              </div>
            ) : forecast ? (
              <div className="grid md:grid-cols-2 gap-4">
                <button onClick={() => setDetailModal({ type: 'trend', data: forecast })} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs font-display">TREND ANALYSIS</span>
                  </div>
                  <p className={cn("font-bold text-lg", forecast.trend === "bullish" ? "text-success" : forecast.trend === "bearish" ? "text-danger" : "text-warning")}>
                    {forecast.trend?.toUpperCase() || 'NEUTRAL'}
                  </p>
                </button>
                <button onClick={() => setDetailModal({ type: 'risk', data: forecast })} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-danger" />
                    <span className="text-xs font-display">RISK LEVEL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={forecast.riskLevel || 50} className="flex-1" />
                    <span className="text-sm font-bold">{forecast.riskLevel || 50}%</span>
                  </div>
                </button>
                <button onClick={() => setDetailModal({ type: 'shortTerm', data: forecast })} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-display">SHORT TERM (24-48H)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{forecast.shortTerm || 'No prediction available'}</p>
                </button>
                <button onClick={() => setDetailModal({ type: 'longTerm', data: forecast })} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-warning" />
                    <span className="text-xs font-display">LONG TERM (7D+)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{forecast.longTerm || 'No prediction available'}</p>
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>AI analysis requires price data</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
