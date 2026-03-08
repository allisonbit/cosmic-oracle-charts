import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import {
  Newspaper, Bell, BellOff, TrendingUp, TrendingDown, AlertTriangle,
  Flame, BarChart3, Zap, Eye, Globe, Clock, Filter, Bookmark
} from "lucide-react";

type FeedCategory = 'all' | 'watchlist' | 'market' | 'whale' | 'alerts';

interface FeedItem {
  id: string;
  type: 'price_move' | 'whale_alert' | 'market_news' | 'volume_spike' | 'trend_change';
  title: string;
  description: string;
  symbol?: string;
  change?: number;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

export default function MyNewsFeed() {
  const { profile } = useAuth();
  const { data: priceData } = useCryptoPrices();
  const [category, setCategory] = useState<FeedCategory>('all');
  const [showRead, setShowRead] = useState(true);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const watchlist = profile?.watchlist || [];

  // Generate personalized feed from market data
  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];
    const prices = priceData?.prices || [];
    const now = new Date();

    // Price movement alerts for watchlist
    prices.forEach((coin, i) => {
      const isWatchlisted = watchlist.includes(coin.symbol?.toLowerCase());
      const absChange = Math.abs(coin.change24h || 0);

      if (absChange > 3 || isWatchlisted) {
        items.push({
          id: `price-${coin.symbol}`,
          type: 'price_move',
          title: `${coin.name} ${(coin.change24h || 0) >= 0 ? '📈' : '📉'} ${coin.change24h?.toFixed(2)}% (24h)`,
          description: `${coin.name} is trading at $${coin.price?.toLocaleString()} with ${absChange > 5 ? 'significant' : 'moderate'} movement. 24h volume: $${(coin.volume24h / 1e6).toFixed(1)}M.`,
          symbol: coin.symbol,
          change: coin.change24h,
          timestamp: new Date(now.getTime() - Math.random() * 3600000),
          priority: absChange > 5 ? 'high' : absChange > 2 ? 'medium' : 'low',
          read: readItems.has(`price-${coin.symbol}`),
        });
      }

      // Volume spikes
      if (coin.volume24h && coin.marketCap && (coin.volume24h / coin.marketCap) > 0.15) {
        items.push({
          id: `vol-${coin.symbol}`,
          type: 'volume_spike',
          title: `🔊 Volume Spike: ${coin.symbol} trading at ${((coin.volume24h / coin.marketCap) * 100).toFixed(0)}% of MCap`,
          description: `Unusually high trading volume detected for ${coin.name}. This could indicate upcoming volatility or institutional interest.`,
          symbol: coin.symbol,
          timestamp: new Date(now.getTime() - Math.random() * 7200000),
          priority: 'medium',
          read: readItems.has(`vol-${coin.symbol}`),
        });
      }
    });

    // Simulated whale alerts
    ['BTC', 'ETH', 'SOL'].forEach((sym, i) => {
      items.push({
        id: `whale-${sym}-${i}`,
        type: 'whale_alert',
        title: `🐋 Whale Alert: ${(Math.random() * 500 + 100).toFixed(0)} ${sym} transferred`,
        description: `Large ${sym} transfer detected from exchange to unknown wallet. Possible accumulation signal.`,
        symbol: sym,
        timestamp: new Date(now.getTime() - Math.random() * 14400000),
        priority: 'high',
        read: readItems.has(`whale-${sym}-${i}`),
      });
    });

    // Market news
    [
      { title: '📊 Bitcoin Dominance Rises Above 56%', desc: 'BTC dominance continues to climb as altcoins face selling pressure. Historically, this precedes altcoin rotation periods.' },
      { title: '🏛️ SEC Announces New Crypto Framework Review', desc: 'The SEC has initiated a comprehensive review of crypto regulatory framework, expected to impact DeFi protocols and stablecoins.' },
      { title: '🔗 Ethereum L2 Activity Hits Record High', desc: 'Layer 2 networks process more transactions than Ethereum mainnet for the first time, led by Arbitrum and Base.' },
      { title: '💰 Stablecoin Market Cap Reaches $190B', desc: 'Total stablecoin supply hits new all-time high, signaling increased capital inflow to crypto markets.' },
    ].forEach((news, i) => {
      items.push({
        id: `news-${i}`,
        type: 'market_news',
        title: news.title,
        description: news.desc,
        timestamp: new Date(now.getTime() - (i + 1) * 3600000),
        priority: i === 0 ? 'high' : 'medium',
        read: readItems.has(`news-${i}`),
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
  const unreadCount = feedItems.filter(i => !i.read).length;

  const typeIcon = (type: string) => {
    switch(type) {
      case 'price_move': return <TrendingUp className="w-4 h-4" />;
      case 'whale_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'market_news': return <Globe className="w-4 h-4" />;
      case 'volume_spike': return <BarChart3 className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const priorityColor = (p: string) => p === 'high' ? 'border-l-danger' : p === 'medium' ? 'border-l-warning' : 'border-l-muted';

  return (
    <ProtectedRoute>
      <Layout>
        <SEO title="News Feed – Personalized Crypto Intelligence" description="Your personalized crypto news feed with price alerts, whale movements, and market updates tailored to your watchlist." />
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20"><Newspaper className="w-6 h-6 text-primary" /></div>
              <div>
                <h1 className="text-2xl font-bold">News Feed</h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up!'} · Personalized to your watchlist
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowRead(!showRead)} className="gap-2 text-xs">
              {showRead ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
              {showRead ? 'Hide Read' : 'Show All'}
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'all', label: 'All Updates', icon: Flame },
              { id: 'watchlist', label: 'Watchlist', icon: Eye },
              { id: 'alerts', label: 'High Priority', icon: AlertTriangle },
              { id: 'whale', label: 'Whale Alerts', icon: Zap },
              { id: 'market', label: 'Market News', icon: Globe },
            ] as const).map(cat => (
              <Button key={cat.id} size="sm" variant={category === cat.id ? 'default' : 'ghost'}
                onClick={() => setCategory(cat.id)} className="text-xs gap-1.5">
                <cat.icon className="w-3 h-3" /> {cat.label}
              </Button>
            ))}
          </div>

          {/* Feed Items */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">
                <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No updates in this category. {watchlist.length === 0 && category === 'watchlist' ? 'Add coins to your watchlist first!' : ''}</p>
              </CardContent></Card>
            ) : (
              filtered.map(item => (
                <Card key={item.id} className={cn(
                  "border-l-2 transition-all hover:shadow-sm cursor-pointer",
                  priorityColor(item.priority),
                  item.read && "opacity-60"
                )} onClick={() => markRead(item.id)}>
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold truncate">{item.title}</p>
                          {item.symbol && <Badge variant="outline" className="text-[9px] shrink-0">{item.symbol}</Badge>}
                          {item.priority === 'high' && <Badge className="text-[9px] bg-danger/20 text-danger border-danger/30 shrink-0">URGENT</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
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
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
