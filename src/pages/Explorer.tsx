import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Activity, BarChart3, Shield, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const sampleData = [
  { time: "1D", price: 67200 },
  { time: "2D", price: 66800 },
  { time: "3D", price: 67500 },
  { time: "4D", price: 68000 },
  { time: "5D", price: 67300 },
  { time: "6D", price: 67800 },
  { time: "7D", price: 67842 },
];

const popularTokens = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "XRP", name: "Ripple" },
  { symbol: "ADA", name: "Cardano" },
];

const ExplorerPage = () => {
  const [searchQuery, setSearchQuery] = useState("BTC");
  const [selectedToken] = useState({
    symbol: "BTC",
    name: "Bitcoin",
    price: 67842.50,
    change24h: 2.34,
    change7d: 5.67,
    volume: "38.2B",
    marketCap: "1.34T",
    volatility: "Medium",
    sentiment: "Bullish",
    support: 65000,
    resistance: 70000,
    forecast: "Up",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold">
            TOKEN <span className="glow-text">EXPLORER</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Search any token to view price, forecast, and analysis
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search token name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-muted/50 border-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {popularTokens.map((token) => (
              <Button
                key={token.symbol}
                variant={searchQuery === token.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchQuery(token.symbol)}
              >
                {token.symbol}
              </Button>
            ))}
          </div>
        </div>

        {/* Token Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="holo-card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="font-display font-bold text-primary">{selectedToken.symbol[0]}</span>
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold">{selectedToken.name}</h2>
                      <span className="text-muted-foreground">{selectedToken.symbol}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">${selectedToken.price.toLocaleString()}</div>
                  <div className={cn(
                    "flex items-center gap-1 justify-end",
                    selectedToken.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {selectedToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h}% (24h)
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sampleData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="hsl(200, 30%, 60%)" fontSize={12} />
                    <YAxis stroke="hsl(200, 30%, 60%)" fontSize={12} domain={["dataMin - 500", "dataMax + 500"]} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(230, 30%, 8%)",
                        border: "1px solid hsl(190, 100%, 50%, 0.3)",
                        borderRadius: "8px",
                        color: "hsl(200, 100%, 95%)",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(190, 100%, 50%)"
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "24h Volume", value: `$${selectedToken.volume}`, icon: BarChart3 },
                { label: "Market Cap", value: `$${selectedToken.marketCap}`, icon: Activity },
                { label: "7d Change", value: `+${selectedToken.change7d}%`, icon: TrendingUp, color: "text-success" },
                { label: "Volatility", value: selectedToken.volatility, icon: Zap },
              ].map((stat) => (
                <div key={stat.label} className="holo-card p-4 text-center">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground font-display">{stat.label}</div>
                  <div className={cn("text-lg font-bold", stat.color || "text-foreground")}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Forecast */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                AI FORECAST
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="text-success font-display text-2xl font-bold">{selectedToken.sentiment}</div>
                  <div className="text-sm text-muted-foreground">Overall Sentiment</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground font-display">24H PREDICTION</div>
                    <div className={cn(
                      "text-lg font-bold",
                      selectedToken.forecast === "Up" ? "text-success" : "text-danger"
                    )}>
                      {selectedToken.forecast === "Up" ? "↑ UP" : "↓ DOWN"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground font-display">STRENGTH</div>
                    <div className="text-lg font-bold text-foreground">Strong</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support/Resistance */}
            <div className="holo-card p-6">
              <h3 className="font-display font-bold mb-4">TRADING RANGE</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Resistance</span>
                    <span className="text-danger font-bold">${selectedToken.resistance.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-danger/30 rounded-full" />
                </div>
                <div className="text-center py-2">
                  <span className="text-primary font-bold">${selectedToken.price.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm ml-2">Current</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Support</span>
                    <span className="text-success font-bold">${selectedToken.support.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-success/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExplorerPage;
