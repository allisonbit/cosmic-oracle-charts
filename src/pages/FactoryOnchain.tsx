import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCryptoFactory } from "@/hooks/useCryptoFactory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity, Search, RefreshCw, ArrowUpRight, ArrowDownRight,
  Calendar, TrendingUp, Newspaper, Zap, Target, ChevronRight, Wallet
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { TopCryptoPredictionLinks } from "@/components/factory/AssetPredictionLinks";

const chains = ['All', 'Ethereum', 'Solana', 'Arbitrum', 'Base', 'Polygon', 'Optimism', 'Avalanche'];

function FactoryOnchainSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "On-Chain Activity Feed - Whale Movements & Exchange Flows | Oracle Bull",
    description: "Track real-time on-chain cryptocurrency activity. Monitor whale movements, exchange inflows/outflows, bridge activity, and large transactions across all major blockchains.",
    url: "https://oraclebull.com/factory/onchain",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://oraclebull.com" },
        { "@type": "ListItem", position: 2, name: "Crypto Factory", item: "https://oraclebull.com/factory" },
        { "@type": "ListItem", position: 3, name: "On-Chain Activity", item: "https://oraclebull.com/factory/onchain" }
      ]
    }
  };

  return (
    <Helmet>
      <title>On-Chain Activity Feed | Whale Movements & Exchange Flows Today | Oracle Bull</title>
      <meta name="description" content="Real-time on-chain cryptocurrency activity tracker. Monitor whale movements, exchange inflows and outflows, bridge transfers, and large transactions across Ethereum, Solana, and major blockchains." />
      <meta name="keywords" content="on-chain activity, whale movements, exchange flows, crypto transactions, blockchain activity, whale tracker, exchange inflow outflow" />
      <link rel="canonical" href="https://oraclebull.com/factory/onchain" />
      <meta property="og:title" content="On-Chain Activity Feed | Whale Movements Today | Oracle Bull" />
      <meta property="og:description" content="Track real-time on-chain activity including whale movements, exchange flows, and large transactions." />
      <meta property="og:url" content="https://oraclebull.com/factory/onchain" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

function OnChainActivityCard({ activity }: { activity: any }) {
  const isInflow = activity.direction === 'inflow';
  const activityTypes = {
    whale_movement: 'Whale Movement',
    exchange_flow: 'Exchange Flow',
    bridge_activity: 'Bridge Transfer',
    large_transfer: 'Large Transfer',
  };

  return (
    <article className="border-b border-border/50 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
            isInflow ? "bg-green-500/20" : "bg-red-500/20"
          )}>
            {isInflow ? (
              <ArrowDownRight className="w-6 h-6 text-green-400" />
            ) : (
              <ArrowUpRight className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-semibold text-lg">{activity.asset}</h3>
              <Badge variant="outline">{activityTypes[activity.type as keyof typeof activityTypes]}</Badge>
              <Badge variant="outline">{activity.chain}</Badge>
            </div>
            
            <p className="text-muted-foreground mb-2">
              <span className="font-mono text-sm">{activity.from}</span>
              <span className="mx-2">→</span>
              <span className="font-mono text-sm">{activity.to}</span>
            </p>
            
            {/* SEO-friendly analysis text */}
            <p className="text-sm text-muted-foreground mb-3">
              A {isInflow ? 'inflow' : 'outflow'} of <strong>${(activity.amountUSD / 1000000).toFixed(2)}M</strong> in{' '}
              <strong>{activity.asset}</strong> was detected on {activity.chain}. 
              {isInflow 
                ? ' Exchange inflows often indicate potential selling pressure as tokens move to trading platforms.'
                : ' Exchange outflows typically suggest accumulation as tokens move to cold storage or DeFi protocols.'}
            </p>
            
            {/* Internal links */}
            <div className="flex items-center gap-4 text-sm">
              <Link 
                to={`/price-prediction/${activity.asset.toLowerCase()}/daily`}
                className="text-primary hover:text-primary/80 flex items-center gap-1"
              >
                {activity.asset} Prediction <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                to={`/strength-meter?asset=${activity.asset}`}
                className="text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View Strength <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={cn("text-xl font-bold", isInflow ? "text-green-400" : "text-red-400")}>
            ${(activity.amountUSD / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </p>
          <Badge 
            variant="outline" 
            className={cn("mt-2", isInflow ? "text-green-400 border-green-500/50" : "text-red-400 border-red-500/50")}
          >
            {isInflow ? 'Inflow' : 'Outflow'}
          </Badge>
        </div>
      </div>
    </article>
  );
}

export default function FactoryOnchain() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chainFilter, setChainFilter] = useState('All');

  const { data, isLoading, refetch, isFetching } = useCryptoFactory({
    chain: chainFilter !== 'All' ? chainFilter : undefined,
    asset: searchQuery || undefined,
  });

  const inflows = data?.onChainActivity.filter(a => a.direction === 'inflow') || [];
  const outflows = data?.onChainActivity.filter(a => a.direction === 'outflow') || [];
  const totalInflowUSD = inflows.reduce((sum, a) => sum + a.amountUSD, 0);
  const totalOutflowUSD = outflows.reduce((sum, a) => sum + a.amountUSD, 0);

  return (
    <Layout>
      <FactoryOnchainSchema />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li><Link to="/factory" className="hover:text-primary">Crypto Factory</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-foreground font-medium">On-Chain Activity</li>
          </ol>
        </nav>

        {/* H1 Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold glow-text flex items-center gap-3">
            <Activity className="w-10 h-10 text-primary" />
            On-Chain Activity Feed
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
            Track whale movements, exchange flows, and large transactions in real-time. 
            On-chain data reveals what smart money is doing before price moves.
          </p>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Activity</p>
              <p className="text-2xl font-bold">{data?.onChainActivity.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Net Flow</p>
              <p className={cn("text-2xl font-bold", totalInflowUSD > totalOutflowUSD ? "text-green-400" : "text-red-400")}>
                ${((totalInflowUSD - totalOutflowUSD) / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-green-400">Total Inflows</p>
              <p className="text-2xl font-bold text-green-400">${(totalInflowUSD / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-red-400">Total Outflows</p>
              <p className="text-2xl font-bold text-red-400">${(totalOutflowUSD / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
        </div>

        {/* SEO Introduction */}
        <section className="holo-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">What Is On-Chain Activity?</h2>
          <div className="prose max-w-none text-muted-foreground">
            <p className="mb-3">
              On-chain activity refers to all transactions recorded on blockchain networks. By analyzing 
              these movements—especially large transactions by whales and exchange flows—traders can 
              anticipate market movements before they reflect in price action.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-green-400" />
                  Exchange Inflows
                </h3>
                <p className="text-sm">Tokens moving TO exchanges often signal selling intent. Large inflows may precede price drops.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                  Exchange Outflows
                </h3>
                <p className="text-sm">Tokens moving FROM exchanges suggest accumulation. Outflows to cold storage are bullish signals.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by asset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/30"
                />
              </div>
              <Select value={chainFilter} onValueChange={setChainFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-muted/30">
                  <SelectValue placeholder="Chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain} value={chain}>{chain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live On-Chain Feed ({data?.onChainActivity.length || 0})
              </h2>
              <Card className="glass-card">
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                      ))}
                    </div>
                  ) : data?.onChainActivity && data.onChainActivity.length > 0 ? (
                    data.onChainActivity.map((activity) => (
                      <OnChainActivityCard key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No on-chain activity matches your filters.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Factory Navigation */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Crypto Factory Sections</h3>
                <nav className="space-y-2">
                  <Link to="/factory/events" className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                    <Calendar className="w-4 h-4" />
                    <span>Market Events</span>
                  </Link>
                  <Link to="/factory/onchain" className="flex items-center gap-2 p-2 rounded bg-primary/10 text-primary">
                    <Activity className="w-4 h-4" />
                    <span>On-Chain Activity</span>
                    <Badge variant="outline" className="ml-auto">{data?.onChainActivity.length || 0}</Badge>
                  </Link>
                  <Link to="/factory/narratives" className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending Narratives</span>
                  </Link>
                  <Link to="/factory/news" className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                    <Newspaper className="w-4 h-4" />
                    <span>Crypto News</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>

            {/* Related Links */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Related Analysis</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/portfolio" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Wallet className="w-4 h-4" />
                    Wallet Scanner
                  </Link>
                  <Link to="/strength-meter" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Zap className="w-4 h-4" />
                    Crypto Strength Meter
                  </Link>
                  <Link to="/sentiment" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Activity className="w-4 h-4" />
                    Sentiment Analysis
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Top Crypto Predictions */}
            <TopCryptoPredictionLinks />

            {/* Interpretation Guide */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">How to Interpret Flows</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong className="text-green-400">Heavy inflows</strong> often precede sell-offs</li>
                  <li>• <strong className="text-red-400">Heavy outflows</strong> suggest accumulation</li>
                  <li>• Whale movements can signal trend changes</li>
                  <li>• Bridge activity shows cross-chain trends</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* FAQ Section */}
        <section className="mt-8 holo-card p-6">
          <h2 className="text-xl font-semibold mb-4">On-Chain Analysis FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground">What are whale movements?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Whale movements refer to large transactions by wallet addresses holding significant amounts 
                of cryptocurrency. These can indicate institutional activity or smart money positioning.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Why do exchange flows matter?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Tokens moving to exchanges typically indicate intent to sell, while outflows suggest 
                long-term holding. Tracking these flows can help predict supply-demand dynamics.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">How quickly is on-chain data updated?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Our on-chain feed updates every minute, capturing the latest whale movements and 
                exchange flows across all major blockchains in near real-time.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
