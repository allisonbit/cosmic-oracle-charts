import { Layout } from "@/components/layout/Layout";
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Sample chart data
const btcData = [
  { time: "00:00", price: 66500 },
  { time: "04:00", price: 66800 },
  { time: "08:00", price: 67200 },
  { time: "12:00", price: 67000 },
  { time: "16:00", price: 67500 },
  { time: "20:00", price: 67842 },
  { time: "24:00", price: 68100 },
];

const ethData = [
  { time: "00:00", price: 3480 },
  { time: "04:00", price: 3510 },
  { time: "08:00", price: 3540 },
  { time: "12:00", price: 3500 },
  { time: "16:00", price: 3490 },
  { time: "20:00", price: 3521 },
  { time: "24:00", price: 3550 },
];

const solData = [
  { time: "00:00", price: 135 },
  { time: "04:00", price: 138 },
  { time: "08:00", price: 140 },
  { time: "12:00", price: 139 },
  { time: "16:00", price: 141 },
  { time: "20:00", price: 142 },
  { time: "24:00", price: 145 },
];

const coins = [
  { symbol: "BTC", name: "Bitcoin", price: 67842, change: 2.34, trend: "BULLISH", strength: "Strong", data: btcData },
  { symbol: "ETH", name: "Ethereum", price: 3521.80, change: -0.87, trend: "NEUTRAL", strength: "Moderate", data: ethData },
  { symbol: "SOL", name: "Solana", price: 142.30, change: 5.67, trend: "BULLISH", strength: "Strong", data: solData },
];

function CryptoChart({ data, isPositive }: { data: typeof btcData; isPositive: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
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
          stroke={isPositive ? "hsl(160, 84%, 39%)" : "hsl(0, 84%, 60%)"}
          strokeWidth={2}
          fill={isPositive ? "url(#colorPositive)" : "url(#colorNegative)"}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold">
            <span className="text-gradient-cosmic">FORECAST</span> DASHBOARD
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time AI predictions and market analysis in beautiful holographic displays
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Market Cap", value: "$2.45T", icon: BarChart3, change: "+1.2%" },
            { label: "24h Volume", value: "$89.2B", icon: Activity, change: "+5.8%" },
            { label: "Active Coins", value: "12,847", icon: Zap, change: "+124" },
            { label: "AI Accuracy", value: "87.3%", icon: TrendingUp, change: "+0.5%" },
          ].map((stat) => (
            <div key={stat.label} className="holo-card p-4 text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xs text-muted-foreground font-display uppercase">{stat.label}</div>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-success">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Coin Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coins.map((coin) => (
            <div key={coin.symbol} className="holo-card p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-primary">{coin.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{coin.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${coin.price.toLocaleString()}</div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium justify-end",
                    coin.change >= 0 ? "text-success" : "text-danger"
                  )}>
                    {coin.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {coin.change >= 0 ? "+" : ""}{coin.change}%
                  </div>
                </div>
              </div>

              {/* Chart */}
              <CryptoChart data={coin.data} isPositive={coin.change >= 0} />

              {/* Predictions */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground font-display">TREND</div>
                  <div className={cn(
                    "text-sm font-bold",
                    coin.trend === "BULLISH" ? "text-success" : coin.trend === "BEARISH" ? "text-danger" : "text-warning"
                  )}>
                    {coin.trend}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground font-display">STRENGTH</div>
                  <div className="text-sm font-bold text-foreground">{coin.strength}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground font-display">24H</div>
                  <div className={cn(
                    "text-sm font-bold",
                    coin.change >= 0 ? "text-success" : "text-danger"
                  )}>
                    {coin.change >= 0 ? "UP" : "DOWN"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Heat Map Section */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">
            MARKET <span className="glow-text">HEAT MAP</span>
          </h2>
          <div className="holo-card p-6">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {[
                { symbol: "BTC", heat: 85 },
                { symbol: "ETH", heat: 45 },
                { symbol: "SOL", heat: 92 },
                { symbol: "BNB", heat: 60 },
                { symbol: "XRP", heat: 30 },
                { symbol: "ADA", heat: 70 },
                { symbol: "DOGE", heat: 95 },
                { symbol: "DOT", heat: 25 },
                { symbol: "AVAX", heat: 78 },
                { symbol: "MATIC", heat: 55 },
                { symbol: "LINK", heat: 65 },
                { symbol: "UNI", heat: 40 },
                { symbol: "ATOM", heat: 58 },
                { symbol: "LTC", heat: 35 },
                { symbol: "TRX", heat: 50 },
                { symbol: "NEAR", heat: 82 },
              ].map((coin) => (
                <div
                  key={coin.symbol}
                  className="aspect-square rounded-lg flex items-center justify-center font-display font-bold text-sm transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    background: coin.heat > 70
                      ? `hsl(160 84% ${20 + coin.heat * 0.3}% / 0.8)`
                      : coin.heat > 40
                        ? `hsl(38 92% ${30 + coin.heat * 0.2}% / 0.6)`
                        : `hsl(0 84% ${25 + coin.heat * 0.2}% / 0.6)`,
                    boxShadow: coin.heat > 70
                      ? "0 0 15px hsl(160 84% 39% / 0.5)"
                      : "none",
                  }}
                >
                  {coin.symbol}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-danger/60" />
                <span className="text-muted-foreground">Cold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning/60" />
                <span className="text-muted-foreground">Warm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/80" />
                <span className="text-muted-foreground">Hot</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
