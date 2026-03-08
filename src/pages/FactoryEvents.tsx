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
  Calendar, Search, ArrowRight, RefreshCw, Clock, Target, Activity,
  TrendingUp, Newspaper, Zap, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { TopCryptoPredictionLinks } from "@/components/factory/AssetPredictionLinks";

const chains = ['All', 'Ethereum', 'Solana', 'Arbitrum', 'Base', 'Polygon', 'Optimism', 'Avalanche'];
const impacts = ['All', 'high', 'medium', 'low'];

function FactoryEventsSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Crypto Events Calendar - Live Market Events | Oracle Bull",
    description: "Track live cryptocurrency market events including token unlocks, network upgrades, governance votes, and more. Real-time event calendar updated 24/7.",
    url: "https://oraclebull.com/factory/events",
    mainEntity: {
      "@type": "ItemList",
      name: "Cryptocurrency Market Events",
      description: "Live feed of market-moving crypto events",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://oraclebull.com" },
        { "@type": "ListItem", position: 2, name: "Crypto Factory", item: "https://oraclebull.com/factory" },
        { "@type": "ListItem", position: 3, name: "Market Events", item: "https://oraclebull.com/factory/events" }
      ]
    }
  };

  return (
    <Helmet>
      <title>Crypto Events Calendar | Token Unlocks & Network Upgrades Today | Oracle Bull</title>
      <meta name="description" content="Live cryptocurrency market events calendar. Track token unlocks, vesting schedules, network upgrades, hard forks, governance votes, and regulatory announcements affecting crypto prices today." />
      <meta name="keywords" content="crypto events, token unlocks, crypto calendar, network upgrades, crypto governance, vesting schedule, crypto news, market events" />
      <link rel="canonical" href="https://oraclebull.com/factory/events" />
      <meta property="og:title" content="Crypto Events Calendar | Live Market Events | Oracle Bull" />
      <meta property="og:description" content="Track live cryptocurrency market events including token unlocks, network upgrades, and governance votes. Updated 24/7." />
      <meta property="og:url" content="https://oraclebull.com/factory/events" />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

function EventCard({ event }: { event: any }) {
  const impactColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const typeIcons = {
    launch: '🚀',
    upgrade: '⬆️',
    fork: '🔱',
    unlock: '🔓',
    governance: '🗳️',
    regulatory: '📜',
  };

  const eventDate = new Date(event.datetime);
  const isUpcoming = eventDate > new Date();

  return (
    <article className="border-b border-border/50 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {event.logo && (
            <img 
              src={event.logo} 
              alt={`${event.asset} logo`} 
              className="w-12 h-12 rounded-full"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xl">{typeIcons[event.type as keyof typeof typeIcons]}</span>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <Badge className={cn("text-xs border", impactColors[event.impact as keyof typeof impactColors])}>
                {event.impact.toUpperCase()} IMPACT
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">{event.description}</p>
            
            {/* SEO-friendly analysis text */}
            <p className="text-sm text-muted-foreground mb-3">
              This {event.type} event for <strong>{event.asset}</strong> on the <strong>{event.chain}</strong> network 
              {isUpcoming ? ' is scheduled to occur ' : ' occurred '} 
              {formatDistanceToNow(eventDate, { addSuffix: true })}. 
              Events with {event.impact} impact typically 
              {event.impact === 'high' ? ' cause significant price volatility and should be monitored closely' : 
               event.impact === 'medium' ? ' may affect short-term price action' : 
               ' have minimal immediate market impact but indicate ongoing development'}.
            </p>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">{event.chain}</Badge>
              <Badge variant="outline">{event.asset}</Badge>
              <span className="text-sm text-muted-foreground">
                {format(eventDate, 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            
            {/* Internal links */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <Link 
                to={`/price-prediction/${event.asset.toLowerCase()}/daily`}
                className="text-primary hover:text-primary/80 flex items-center gap-1"
              >
                {event.asset} Prediction <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                to={`/strength-meter?asset=${event.asset}`}
                className="text-primary hover:text-primary/80 flex items-center gap-1"
              >
                Strength Analysis <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={cn(
            "text-lg font-bold",
            isUpcoming ? "text-primary" : "text-muted-foreground"
          )}>
            {format(eventDate, 'MMM dd')}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(eventDate, 'HH:mm')} UTC
          </div>
          {isUpcoming && (
            <Badge variant="outline" className="mt-2 text-primary border-primary/50">
              <Clock className="w-3 h-3 mr-1" />
              Upcoming
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
}

export default function FactoryEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chainFilter, setChainFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState('All');

  const { data, isLoading, refetch, isFetching } = useCryptoFactory({
    chain: chainFilter !== 'All' ? chainFilter : undefined,
    asset: searchQuery || undefined,
    impact: impactFilter !== 'All' ? impactFilter : undefined,
  });

  const upcomingEvents = data?.events.filter(e => new Date(e.datetime) > new Date()) || [];
  const pastEvents = data?.events.filter(e => new Date(e.datetime) <= new Date()) || [];

  return (
    <Layout>
      <FactoryEventsSchema />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li><Link to="/factory" className="hover:text-primary">Crypto Factory</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-foreground font-medium">Market Events</li>
          </ol>
        </nav>

        {/* H1 Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold glow-text flex items-center gap-3">
            <Calendar className="w-10 h-10 text-primary" />
            Crypto Events Calendar
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
            Track market-moving cryptocurrency events in real-time. From token unlocks and vesting schedules 
            to network upgrades and governance votes—stay ahead of price-affecting catalysts.
          </p>
        </header>

        {/* SEO Introduction */}
        <section className="holo-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">What Are Crypto Market Events?</h2>
          <div className="prose max-w-none text-muted-foreground">
            <p className="mb-3">
              Cryptocurrency market events are scheduled occurrences that can significantly impact token prices 
              and market sentiment. Understanding these events helps traders anticipate volatility and identify 
              trading opportunities. Oracle Bull tracks all major event types across top blockchain networks.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1">🔓 Token Unlocks</h3>
                <p className="text-sm">Vesting releases that increase circulating supply, often causing sell pressure.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1">⬆️ Network Upgrades</h3>
                <p className="text-sm">Protocol improvements that can boost confidence and adoption.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1">🗳️ Governance Votes</h3>
                <p className="text-sm">Community decisions that shape protocol direction and tokenomics.</p>
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
                  placeholder="Search events by asset..."
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
              <Select value={impactFilter} onValueChange={setImpactFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-muted/30">
                  <SelectValue placeholder="Impact" />
                </SelectTrigger>
                <SelectContent>
                  {impacts.map((impact) => (
                    <SelectItem key={impact} value={impact}>
                      {impact === 'All' ? 'All Impact' : `${impact.charAt(0).toUpperCase() + impact.slice(1)} Impact`}
                    </SelectItem>
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

        {/* Events List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Events */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Upcoming Events ({upcomingEvents.length})
              </h2>
              <Card className="glass-card">
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No upcoming events match your filters. Try adjusting your search criteria.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Recent Events */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                Recent Events ({pastEvents.length})
              </h2>
              <Card className="glass-card">
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : pastEvents.length > 0 ? (
                    pastEvents.slice(0, 5).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No recent events to display.
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
                  <Link to="/factory/events" className="flex items-center gap-2 p-2 rounded bg-primary/10 text-primary">
                    <Calendar className="w-4 h-4" />
                    <span>Market Events</span>
                    <Badge variant="outline" className="ml-auto">{data?.events.length || 0}</Badge>
                  </Link>
                  <Link to="/factory/onchain" className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                    <Activity className="w-4 h-4" />
                    <span>On-Chain Activity</span>
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
                  <Link to="/predictions" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Target className="w-4 h-4" />
                    Price Predictions Hub
                  </Link>
                  <Link to="/strength-meter" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Zap className="w-4 h-4" />
                    Crypto Strength Meter
                  </Link>
                  <Link to="/market/best-crypto-to-buy-today" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <TrendingUp className="w-4 h-4" />
                    Best Crypto to Buy Today
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

            {/* How to Use */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">How to Use Event Data</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>High impact</strong> events often cause 5-15% price swings</li>
                  <li>• Token unlocks typically create short-term sell pressure</li>
                  <li>• Network upgrades can spark rallies if successful</li>
                  <li>• Monitor events 24-48 hours before occurrence</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* FAQ Section */}
        <section className="mt-8 holo-card p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground">How often is the events calendar updated?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Our events calendar updates automatically every minute, pulling data from multiple sources 
                to ensure you never miss a market-moving event.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Which events have the biggest price impact?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Token unlocks and major network upgrades typically cause the largest price movements. 
                Events marked as "HIGH IMPACT" have historically moved prices by 5% or more.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">How should I trade around crypto events?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Consider positioning 24-48 hours before high-impact events. For token unlocks, prepare for 
                potential sell pressure. For upgrades, look for breakout opportunities on successful launches.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}