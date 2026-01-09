import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, ChevronRight, BarChart3 } from "lucide-react";
import { TOP_50_CRYPTOS } from "@/lib/extendedCryptos";

interface AssetPredictionLinksProps {
  assets?: string[];
  title?: string;
  className?: string;
}

export function AssetPredictionLinks({ 
  assets = [], 
  title = "Related Asset Predictions",
  className = ""
}: AssetPredictionLinksProps) {
  // Match assets to known cryptos
  const matchedCryptos = assets
    .map(asset => 
      TOP_50_CRYPTOS.find(c => 
        c.symbol.toLowerCase() === asset.toLowerCase() ||
        c.name.toLowerCase() === asset.toLowerCase()
      )
    )
    .filter(Boolean)
    .slice(0, 6);

  if (matchedCryptos.length === 0) return null;

  return (
    <Card className={`glass-card ${className}`}>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          {title}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {matchedCryptos.map((crypto) => (
            <Link
              key={crypto!.id}
              to={`/price-prediction/${crypto!.id}/daily`}
              className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-sm group"
            >
              <Badge variant="outline" className="shrink-0">{crypto!.symbol.toUpperCase()}</Badge>
              <span className="text-muted-foreground group-hover:text-primary truncate">
                Daily Prediction
              </span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
          <Link 
            to="/predictions" 
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            All Predictions
          </Link>
          <Link 
            to="/market/best-crypto-to-buy-today" 
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <BarChart3 className="w-3 h-3" />
            Best Buys Today
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopCryptoPredictionLinks({ className = "" }: { className?: string }) {
  const topCryptos = TOP_50_CRYPTOS.slice(0, 10);

  return (
    <Card className={`glass-card ${className}`}>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Top Crypto Predictions
        </h3>
        <div className="space-y-1">
          {topCryptos.map((crypto) => (
            <div key={crypto.id} className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="w-14 justify-center shrink-0">
                {crypto.symbol.toUpperCase()}
              </Badge>
              <div className="flex gap-2 flex-1">
                <Link 
                  to={`/price-prediction/${crypto.id}/daily`}
                  className="text-muted-foreground hover:text-primary"
                >
                  Daily
                </Link>
                <span className="text-muted-foreground/50">|</span>
                <Link 
                  to={`/price-prediction/${crypto.id}/weekly`}
                  className="text-muted-foreground hover:text-primary"
                >
                  Weekly
                </Link>
                <span className="text-muted-foreground/50">|</span>
                <Link 
                  to={`/price-prediction/${crypto.id}/monthly`}
                  className="text-muted-foreground hover:text-primary"
                >
                  Monthly
                </Link>
              </div>
            </div>
          ))}
        </div>
        <Link 
          to="/predictions" 
          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 mt-3 text-sm"
        >
          View All 1,000+ Predictions <ChevronRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function MarketPagesLinks({ className = "" }: { className?: string }) {
  const marketPages = [
    { path: "/market/best-crypto-to-buy-today", label: "Best Crypto to Buy Today" },
    { path: "/market/top-crypto-gainers-today", label: "Top Gainers Today" },
    { path: "/market/next-crypto-to-explode", label: "Next Crypto to Explode" },
    { path: "/market/crypto-market-prediction-today", label: "Market Prediction Today" },
    { path: "/market/cheap-crypto-to-buy-now", label: "Cheap Crypto to Buy" },
    { path: "/market/undervalued-crypto-to-buy", label: "Undervalued Crypto" },
  ];

  return (
    <Card className={`glass-card ${className}`}>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Market Analysis Pages
        </h3>
        <div className="space-y-2">
          {marketPages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-sm group"
            >
              <ChevronRight className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground group-hover:text-primary">
                {page.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
