import { Layout } from "@/components/layout/Layout";
import { 
  MessageCircle, Twitter, Copy, Check, ExternalLink, 
  TrendingUp, TrendingDown, Activity, BarChart3, Users,
  Coins, Globe, Zap, Shield, Clock, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import cosmicOracle from "@/assets/cosmic-oracle-hero.jpg";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const CONTRACT_ADDRESS = "0x08ae73a4c4881ac59087d752831ca7677a33e5ba";
const TOKEN_SYMBOL = "$ORACLE";
const TOKEN_NAME = "Oracle Token";

// Token data (will be fetched from API in production)
interface TokenData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  liquidity: number;
  totalSupply: number;
  circulatingSupply: number;
  allTimeHigh: number;
  allTimeLow: number;
}

const ContactPage = () => {
  const [copied, setCopied] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData>({
    price: 0.00042,
    change24h: 12.5,
    volume24h: 156000,
    marketCap: 420000,
    holders: 1250,
    liquidity: 85000,
    totalSupply: 1000000000,
    circulatingSupply: 650000000,
    allTimeHigh: 0.0012,
    allTimeLow: 0.00008,
  });

  // Generate mock price history
  const [priceHistory] = useState(() => {
    const base = 0.00042;
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: base * (0.85 + Math.random() * 0.3),
      volume: Math.random() * 20000 + 5000,
    })).map((item, i, arr) => {
      if (i === arr.length - 1) return { ...item, price: base };
      return item;
    });
  });

  const copyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    toast.success("Contract address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number) => {
    if (price < 0.0001) return `$${price.toFixed(8)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl md:text-5xl font-display font-bold">
            <span className="text-gradient-cosmic">{TOKEN_SYMBOL}</span> TOKEN
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            The native token powering the Oracle ecosystem
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Left Column - Token Info & Chart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Price Header Card */}
            <div className="holo-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                    <img src={cosmicOracle} alt="Oracle" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-2xl">{TOKEN_NAME}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-bold">{TOKEN_SYMBOL}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">ERC-20</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-3xl md:text-4xl font-bold">{formatPrice(tokenData.price)}</div>
                  <div className={cn(
                    "flex items-center gap-1 text-lg font-medium",
                    tokenData.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {tokenData.change24h >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {tokenData.change24h >= 0 ? "+" : ""}{tokenData.change24h.toFixed(2)}% (24h)
                  </div>
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
                      domain={['dataMin * 0.95', 'dataMax * 1.05']} 
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
            </div>

            {/* Volume Chart */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-secondary" />
                TRADING VOLUME (24H)
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceHistory}>
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
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
            </div>

            {/* Token Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Market Cap", value: `$${formatNumber(tokenData.marketCap)}`, icon: Coins, color: "text-primary" },
                { label: "24h Volume", value: `$${formatNumber(tokenData.volume24h)}`, icon: Activity, color: "text-secondary" },
                { label: "Holders", value: formatNumber(tokenData.holders), icon: Users, color: "text-success" },
                { label: "Liquidity", value: `$${formatNumber(tokenData.liquidity)}`, icon: Zap, color: "text-warning" },
              ].map((stat) => (
                <div key={stat.label} className="holo-card p-4 text-center">
                  <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                  <div className="text-xs text-muted-foreground font-display mb-1">{stat.label}</div>
                  <div className="text-lg font-bold">{stat.value}</div>
                </div>
              ))}
            </div>
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
                  <span className="text-xs text-muted-foreground">Total Supply</span>
                  <span className="text-sm font-bold">{formatNumber(tokenData.totalSupply)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">Circulating</span>
                  <span className="text-sm font-bold">{formatNumber(tokenData.circulatingSupply)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">All-Time High</span>
                  <span className="text-sm font-bold text-success">{formatPrice(tokenData.allTimeHigh)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">All-Time Low</span>
                  <span className="text-sm font-bold text-danger">{formatPrice(tokenData.allTimeLow)}</span>
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
                Oracle is a community-driven platform. 
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
