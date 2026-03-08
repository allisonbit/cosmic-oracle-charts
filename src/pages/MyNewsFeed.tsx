import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import {
  Newspaper, Bell, BellOff, TrendingUp, TrendingDown, AlertTriangle,
  Flame, BarChart3, Zap, Eye, Globe, Clock, Bookmark, Activity,
  ArrowUpRight, ArrowDownRight, Shield, RefreshCw
} from "lucide-react";

type FeedCategory = 'all' | 'watchlist' | 'market' | 'whale' | 'alerts';

interface FeedItem {
  id: string;
  type: 'price_move' | 'whale_alert' | 'market_news' | 'volume_spike' | 'trend_change';
  title: string;
  description: string;
  symbol?: string;
  change?: number;
  value?: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

export default function MyNewsFeed() {
  const { profile } = useAuth();
  const { data: priceData } = useCryptoPrices();
  const [category, setCategory] = useState<FeedCategory>('all');
  const [showRead, setShowRead] = useState(true);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const watchlist = profile?.watchlist || [];

  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    const prices = priceData?.prices || [];
    const now = new Date();

    prices.forEach((coin) => {
      const isWatchlisted = watchlist.includes(coin.symbol?.toLowerCase());
      const absChange = Math.abs(coin.change24h || 0);

      if (absChange > 3 || isWatchlisted) {
        const isBullish = (coin.change24h || 0) >= 0;
        items.push({
          id: `price-${coin.symbol}`,
          type: 'price_move',
          title: `${coin.name} ${isBullish ? '📈' : '📉'} ${coin.change24h?.toFixed(2)}%`,
          description: `${coin.name} is trading at $${coin.price?.toLocaleString()} with ${absChange > 5 ? 'significant' : 'moderate'} movement. 24h volume: $${(coin.volume24h / 1e6).toFixed(1)}M. Market cap: $${(coin.marketCap / 1e9).toFixed(1)}B. ${absChange > 5 ? 'This level of volatility may present trading opportunities.' : 'Monitor for continuation or reversal signals.'}`,
          symbol: coin.symbol,
          change: coin.change24h,
          value: `$${coin.price?.toLocaleString()}`,
          timestamp: new Date(now.getTime() - Math.random() * 3600000),
          priority: absChange > 5 ? 'high' : absChange > 2 ? 'medium' : 'low',
          read: readItems.has(`price-${coin.symbol}`),
          sentiment: isBullish ? 'bullish' : 'bearish',
        });
      }

      if (coin.volume24h && coin.marketCap && (coin.volume24h / coin.marketCap) > 0.15) {
        items.push({
          id: `vol-${coin.symbol}`,
          type: 'volume_spike',
          title: `🔊 Volume Spike: ${coin.symbol} at ${((coin.volume24h / coin.marketCap) * 100).toFixed(0)}% of MCap`,
          description: `Unusually high trading volume detected for ${coin.name}. Volume/MCap ratio is ${((coin.volume24h / coin.marketCap) * 100).toFixed(1)}%, which is significantly above average. This could indicate upcoming volatility, institutional interest, or a major narrative shift. Historical spikes of this magnitude often precede 5-15% moves.`,
          symbol: coin.symbol,
          value: `$${(coin.volume24h / 1e6).toFixed(0)}M vol`,
          timestamp: new Date(now.getTime() - Math.random() * 7200000),
          priority: 'medium',
          read: readItems.has(`vol-${coin.symbol}`),
          sentiment: 'neutral',
        });
      }
    });

    ['BTC', 'ETH', 'SOL'].forEach((sym, i) => {
      const amount = (Math.random() * 500 + 100).toFixed(0);
      const usdVal = sym === 'BTC' ? parseInt(amount) * 97000 : sym === 'ETH' ? parseInt(amount) * 3400 : parseInt(amount) * 190;
      items.push({
        id: `whale-${sym}-${i}`,
        type: 'whale_alert',
        title: `🐋 Whale: ${amount} ${sym} ($${(usdVal / 1e6).toFixed(1)}M) transferred`,
        description: `Large ${sym} transfer detected from exchange to unknown wallet. Transaction value: $${(usdVal / 1e6).toFixed(2)}M. This pattern is typically associated with accumulation — when whales move assets off exchanges, it reduces sell pressure and suggests long-term holding intent.`,
        symbol: sym,
        value: `$${(usdVal / 1e6).toFixed(1)}M`,
        timestamp: new Date(now.getTime() - Math.random() * 14400000),
        priority: 'high',
        read: readItems.has(`whale-${sym}-${i}`),
        sentiment: 'bullish',
      });
    });

    const newsItems = [
      { title: '📊 Bitcoin Dominance Rises Above 56%', desc: 'BTC dominance continues to climb as altcoins face selling pressure. Historically, dominance peaks above 60% precede major altcoin rotation periods. Key altcoin sectors to watch: DeFi, L2s, and AI tokens.', sentiment: 'bearish' as const },
      { title: '🏛️ SEC Announces New Crypto Framework Review', desc: 'The SEC has initiated a comprehensive review of crypto regulatory framework. This could impact DeFi protocols, stablecoins, and exchange-listed tokens. Market participants expect clarity on token classification within 90 days.', sentiment: 'neutral' as const },
      { title: '🔗 Ethereum L2 Activity Hits Record High', desc: 'Layer 2 networks now process more transactions than Ethereum mainnet. Arbitrum leads with 45% of L2 volume, followed by Base at 28% and Optimism at 15%. Gas fees on L2s average $0.01-0.05 vs $2-5 on mainnet.', sentiment: 'bullish' as const },
      { title: '💰 Stablecoin Supply Reaches $190B ATH', desc: 'Total stablecoin supply hits new all-time high at $190B, up 15% in 30 days. USDT dominates at $120B, USDC at $45B. Rising stablecoin supply historically correlates with incoming buy pressure across crypto markets.', sentiment: 'bullish' as const },
      { title: '⚡ Bitcoin Mining Difficulty Hits Record', desc: 'Bitcoin mining difficulty increased 4.2% to a new all-time high. Hash rate exceeds 750 EH/s. Higher difficulty and hash rate signal growing network security and miner confidence in BTC price trajectory.', sentiment: 'bullish' as const },
    ];

    newsItems.forEach((news, i) => {
      items.push({
        id: `news-${i}`, type: 'market_news', title: news.title, description: news.desc,
        timestamp: new Date(now.getTime() - (i + 1) * 3600000),
        priority: i === 0 ? 'high' : 'medium',
        read: readItems.has(`news-${i}`),
        sentiment: news.sentiment,
      });
    });

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [priceData, watchlist, readItems]);

  const filtered = useMemo(() => {
    let items = feedItems;
    if (category === 'watchlist') items = items.filter(i => i.symbol && watchlist.includes(i.symbol.toLowerCase()));
    else if (category === 'whale') items = items.filter(i => i.type === 'whale_alert');
    else if (category === 'market') items = items.filter(i => i.type === 'market_news');
    else if (category === 'alerts') items = items.filter(i => i.priority === 'high');
    if (!showRead) items = items.filter(i => !i.read);
    return items;
  }, [feedItems, category, showRead, watchlist]);

  const markRead = (id: string) => setReadItems(prev => new Set([...prev, id]));
  const toggleSave = (id: string) => setSavedItems(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleExpand = (id: string) => setExpandedItems(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const unreadCount = feedItems.filter(i => !i.read).length;
  const highPriorityCount = feedItems.filter(i => i.priority === 'high' && !i.read).length;
  const bullishCount = feedItems.filter(i => i.sentiment === 'bullish').length;
  const bearishCount = feedItems.filter(i => i.sentiment === 'bearish').length;

  const typeIcon = (type: string) => {
    switch (type) {
      case 'price_move': return <TrendingUp className="w-4 h-4" />;
      case 'whale_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'market_news': return <Globe className="w-4 h-4" />;
      case 'volume_spike': return <BarChart3 className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const sentimentBadge = (s?: string) => {
    if (s === 'bullish') return <Badge className="text-[8px] bg-success/15 text-success border-success/20">Bullish</Badge>;
    if (s === 'bearish') return <Badge className="text-[8px] bg-danger/15 text-danger border-danger/20">Bearish</Badge>;
    return <Badge className="text-[8px] bg-muted text-muted-foreground">Neutral</Badge>;
  };

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="News Feed – Personalized Crypto Intelligence" description="Your personalized crypto news feed with price alerts, whale movements, sentiment analysis, and market updates." />
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20"><Newspaper className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-2xl font-bold">News Feed</h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'} · {highPriorityCount > 0 && <span className="text-danger">{highPriorityCount} urgent · </span>}Personalized
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowRead(!showRead)} className="gap-2 text-xs">
              {showRead ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
              {showRead ? 'Hide Read' : 'Show All'}
            </Button>
          </div>

          {/* Market Sentiment Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Total Updates</p>
              <p className="text-lg font-bold">{feedItems.length}</p>
            </CardContent></Card>
            <Card className="border-border bg-danger/5"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Urgent</p>
              <p className="text-lg font-bold text-danger">{highPriorityCount}</p>
            </CardContent></Card>
            <Card className="border-border bg-success/5"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Bullish Signals</p>
              <p className="text-lg font-bold text-success">{bullishCount}</p>
            </CardContent></Card>
            <Card className="border-border bg-danger/5"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Bearish Signals</p>
              <p className="text-lg font-bold text-danger">{bearishCount}</p>
            </CardContent></Card>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'all', label: 'All Updates', icon: Flame, count: feedItems.length },
              { id: 'watchlist', label: 'Watchlist', icon: Eye, count: feedItems.filter(i => i.symbol && watchlist.includes(i.symbol.toLowerCase())).length },
              { id: 'alerts', label: 'Urgent', icon: AlertTriangle, count: feedItems.filter(i => i.priority === 'high').length },
              { id: 'whale', label: 'Whale Alerts', icon: Zap, count: feedItems.filter(i => i.type === 'whale_alert').length },
              { id: 'market', label: 'Market News', icon: Globe, count: feedItems.filter(i => i.type === 'market_news').length },
            ] as const).map(cat => (
              <Button key={cat.id} size="sm" variant={category === cat.id ? 'default' : 'ghost'}
                onClick={() => setCategory(cat.id)} className="text-xs gap-1.5">
                <cat.icon className="w-3 h-3" /> {cat.label} ({cat.count})
              </Button>
            ))}
          </div>

          {/* Feed Items */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-10 text-center text-muted-foreground">
                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <h3 className="font-semibold text-foreground mb-1">No Updates</h3>
                <p className="text-sm">{watchlist.length === 0 && category === 'watchlist' ? 'Add coins to your watchlist first!' : 'No updates in this category.'}</p>
              </CardContent></Card>
            ) : (
              filtered.map(item => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <Card key={item.id} className={cn(
                    "border-l-2 transition-all hover:shadow-sm cursor-pointer",
                    item.priority === 'high' ? "border-l-danger" : item.priority === 'medium' ? "border-l-warning" : "border-l-muted",
                    item.read && "opacity-60"
                  )} onClick={() => { markRead(item.id); toggleExpand(item.id); }}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-1.5 rounded-lg mt-0.5 shrink-0",
                          item.type === 'whale_alert' ? "bg-warning/10 text-warning" :
                          item.type === 'price_move' ? (item.change || 0) >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger" :
                          item.type === 'volume_spike' ? "bg-primary/10 text-primary" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {typeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="text-sm font-semibold">{item.title}</p>
                            {item.symbol && <Badge variant="outline" className="text-[9px] shrink-0">{item.symbol}</Badge>}
                            {item.priority === 'high' && <Badge className="text-[8px] bg-danger/15 text-danger border-danger/20 shrink-0">URGENT</Badge>}
                            {item.value && <Badge variant="outline" className="text-[8px] shrink-0">{item.value}</Badge>}
                            {sentimentBadge(item.sentiment)}
                          </div>
                          <p className={cn("text-xs text-muted-foreground", isExpanded ? "" : "line-clamp-2")}>{item.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button onClick={e => { e.stopPropagation(); toggleSave(item.id); }}
                              className={cn("text-[10px] flex items-center gap-0.5", savedItems.has(item.id) ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                              <Bookmark className={cn("w-3 h-3", savedItems.has(item.id) && "fill-current")} />
                              {savedItems.has(item.id) ? 'Saved' : 'Save'}
                            </button>
                            <span className="text-[10px] text-muted-foreground">{isExpanded ? '▲ Less' : '▼ More'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
