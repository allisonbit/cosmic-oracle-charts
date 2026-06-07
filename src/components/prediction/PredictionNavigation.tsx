import { Link } from "react-router-dom";
import { TOP_CRYPTOS } from "@/hooks/usePricePrediction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, CalendarDays, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CoinImage } from "@/components/ui/CoinImage";

interface CoinListProps {
  currentCoin?: string;
  currentTimeframe?: string;
}

export function CoinList({ currentCoin, currentTimeframe }: CoinListProps) {
  const [search, setSearch] = useState("");
  
  const filteredCoins = TOP_CRYPTOS.filter(coin => 
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          All Predictions
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50"
          />
        </div>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto space-y-1">
        {filteredCoins.map(coin => (
          <Link
            key={coin.id}
            to={`/price-prediction/${coin.id}/${currentTimeframe || 'daily'}`}
            className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors ${
              currentCoin === coin.id ? 'bg-primary/10 border border-primary/30' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <CoinImage symbol={coin.symbol} size={32} />
              <div>
                <span className="font-medium text-sm">{coin.name}</span>
                <p className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

interface TimeframeSelectorProps {
  coinId: string;
  coinName: string;
  currentTimeframe: string;
}

export function TimeframeSelector({ coinId, coinName, currentTimeframe }: TimeframeSelectorProps) {
  const timeframes = [
    { id: 'daily', label: 'Today', icon: Calendar, description: 'Short-term traders' },
    { id: 'weekly', label: 'This Week', icon: CalendarDays, description: 'Swing traders' },
    { id: 'monthly', label: 'This Month', icon: Calendar, description: 'Investors' }
  ];
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Prediction Timeframe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {timeframes.map(tf => (
          <Link
            key={tf.id}
            to={`/price-prediction/${coinId}/${tf.id}`}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              currentTimeframe === tf.id 
                ? 'bg-primary/20 border border-primary/50' 
                : 'bg-muted/30 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <tf.icon className={`h-5 w-5 ${currentTimeframe === tf.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <span className={`font-medium ${currentTimeframe === tf.id ? 'text-primary' : ''}`}>
                  {tf.label}
                </span>
                <p className="text-xs text-muted-foreground">{tf.description}</p>
              </div>
            </div>
            {currentTimeframe === tf.id && (
              <Badge variant="default" className="text-xs">Active</Badge>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

interface RelatedPredictionsProps {
  currentCoin: string;
  timeframe: string;
}

export function RelatedPredictions({ currentCoin, timeframe }: RelatedPredictionsProps) {
  // Get 5 related coins (excluding current)
  const relatedCoins = TOP_CRYPTOS
    .filter(c => c.id !== currentCoin)
    .slice(0, 5);
  
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Related Predictions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {relatedCoins.map(coin => (
          <Link
            key={coin.id}
            to={`/price-prediction/${coin.id}/${timeframe}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <CoinImage symbol={coin.symbol} size={32} />
            <div>
              <span className="font-medium text-sm">{coin.name}</span>
              <p className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()} prediction</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
