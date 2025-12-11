import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Copy, CheckCircle, ExternalLink, 
  Shield, Zap, Globe, Users, BarChart3, Activity, Clock, 
  Wallet, Droplets, Building, Lock, Unlock, AlertTriangle,
  BadgeCheck, Link2, Target, Brain, Rocket, PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { SearchToken } from "@/hooks/useTokenSearch";
import { ExplorerChain, getChainById } from "@/lib/explorerChains";

interface TokenDetailPanelProps {
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

// Mock data generators for demo purposes
const generateMockHolders = () => [
  { name: 'Top 10', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Top 50', value: 25, color: 'hsl(var(--secondary))' },
  { name: 'Others', value: 40, color: 'hsl(var(--muted))' },
];

const generateMockLiquidity = () => [
  { name: 'Uniswap', value: 45, tvl: 12500000, apr: 24.5 },
  { name: 'SushiSwap', value: 20, tvl: 5500000, apr: 18.2 },
  { name: 'Curve', value: 25, tvl: 7000000, apr: 12.8 },
  { name: 'Balancer', value: 10, tvl: 2800000, apr: 15.6 },
];

const generateMockSupply = () => ({
  circulating: 65,
  locked: 20,
  team: 10,
  treasury: 5,
});

export function TokenDetailPanel({ token, chain, forecast, aiLoading }: TokenDetailPanelProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getExplorerUrl = (address: string) => {
    return `${chain.explorer}/token/${address}`;
  };

  // Generate mock chart data
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}h`,
    price: token.price * (0.97 + Math.random() * 0.06),
  }));
  chartData[chartData.length - 1].price = token.price;

  const holdersData = generateMockHolders();
  const liquidityData = generateMockLiquidity();
  const supplyData = generateMockSupply();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="holo-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {token.logo ? (
              <img 
                src={token.logo} 
                alt={token.symbol}
                className="w-16 h-16 rounded-full bg-muted"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-display font-bold text-primary text-2xl">{token.symbol[0]}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl lg:text-3xl font-bold">{token.name}</h2>
                {token.verified && <BadgeCheck className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-lg text-muted-foreground">{token.symbol}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-display">
                  {chain.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {chain.tokenStandard}
                </span>
                {token.rank && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Rank #{token.rank}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-1">
            <div className="text-3xl lg:text-4xl font-bold">{formatPrice(token.price)}</div>
            {token.change24h !== 0 && (
              <div className={cn("flex items-center gap-1 text-lg font-medium", 
                token.change24h >= 0 ? "text-success" : "text-danger"
              )}>
                {token.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}% (24h)
              </div>
            )}
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
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.open(getExplorerUrl(token.contractAddress), "_blank")}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Decimals", value: token.decimals.toString(), icon: Activity },
            { label: "Verified", value: token.verified ? "Yes" : "No", icon: Shield, color: token.verified ? "text-success" : "text-warning" },
            { label: "Standard", value: chain.tokenStandard, icon: Zap },
            { label: "Chain", value: chain.name, icon: Globe },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg bg-muted/30 text-center">
              <stat.icon className={cn("w-4 h-4 mx-auto mb-1", stat.color || "text-primary")} />
              <div className="text-[10px] text-muted-foreground font-display">{stat.label}</div>
              <div className="text-sm font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="text-xs py-2">Overview</TabsTrigger>
          <TabsTrigger value="holders" className="text-xs py-2">Holders</TabsTrigger>
          <TabsTrigger value="liquidity" className="text-xs py-2">Liquidity</TabsTrigger>
          <TabsTrigger value="defi" className="text-xs py-2">DeFi</TabsTrigger>
          <TabsTrigger value="supply" className="text-xs py-2">Supply</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Price Chart */}
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              PRICE CHART (24H)
            </h3>
            {token.price > 0 ? (
              <div className="h-64">
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
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatPrice(value), "Price"]}
                    />
                    <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Price data not available</p>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              AI ANALYSIS
            </h3>
            {aiLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p>Analyzing token...</p>
              </div>
            ) : forecast ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs font-display">TREND</span>
                  </div>
                  <p className={cn("font-bold text-lg", 
                    forecast.trend === "bullish" ? "text-success" : 
                    forecast.trend === "bearish" ? "text-danger" : "text-warning"
                  )}>
                    {forecast.trend?.toUpperCase() || 'NEUTRAL'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-danger" />
                    <span className="text-xs font-display">RISK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={forecast.riskLevel || 50} className="flex-1" />
                    <span className="text-sm font-bold">{forecast.riskLevel || 50}%</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-display">SHORT TERM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{forecast.shortTerm || 'No prediction available'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-warning" />
                    <span className="text-xs font-display">LONG TERM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{forecast.longTerm || 'No prediction available'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>AI analysis requires price data</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Holders Tab */}
        <TabsContent value="holders" className="space-y-4 mt-4">
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              HOLDER DISTRIBUTION
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={holdersData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {holdersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Holders</span>
                    <span className="font-bold">24,532</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Holder Growth (7d)</span>
                    <span className="font-bold text-success">+2.4%</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Exchange Holdings</span>
                    <span className="font-bold">18.5%</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Whale Concentration</span>
                    <span className="font-bold text-warning">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Holders */}
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              TOP HOLDERS
            </h3>
            <div className="space-y-2">
              {[
                { rank: 1, address: '0x28c6c...ea2d', balance: '8.2M', pct: 12.5, label: 'Exchange' },
                { rank: 2, address: '0x47f2a...8bc1', balance: '5.1M', pct: 7.8, label: 'Whale' },
                { rank: 3, address: '0x9e3d1...4f7a', balance: '3.8M', pct: 5.8, label: 'Smart Contract' },
                { rank: 4, address: '0x7c2b5...9d2e', balance: '2.4M', pct: 3.7, label: 'Whale' },
                { rank: 5, address: '0x5a1f8...6c3b', balance: '1.9M', pct: 2.9, label: 'Exchange' },
              ].map((holder) => (
                <div key={holder.rank} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-6">#{holder.rank}</span>
                    <code className="text-xs font-mono text-primary">{holder.address}</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{holder.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{holder.balance}</div>
                    <div className="text-xs text-muted-foreground">{holder.pct}%</div>
                  </div>
                </div>
              ))}
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
              {liquidityData.map((pool) => (
                <div key={pool.name} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{pool.name}</span>
                    <span className="text-success font-bold">{pool.apr}% APR</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>TVL: {formatNumber(pool.tvl)}</span>
                    <span>{pool.value}% of total</span>
                  </div>
                  <Progress value={pool.value} className="mt-2 h-1" />
                </div>
              ))}
            </div>
          </div>

          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4">SLIPPAGE CALCULATOR</h3>
            <div className="grid grid-cols-3 gap-3">
              {['$1K', '$10K', '$100K'].map((amount) => (
                <div key={amount} className="p-3 rounded-lg bg-muted/30 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Trade {amount}</div>
                  <div className="font-bold text-warning">
                    {amount === '$1K' ? '0.1%' : amount === '$10K' ? '0.8%' : '3.2%'}
                  </div>
                  <div className="text-xs text-muted-foreground">slippage</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* DeFi Tab */}
        <TabsContent value="defi" className="space-y-4 mt-4">
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              DEFI INTEGRATIONS
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { protocol: 'Aave', status: 'Collateral', apr: '2.4%', details: 'LTV: 75%' },
                { protocol: 'Compound', status: 'Listed', apr: '1.8%', details: 'Reserve: 10%' },
                { protocol: 'Uniswap V3', status: 'Pool', apr: '24.5%', details: 'Fee: 0.3%' },
                { protocol: 'Curve', status: 'Pool', apr: '12.8%', details: 'Gauge: Yes' },
              ].map((integration) => (
                <div key={integration.protocol} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{integration.protocol}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success">{integration.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{integration.details}</span>
                    <span className="text-success font-medium">{integration.apr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4">BRIDGE SUPPORT</h3>
            <div className="flex flex-wrap gap-2">
              {['Wormhole', 'LayerZero', 'Axelar', 'Stargate', 'Multichain'].map((bridge) => (
                <span key={bridge} className="px-3 py-1.5 rounded-full bg-muted/50 text-sm">
                  {bridge}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Supply Tab */}
        <TabsContent value="supply" className="space-y-4 mt-4">
          <div className="holo-card p-6">
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              TOKEN DISTRIBUTION
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-success" />
                    <span>Circulating</span>
                  </div>
                  <span className="font-bold">{supplyData.circulating}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-warning" />
                    <span>Locked</span>
                  </div>
                  <span className="font-bold">{supplyData.locked}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    <span>Team</span>
                  </div>
                  <span className="font-bold">{supplyData.team}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    <span>Treasury</span>
                  </div>
                  <span className="font-bold">{supplyData.treasury}%</span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-display text-muted-foreground mb-3">UPCOMING UNLOCKS</h4>
                <div className="space-y-2">
                  {[
                    { date: 'Jan 15, 2025', amount: '5M', pct: 2.5 },
                    { date: 'Apr 15, 2025', amount: '10M', pct: 5.0 },
                    { date: 'Jul 15, 2025', amount: '8M', pct: 4.0 },
                  ].map((unlock) => (
                    <div key={unlock.date} className="flex items-center justify-between p-2 rounded bg-muted/20">
                      <span className="text-xs text-muted-foreground">{unlock.date}</span>
                      <span className="text-sm font-medium">{unlock.amount} ({unlock.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* External Links */}
      <div className="holo-card p-6">
        <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          EXPLORE
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Block Explorer", url: `${chain.explorer}/token/${token.contractAddress}` },
            { name: "DexScreener", url: `https://dexscreener.com/${chain.id}/${token.contractAddress}` },
            { name: "DexTools", url: `https://www.dextools.io/app/en/${chain.id}/pair-explorer/${token.contractAddress}` },
            { name: "CoinGecko", url: token.coingeckoId ? `https://www.coingecko.com/en/coins/${token.coingeckoId}` : `https://www.coingecko.com/en/search?query=${token.symbol}` },
          ].map((link) => (
            <Button
              key={link.name}
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(link.url, "_blank")}
              disabled={!token.contractAddress && link.name !== "CoinGecko"}
            >
              <ExternalLink className="w-3 h-3" />
              {link.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
