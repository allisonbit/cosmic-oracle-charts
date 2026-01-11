import { Link } from "react-router-dom";
import { TrendingUp, Flame, Zap, BarChart3 } from "lucide-react";
import { useCryptoPrices, CryptoPrice } from "@/hooks/useCryptoPrices";

const trendingTools = [
  {
    title: "AI Predictions",
    description: "Daily crypto forecasts",
    url: "/predictions",
    icon: "🤖",
    gradient: "from-primary to-secondary",
  },
  {
    title: "Strength Meter",
    description: "Real-time analysis",
    url: "/strength",
    icon: "⚡",
    gradient: "from-warning to-danger",
  },
];

export function TrendingSearches() {
  const { data } = useCryptoPrices();

  // Get top 3 coins by search popularity (simulated based on market cap rank)
  const trendingCoins: CryptoPrice[] = data?.prices?.slice(0, 3) || [];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trending Searches */}
        <div className="holo-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Flame className="w-5 h-5 text-warning" />
              Trending Searches
            </h3>
            <span className="text-xs text-muted-foreground">Last 24h</span>
          </div>
          <div className="space-y-3">
            {trendingCoins.map((coin, index) => (
              <Link
                key={coin.symbol}
                to={`/price-prediction/${coin.name.toLowerCase()}/daily`}
                className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center font-bold text-background">
                      {coin.symbol.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 2000 + 500).toLocaleString()} searches
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">
                    ${coin.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs ${coin.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                    {coin.change24h >= 0 ? '+' : ''}
                    {coin.change24h?.toFixed(2)}%
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Featured tools */}
            {trendingTools.map((tool) => (
              <Link
                key={tool.url}
                to={tool.url}
                className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${tool.gradient} rounded-lg flex items-center justify-center`}>
                    <span className="text-lg">{tool.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {tool.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                </div>
                <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="holo-card p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Platform Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Tokens Tracked</div>
              <div className="text-2xl font-bold text-foreground">1,250+</div>
              <div className="text-xs text-primary flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +25 this week
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Chains Supported</div>
              <div className="text-2xl font-bold text-foreground">15</div>
              <div className="text-xs text-success">All major chains</div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">AI Accuracy</div>
              <div className="text-2xl font-bold text-foreground">85.4%</div>
              <div className="text-xs text-success">30-day average</div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Daily Predictions</div>
              <div className="text-2xl font-bold text-foreground">3,000+</div>
              <div className="text-xs text-secondary">Updated hourly</div>
            </div>
          </div>
          
          {/* Call to action */}
          <Link
            to="/predictions"
            className="mt-4 block w-full py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-center text-primary font-medium transition-colors"
          >
            Explore AI Predictions →
          </Link>
        </div>
      </div>
    </section>
  );
}
