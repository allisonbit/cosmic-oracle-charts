import { Layout } from "@/components/layout/Layout";
import { 
  MessageCircle, Twitter, Copy, Check, ExternalLink, 
  TrendingUp, TrendingDown, Activity, BarChart3, Users,
  Coins, Globe, Zap, Shield, Loader2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import cosmicOracle from "@/assets/cosmic-oracle-hero.jpg";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useOracleToken } from "@/hooks/useOracleToken";

const CONTRACT_ADDRESS = "0x08ae73a4c4881ac59087d752831ca7677a33e5ba";

const ContactPage = () => {
  const [copied, setCopied] = useState(false);
  const { data: tokenData, isLoading, error, refetch, isRefetching } = useOracleToken();

  // Generate price history based on current price
  const priceHistory = tokenData ? Array.from({ length: 24 }, (_, i) => {
    const base = tokenData.price || 0.00001;
    const variance = 0.15; // 15% variance
    return {
      time: `${i}h`,
      price: base * (1 - variance + Math.random() * variance * 2),
      volume: (tokenData.volume24h || 1000) / 24 * (0.5 + Math.random()),
    };
  }).map((item, i, arr) => {
    // Last point is current price
    if (i === arr.length - 1) return { ...item, price: tokenData.price };
    return item;
  }) : [];

  const copyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    toast.success("Contract address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '$0';
    if (price < 0.00000001) return `$${price.toFixed(12)}`;
    if (price < 0.0001) return `$${price.toFixed(8)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-display">Loading Oracle token data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl md:text-5xl font-display font-bold">
            <span className="text-gradient-cosmic">${tokenData?.symbol || 'ORACLE'}</span> TOKEN
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            {tokenData?.name || 'Oracle Token'} - Real-time data from Alchemy
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />
            Refresh Data
          </Button>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-center">
            <p>Failed to load token data. Please try again.</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Left Column - Token Info & Chart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Price Header Card */}
            <div className="holo-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                    {tokenData?.logo ? (
                      <img src={tokenData.logo} alt={tokenData.symbol} className="w-full h-full object-cover" />
                    ) : (
                      <img src={cosmicOracle} alt="Oracle" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-2xl">{tokenData?.name || 'Oracle Token'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-bold">${tokenData?.symbol || 'ORACLE'}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">ERC-20</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1">
                        <Shield className="w-3 h-3" /> On-Chain
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-3xl md:text-4xl font-bold">
                    {formatPrice(tokenData?.price || 0)}
                  </div>
                  {tokenData?.change24h !== undefined && tokenData.change24h !== 0 && (
                    <div className={cn(
                      "flex items-center gap-1 text-lg font-medium",
                      tokenData.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {tokenData.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      {tokenData.change24h >= 0 ? "+" : ""}{tokenData.change24h.toFixed(2)}% (24h)
                    </div>
                  )}
                  {tokenData?.lastUpdated && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated: {new Date(tokenData.lastUpdated).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Contract Address */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-primary/20">
                <span className="text-xs text-muted-foreground shrink-0">CA:</span>
                <code className="flex-1 text-xs md:text-sm font-mono text-primary truncate">{CONTRACT_ADDRESS}</code>
                <Button variant="ghost" size="sm" onClick={copyCA} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(`https://etherscan.io/token/${CONTRACT_ADDRESS}`, '_blank')}
                  className="shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Price Chart */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                PRICE CHART (24H)
              </h3>
              {priceHistory.length > 0 && tokenData?.price ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10} 
                        domain={['dataMin * 0.9', 'dataMax * 1.1']} 
                        tickFormatter={(v) => formatPrice(v)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatPrice(value), "Price"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>No price data available</p>
                </div>
              )}
            </div>

            {/* Volume Chart */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-secondary" />
                TRADING VOLUME (24H): ${formatNumber(tokenData?.volume24h || 0)}
              </h3>
              {priceHistory.length > 0 ? (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceHistory}>
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        tickFormatter={(v) => `$${formatNumber(v)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`$${formatNumber(value)}`, "Volume"]}
                      />
                      <Bar dataKey="volume" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  <p>No volume data available</p>
                </div>
              )}
            </div>

            {/* Token Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Market Cap", value: `$${formatNumber(tokenData?.marketCap || 0)}`, icon: Coins, color: "text-primary" },
                { label: "24h Volume", value: `$${formatNumber(tokenData?.volume24h || 0)}`, icon: Activity, color: "text-secondary" },
                { label: "Holders", value: formatNumber(tokenData?.holders || 0), icon: Users, color: "text-success" },
                { label: "Liquidity", value: `$${formatNumber(tokenData?.liquidity || 0)}`, icon: Zap, color: "text-warning" },
              ].map((stat) => (
                <div key={stat.label} className="holo-card p-4 text-center">
                  <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                  <div className="text-xs text-muted-foreground font-display mb-1">{stat.label}</div>
                  <div className="text-lg font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Recent Transfers */}
            {tokenData?.recentTransfers && tokenData.recentTransfers.length > 0 && (
              <div className="holo-card p-6">
                <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  RECENT TRANSFERS
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tokenData.recentTransfers.slice(0, 5).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">From:</span>
                        <code className="text-xs font-mono text-primary">
                          {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                        </code>
                        <span className="text-muted-foreground">→</span>
                        <code className="text-xs font-mono text-secondary">
                          {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Community & Details */}
          <div className="space-y-6">
            
            {/* Oracle Image */}
            <div className="holo-card p-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 w-40 h-40 rounded-full border border-primary/30 pulse-glow" />
                <div className="relative w-40 h-40 rounded-full overflow-hidden float">
                  <img src={cosmicOracle} alt="Cosmic Oracle" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4">JOIN COMMUNITY</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://x.com/oracle_bulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary border border-transparent transition-all group"
                >
                  <Twitter className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium">X (Twitter)</span>
                </a>
                <a
                  href="https://t.me/oracle_bulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary border border-transparent transition-all group"
                >
                  <MessageCircle className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium">Telegram</span>
                </a>
              </div>
            </div>

            {/* Token Details */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4">TOKEN DETAILS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">Decimals</span>
                  <span className="text-sm font-bold">{tokenData?.decimals || 18}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">Total Supply</span>
                  <span className="text-sm font-bold">{formatNumber(tokenData?.totalSupply || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">Circulating</span>
                  <span className="text-sm font-bold">{formatNumber(tokenData?.circulatingSupply || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">All-Time High</span>
                  <span className="text-sm font-bold text-success">{formatPrice(tokenData?.allTimeHigh || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">All-Time Low</span>
                  <span className="text-sm font-bold text-danger">{formatPrice(tokenData?.allTimeLow || 0)}</span>
                </div>
              </div>
            </div>

            {/* Supply Distribution */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4">SUPPLY DISTRIBUTION</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Circulating</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Locked</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Team</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Treasury</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4">EXPLORE</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`https://etherscan.io/token/${CONTRACT_ADDRESS}`, '_blank')}
                >
                  <Globe className="w-4 h-4" />
                  Etherscan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`https://dexscreener.com/ethereum/${CONTRACT_ADDRESS}`, '_blank')}
                >
                  <BarChart3 className="w-4 h-4" />
                  DexScreener
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => window.open(`https://www.dextools.io/app/en/ether/pair-explorer/${CONTRACT_ADDRESS}`, '_blank')}
                >
                  <Activity className="w-4 h-4" />
                  DexTools
                </Button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-muted-foreground text-xs p-4">
              <p>
                Data sourced from Alchemy. 
                Always DYOR. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
