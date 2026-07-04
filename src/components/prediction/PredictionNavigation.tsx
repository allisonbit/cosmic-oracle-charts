import { Link } from "react-router-dom";
import { TOP_CRYPTOS } from "@/hooks/usePricePrediction";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, CalendarDays, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CoinImage } from "@/components/ui/CoinImage";
import { cn } from "@/lib/utils";

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
    <section className="border-t border-border/30 pt-4">
      <div className="section-label mb-3 flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-primary" />
        All Predictions
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-transparent"
        />
      </div>
      <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
        {filteredCoins.map(coin => (
          <Link
            key={coin.id}
            to={`/price-prediction/${coin.id}/${currentTimeframe || 'daily'}`}
            className={cn(
              "editorial-row gap-2",
              currentCoin === coin.id && "border-l-2 border-primary pl-2"
            )}
          >
            <CoinImage symbol={coin.symbol} size={28} />
            <div>
              <span className={cn("font-medium text-sm", currentCoin === coin.id && "text-primary")}>{coin.name}</span>
              <p className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
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
    <section className="border-t border-border/30 pt-4">
      <div className="section-label mb-3">Prediction Timeframe</div>
      <div>
        {timeframes.map(tf => {
          const active = currentTimeframe === tf.id;
          return (
            <Link
              key={tf.id}
              to={`/price-prediction/${coinId}/${tf.id}`}
              className={cn("editorial-row group justify-between", active && "border-l-2 border-primary pl-2")}
            >
              <div className="flex items-center gap-3">
                <tf.icon className={cn("h-4 w-4", active ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <span className={cn("font-medium", active && 'text-primary')}>{tf.label}</span>
                  <p className="text-xs text-muted-foreground">{tf.description}</p>
                </div>
              </div>
              {active && <Badge variant="default" className="text-xs">Active</Badge>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

interface RelatedPredictionsProps {
  currentCoin: string;
  timeframe: string;
}

export function RelatedPredictions({ currentCoin, timeframe }: RelatedPredictionsProps) {
  const relatedCoins = TOP_CRYPTOS
    .filter(c => c.id !== currentCoin)
    .slice(0, 5);

  return (
    <section className="border-t border-border/30 pt-4">
      <div className="section-label mb-3">Related Predictions</div>
      <div>
        {relatedCoins.map(coin => (
          <Link
            key={coin.id}
            to={`/price-prediction/${coin.id}/${timeframe}`}
            className="editorial-row gap-3"
          >
            <CoinImage symbol={coin.symbol} size={28} />
            <div>
              <span className="font-medium text-sm">{coin.name}</span>
              <p className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()} prediction</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
