import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { useCryptoFactory, TrendingCoin, GlobalStats } from "@/hooks/useCryptoFactory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Flame,
  RefreshCw,
  ArrowRight,
  DollarSign,
  BarChart3,
  Wifi
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

const chains = ['All', 'Ethereum', 'Solana', 'Arbitrum', 'Base', 'Polygon', 'Optimism', 'Avalanche'];
const impacts = ['All', 'high', 'medium', 'low'];

function GlobalStatsBar({ stats, trending }: { stats: GlobalStats; trending: TrendingCoin[] }) {
  return (
    <Card className="glass-card border-primary/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="text-lg font-bold text-primary">
              ${(stats.totalMarketCap / 1e12).toFixed(2)}T
            </p>
            <p className={cn("text-xs", stats.marketCapChange24h >= 0 ? "text-green-400" : "text-red-400")}>
              {stats.marketCapChange24h >= 0 ? '+' : ''}{stats.marketCapChange24h?.toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p className="text-lg font-bold">${(stats.totalVolume / 1e9).toFixed(0)}B</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">BTC Dom</p>
            <p className="text-lg font-bold text-amber-400">{stats.btcDominance?.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">ETH Dom</p>
            <p className="text-lg font-bold text-indigo-400">{stats.ethDominance?.toFixed(1)}%</p>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Trending</p>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {trending?.slice(0, 3).map((t) => (
                <Badge key={t.id} variant="outline" className="text-xs">
                  <img src={t.logo} alt={t.symbol} className="w-3 h-3 mr-1 rounded-full" />
                  {t.symbol}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="glass-card hover:border-primary/40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {event.logo && (
              <img 
                src={event.logo} 
                alt={event.asset} 
                className="w-10 h-10 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">{typeIcons[event.type as keyof typeof typeIcons]}</span>
                <h3 className="font-semibold">{event.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{event.chain}</Badge>
                <Badge variant="outline" className="text-xs">{event.asset}</Badge>
                <Badge className={cn("text-xs border", impactColors[event.impact as keyof typeof impactColors])}>
                  {event.impact.toUpperCase()} IMPACT
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={cn(
              "text-sm font-medium",
              isUpcoming ? "text-primary" : "text-muted-foreground"
            )}>
              {format(eventDate, 'MMM dd')}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(eventDate, 'HH:mm')}
            </div>
            {isUpcoming && (
              <div className="text-xs text-primary mt-1">
                {formatDistanceToNow(eventDate, { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
        <Link 
          to={`/strength-meter?asset=${event.asset}`}
          className="mt-3 flex items-center justify-end gap-1 text-xs text-primary hover:text-primary/80"
        >
          View Strength <ArrowRight className="w-3 h-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

function OnChainActivityCard({ activity }: { activity: any }) {
  const isInflow = activity.direction === 'inflow';

  return (
    <Card className="glass-card hover:border-primary/40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isInflow ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              {isInflow ? (
                <ArrowDownRight className="w-5 h-5 text-green-400" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{activity.asset}</span>
                <Badge variant="outline" className="text-xs">{activity.chain}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {activity.from} → {activity.to}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("font-semibold", isInflow ? "text-green-400" : "text-red-400")}>
              ${(activity.amountUSD / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NarrativeCard({ narrative }: { narrative: any }) {
  const sentimentColors = {
    bullish: 'text-green-400',
    neutral: 'text-yellow-400',
    bearish: 'text-red-400',
  };

  return (
    <Card className="glass-card hover:border-primary/40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="font-semibold">{narrative.narrative}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{narrative.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {narrative.topAssets.slice(0, 4).map((asset: string) => (
                <Badge key={asset} variant="outline" className="text-xs">{asset}</Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{narrative.momentum}</span>
            </div>
            <p className={cn("text-sm font-medium mt-1", sentimentColors[narrative.sentiment as keyof typeof sentimentColors])}>
              {narrative.weeklyChange >= 0 ? '+' : ''}{narrative.weeklyChange.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">7d</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewsCard({ news }: { news: any }) {
  const sentimentColors = {
    bullish: 'bg-green-500/20 text-green-400 border-green-500/30',
    neutral: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Card className="glass-card hover:border-primary/40 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* News Image */}
          {news.imageUrl && (
            <div className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0 hidden sm:block">
              <img 
                src={news.imageUrl} 
                alt={news.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold line-clamp-2 hover:text-primary transition-colors"
              >
                {news.title}
              </a>
              <Badge className={cn("shrink-0 border text-xs", sentimentColors[news.sentiment as keyof typeof sentimentColors])}>
                {news.sentiment}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{news.summary}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">{news.source}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}
              </span>
              {news.impactScore > 70 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                    High Impact
                  </Badge>
                </>
              )}
              {news.relatedAssets && news.relatedAssets.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  {news.relatedAssets.slice(0, 4).map((asset: string) => (
                    <Badge key={asset} variant="outline" className="text-xs">{asset}</Badge>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CryptoFactory() {
  const [searchParams] = useSearchParams();
  const initialAsset = searchParams.get('asset') || '';
  
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState(initialAsset);
  const [chainFilter, setChainFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState('All');

  const { data, isLoading, refetch, isFetching } = useCryptoFactory({
    chain: chainFilter !== 'All' ? chainFilter : undefined,
    asset: searchQuery || undefined,
    impact: impactFilter !== 'All' ? impactFilter : undefined,
  });

  return (
    <Layout>
      <SEO 
        title="Crypto Factory - Oracle"
        description="Centralized crypto intelligence hub. Track market events, on-chain activity, narratives, and news."
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold glow-text flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              Crypto Factory
            </h1>
            <p className="text-muted-foreground mt-1">
              Your centralized intelligence hub for market-moving events and on-chain activity
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </section>

        {/* Global Stats */}
        {data?.globalStats && (
          <GlobalStatsBar stats={data.globalStats} trending={data.trending || []} />
        )}

        {/* Filters */}
        <Card className="glass-card">
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
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/30 w-full sm:w-auto grid grid-cols-4 sm:flex">
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="onchain" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">On-Chain</span>
            </TabsTrigger>
            <TabsTrigger value="narratives" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Narratives</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="w-4 h-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Market Events Calendar
              </h2>
              <Badge variant="outline">{data?.events.length || 0} events</Badge>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
                {data?.events.length === 0 && (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No events match your filters
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* On-Chain Tab */}
          <TabsContent value="onchain" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                On-Chain Activity Feed
              </h2>
              <Badge variant="outline">{data?.onChainActivity.length || 0} activities</Badge>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.onChainActivity.map((activity) => (
                  <OnChainActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Narratives Tab */}
          <TabsContent value="narratives" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Ecosystem & Narrative Tracker
              </h2>
              <Badge variant="outline">{data?.narratives.length || 0} narratives</Badge>
            </div>
            
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data?.narratives.map((narrative) => (
                  <NarrativeCard key={narrative.id} narrative={narrative} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                News & Sentiment Pulse
              </h2>
              <Badge variant="outline">{data?.news.length || 0} articles</Badge>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.news.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </Layout>
  );
}
