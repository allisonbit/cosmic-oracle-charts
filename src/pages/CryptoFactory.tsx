import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCryptoFactory, type TrendingCoin, type GlobalStats } from "@/hooks/useCryptoFactory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Activity, TrendingUp, TrendingDown, Newspaper, Search,
  ArrowUpRight, ArrowDownRight, Clock, Zap, Flame, RefreshCw,
  ArrowRight, BarChart3, Wifi, Globe, Shield, Eye, Filter,
  AlertTriangle, Gauge
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { CryptoFactorySchema } from "@/components/seo/index";
import { CryptoFactorySEOHeader, CryptoFactorySEOContent } from "@/components/seo/index";
import { SEO } from "@/components/MainSEO";
import { Helmet } from "react-helmet-async";

const chains = ['All', 'Ethereum', 'Solana', 'Arbitrum', 'Base', 'Polygon', 'Optimism', 'Avalanche'];

function formatCompact(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function CryptoFactory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [chainFilter, setChainFilter] = useState('All');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data, isLoading, refetch, isFetching } = useCryptoFactory({
    chain: chainFilter !== 'All' ? chainFilter : undefined,
    asset: searchQuery || undefined,
  });

  const fearGreed = (data as any)?.fearGreed || { value: 50, classification: 'Neutral' };
  const topMovers = (data as any)?.topMovers || [];

  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];
    let items = data.events;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(e => e.title.toLowerCase().includes(q) || e.asset.toLowerCase().includes(q));
    }
    return items;
  }, [data?.events, searchQuery]);

  const filteredNews = useMemo(() => {
    if (!data?.news) return [];
    let items = data.news;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(n => n.title.toLowerCase().includes(q) || n.relatedAssets.some(a => a.toLowerCase().includes(q)));
    }
    return items;
  }, [data?.news, searchQuery]);

  const fgColor = fearGreed.value < 25 ? 'text-red-400' : fearGreed.value < 45 ? 'text-orange-400' : fearGreed.value < 55 ? 'text-yellow-400' : fearGreed.value < 75 ? 'text-green-400' : 'text-emerald-400';

  return (
    <Layout>
      <SEO title="Crypto Factory – Real-Time Market Intelligence" description="Live market events, trending narratives, on-chain flows, and crypto news aggregated from 50+ sources. Your central intelligence hub." />
      <Helmet><link rel="canonical" href="https://cosmic-oracle-charts.lovable.app/factory" /></Helmet>
      <CryptoFactorySchema />

      <div className="min-h-screen cosmic-bg">
        {/* Live status bar */}
        <div className="border-b border-border/30 bg-background/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">LIVE</span>
              <span className="text-xs text-muted-foreground font-mono">{liveTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className={cn("font-mono font-bold", fgColor)}>
                F&G: {fearGreed.value} {fearGreed.classification}
              </span>
              <span className="text-muted-foreground">{data?.news?.length || 0} articles</span>
              <span className="text-muted-foreground">{filteredEvents.length} events</span>
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => refetch()}>
                <RefreshCw className={cn("w-3 h-3 mr-1", isFetching && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Hero */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Crypto Factory</h1>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl">
                Real-time market intelligence hub. Events, narratives, on-chain flows, and news from 50+ sources — all auto-updating.
              </p>
            </div>
          </div>

          {/* Global Stats Row */}
          {data?.globalStats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { label: 'Total MCap', value: formatCompact(data.globalStats.totalMarketCap), change: data.globalStats.marketCapChange24h, icon: BarChart3 },
                { label: '24h Volume', value: formatCompact(data.globalStats.totalVolume), icon: Activity },
                { label: 'BTC Dom', value: `${data.globalStats.btcDominance?.toFixed(1)}%`, icon: Shield, color: 'text-amber-400' },
                { label: 'ETH Dom', value: `${data.globalStats.ethDominance?.toFixed(1)}%`, icon: Globe, color: 'text-indigo-400' },
                { label: 'Fear & Greed', value: `${fearGreed.value}`, icon: Gauge, color: fgColor },
                { label: 'Active Coins', value: `${(data.globalStats.activeCryptocurrencies || 0).toLocaleString()}`, icon: Eye },
              ].map(stat => (
                <Card key={stat.label} className="bg-card/50 border-border/30">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <stat.icon className={cn("w-4 h-4 text-muted-foreground", stat.color)} />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className={cn("text-lg font-bold font-mono mt-1", stat.color)}>
                      {stat.value}
                    </p>
                    {stat.change !== undefined && (
                      <span className={cn("text-xs font-mono", stat.change >= 0 ? "text-green-400" : "text-red-400")}>
                        {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Top Movers Ticker */}
          {topMovers.length > 0 && (
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex items-center gap-2 min-w-max pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Top Movers</span>
                {topMovers.slice(0, 15).map((coin: any) => {
                  const isUp = (coin.change24h || 0) >= 0;
                  return (
                    <button
                      key={coin.id}
                      onClick={() => navigate(`/price-prediction/${coin.id}/daily`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/30 bg-card/30 hover:bg-muted/30 transition-colors whitespace-nowrap"
                    >
                      {coin.logo && <img src={coin.logo} alt={coin.symbol} className="w-4 h-4 rounded-full" />}
                      <span className="text-xs font-semibold">{coin.symbol}</span>
                      <span className={cn("text-xs font-mono", isUp ? "text-green-400" : "text-red-400")}>
                        {isUp ? '+' : ''}{(coin.change24h || 0).toFixed(1)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search + Filter */}
          <Card className="bg-card/50 border-border/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events, news, assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border/40"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {chains.map(c => (
                    <Button key={c} size="sm" variant={chainFilter === c ? "default" : "ghost"}
                      className={cn("h-7 px-2.5 text-xs", chainFilter === c && "bg-primary text-primary-foreground")}
                      onClick={() => setChainFilter(c)}>
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Nav to Sub-Pages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { to: '/factory/events', icon: Calendar, label: 'Events', desc: 'Market calendar', count: filteredEvents.length, color: 'bg-red-500/20 text-red-400' },
              { to: '/factory/onchain', icon: Activity, label: 'On-Chain', desc: 'Volume flows', count: data?.onChainActivity?.length || 0, color: 'bg-green-500/20 text-green-400' },
              { to: '/factory/narratives', icon: Flame, label: 'Narratives', desc: 'Trending themes', count: data?.narratives?.length || 0, color: 'bg-orange-500/20 text-orange-400' },
              { to: '/factory/news', icon: Newspaper, label: 'News', desc: 'Latest headlines', count: filteredNews.length, color: 'bg-blue-500/20 text-blue-400' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="holo-card p-4 hover:border-primary/50 transition-all group flex flex-col items-center text-center">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform", item.color)}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-sm">{item.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                <Badge variant="outline" className="mt-2 text-xs">{item.count} live</Badge>
              </Link>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-muted/30 w-full sm:w-auto grid grid-cols-4 sm:flex">
              <TabsTrigger value="overview" className="gap-1.5"><Eye className="w-4 h-4" /><span className="hidden sm:inline">Overview</span></TabsTrigger>
              <TabsTrigger value="events" className="gap-1.5"><Calendar className="w-4 h-4" /><span className="hidden sm:inline">Events</span></TabsTrigger>
              <TabsTrigger value="narratives" className="gap-1.5"><Flame className="w-4 h-4" /><span className="hidden sm:inline">Narratives</span></TabsTrigger>
              <TabsTrigger value="news" className="gap-1.5"><Newspaper className="w-4 h-4" /><span className="hidden sm:inline">News</span></TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Top Events */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-primary" /> Latest Events</h2>
                  <Link to="/factory/events" className="text-xs text-primary flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
                </div>
                {isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredEvents.slice(0, 6).map(event => (
                      <EventCard key={event.id} event={event} onNavigate={() => navigate(`/price-prediction/${event.asset.toLowerCase()}/daily`)} />
                    ))}
                  </div>
                )}
              </div>

              {/* Trending Narratives */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> Trending Narratives</h2>
                  <Link to="/factory/narratives" className="text-xs text-primary flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
                </div>
                {isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {data?.narratives?.slice(0, 4).map(n => (
                      <NarrativeCard key={n.id} narrative={n} />
                    ))}
                  </div>
                )}
              </div>

              {/* Latest News */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2"><Newspaper className="w-5 h-5 text-blue-400" /> Breaking News</h2>
                  <Link to="/factory/news" className="text-xs text-primary flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
                </div>
                {isLoading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
                ) : (
                  <div className="space-y-3">
                    {filteredNews.slice(0, 5).map(news => (
                      <NewsCard key={news.id} news={news} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> All Market Events</h2>
                <Badge variant="outline">{filteredEvents.length} events</Badge>
              </div>
              {isLoading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} onNavigate={() => navigate(`/price-prediction/${event.asset.toLowerCase()}/daily`)} />
                  ))}
                  {filteredEvents.length === 0 && <EmptyState message="No events match your search." />}
                </div>
              )}
            </TabsContent>

            {/* Narratives Tab */}
            <TabsContent value="narratives" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> Narrative Tracker</h2>
                <Badge variant="outline">{data?.narratives?.length || 0} narratives</Badge>
              </div>
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data?.narratives?.map(n => <NarrativeCard key={n.id} narrative={n} />)}
                </div>
              )}
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg flex items-center gap-2"><Newspaper className="w-5 h-5 text-blue-400" /> News Feed</h2>
                <Badge variant="outline">{filteredNews.length} articles</Badge>
              </div>
              {isLoading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
              ) : (
                <div className="space-y-3">
                  {filteredNews.map(news => <NewsCard key={news.id} news={news} />)}
                  {filteredNews.length === 0 && <EmptyState message="No news match your search." />}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <CryptoFactorySEOContent />
        </div>
      </div>
    </Layout>
  );
}

// ---- Sub-components ----

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-card/50 border-border/30">
      <CardContent className="p-8 text-center text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

function EventCard({ event, onNavigate }: { event: any; onNavigate?: () => void }) {
  const impactColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <button onClick={onNavigate} className="text-left w-full">
      <Card className="bg-card/50 border-border/30 hover:border-primary/40 transition-all">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {event.logo && <img src={event.logo} alt={event.asset} className="w-10 h-10 rounded-full flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1">{event.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{event.chain}</Badge>
                <Badge variant="outline" className="text-[10px]">{event.asset}</Badge>
                <Badge className={cn("text-[10px] border", impactColors[event.impact] || impactColors.low)}>{event.impact?.toUpperCase()}</Badge>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(event.datetime), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function NarrativeCard({ narrative }: { narrative: any }) {
  const sentColors: Record<string, string> = { bullish: 'text-green-400', neutral: 'text-yellow-400', bearish: 'text-red-400' };
  const navigate = useNavigate();

  return (
    <Card className="bg-card/50 border-border/30 hover:border-primary/40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <h3 className="font-semibold text-sm">{narrative.narrative}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{narrative.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {narrative.topAssets?.slice(0, 5).map((a: string) => (
                <button key={a} onClick={() => navigate(`/price-prediction/${a.toLowerCase()}/daily`)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border/40 hover:border-primary/40 transition-colors">
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold text-primary">{narrative.momentum}</span>
            </div>
            <p className={cn("text-xs font-mono mt-0.5", sentColors[narrative.sentiment] || 'text-muted-foreground')}>
              {(narrative.weeklyChange || narrative.dailyChange || 0) >= 0 ? '+' : ''}{(narrative.weeklyChange || narrative.dailyChange || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewsCard({ news }: { news: any }) {
  const sentColors: Record<string, string> = {
    bullish: 'bg-green-500/20 text-green-400 border-green-500/30',
    neutral: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Card className="bg-card/50 border-border/30 hover:border-primary/40 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {news.imageUrl && (
            <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block">
              <img src={news.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <a href={news.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{news.title}</a>
              <Badge className={cn("shrink-0 border text-[10px]", sentColors[news.sentiment] || sentColors.neutral)}>{news.sentiment}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{news.summary}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">{news.source}</span>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}</span>
              {news.impactScore > 70 && (
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">High Impact</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
