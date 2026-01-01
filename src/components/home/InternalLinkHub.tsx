import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TOP_50_CRYPTOS } from "@/lib/extendedCryptos";

interface InternalLinkHubProps {
  className?: string;
}

const featuredMarketIds = [
  "bitcoin",
  "ethereum",
  "solana",
  "ripple",
  "binancecoin",
  "chainlink",
  "arbitrum",
  "optimism",
] as const;

export function InternalLinkHub({ className }: InternalLinkHubProps) {
  const featuredCoins = useMemo(() => {
    const byId = new Map(TOP_50_CRYPTOS.map((c) => [c.id, c] as const));
    return featuredMarketIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, 8);
  }, []);

  return (
    <section className={cn("container mx-auto px-4 py-8", className)} aria-labelledby="internal-link-hub">
      <div className="holo-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 id="internal-link-hub" className="font-display text-xl md:text-2xl font-bold">
              Markets  Weekly Predictions
            </h2>
            <p className="text-sm text-muted-foreground">
              Quick links to high-intent coin market pages and weekly forecasts.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary w-fit">
            <TrendingUp className="w-3 h-3 mr-1" />
            Investor Links
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Markets */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" />
              <h3 className="font-display font-bold">Coin Market Pages</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {featuredCoins.map((coin) => (
                <Link
                  key={coin!.id}
                  to={`/markets/${coin!.id}`}
                  reloadDocument
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-sm hover:bg-muted/20 hover:border-primary/30 transition-colors"
                >
                  <span className="font-medium">{coin!.name}</span>
                  <span className="text-muted-foreground">{coin!.symbol.toUpperCase()}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Weekly predictions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
              <h3 className="font-display font-bold">Weekly Forecasts</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {featuredCoins.slice(0, 6).map((coin) => (
                <Link
                  key={coin!.id}
                  to={`/price-prediction/${coin!.id}/weekly`}
                  reloadDocument
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 px-3 py-2 text-sm hover:bg-muted/20 hover:border-primary/30 transition-colors"
                >
                  <span className="font-medium">
                    {coin!.symbol.toUpperCase()} weekly prediction
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary" aria-hidden="true" />
                </Link>
              ))}

              <Link
                to="/market/best-crypto-to-buy-this-week"
                reloadDocument
                className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
              >
                <span className="font-medium">Best crypto to buy this week</span>
                <ChevronRight className="w-4 h-4 text-primary" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
