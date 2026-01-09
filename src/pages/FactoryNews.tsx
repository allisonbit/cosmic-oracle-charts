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
  Newspaper, Search, RefreshCw, ExternalLink, Clock,
  Calendar, Activity, TrendingUp, Zap, Target, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { TopCryptoPredictionLinks, MarketPagesLinks } from "@/components/factory/AssetPredictionLinks";

const sentiments = ['All', 'bullish', 'neutral', 'bearish'];

function FactoryNewsSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Crypto News Feed - AI-Analyzed Market News | Oracle Bull",
    description: "Real-time cryptocurrency news with AI-powered sentiment analysis. Get breaking crypto news, market updates, and understand their impact on prices.",
    url: "https://oraclebull.com/factory/news",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://oraclebull.com" },
        { "@type": "ListItem", position: 2, name: "Crypto Factory", item: "https://oraclebull.com/factory" },
        { "@type": "ListItem", position: 3, name: "Crypto News", item: "https://oraclebull.com/factory/news" }
      ]
    }
  };

  return (
    <Helmet>
      <title>Crypto News Today | AI-Analyzed Market News & Sentiment | Oracle Bull</title>
      <meta name="description" content="Real-time cryptocurrency news feed with AI-powered sentiment analysis. Breaking crypto news, market updates, regulatory developments, and their impact on token prices analyzed automatically." />
      <meta name="keywords" content="crypto news, cryptocurrency news, bitcoin news, ethereum news, market sentiment, crypto updates, blockchain news, defi news" />
      <link rel="canonical" href="https://oraclebull.com/factory/news" />
      <meta property="og:title" content="Crypto News Today | AI-Analyzed Sentiment | Oracle Bull" />
      <meta property="og:description" content="Real-time cryptocurrency news with AI-powered sentiment analysis. Understand market impact before trading." />
      <meta property="og:url" content="https://oraclebull.com/factory/news" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

function NewsCard({ news }: { news: any }) {
  const sentimentColors = {
    bullish: 'bg-green-500/20 text-green-400 border-green-500/30',
    neutral: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bearish: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const sentimentLabels = {
    bullish: 'Bullish',
    neutral: 'Neutral',
    bearish: 'Bearish',
  };

  const publishedDate = new Date(news.publishedAt);

  return (
    <article className="border-b border-border/50 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start gap-4">
        {/* News Image */}
        {news.imageUrl && (
          <div className="relative w-32 h-24 rounded-lg overflow-hidden shrink-0 hidden sm:block">
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2 flex items-start gap-2"
            >
              {news.title}
              <ExternalLink className="w-4 h-4 shrink-0 mt-1" />
            </a>
            <Badge className={cn("shrink-0 border", sentimentColors[news.sentiment as keyof typeof sentimentColors])}>
              {sentimentLabels[news.sentiment as keyof typeof sentimentLabels]}
            </Badge>
          </div>
          
          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="font-medium">{news.source}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(publishedDate, { addSuffix: true })}
            </span>
            {news.impactScore > 70 && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-primary border-primary/50">
                  High Impact
                </Badge>
              </>
            )}
          </div>
          
          {/* Summary */}
          <p className="text-muted-foreground mb-3">{news.summary}</p>
          
          {/* SEO-friendly analysis */}
          <div className="bg-muted/30 rounded-lg p-3 mb-3">
            <p className="text-sm text-muted-foreground">
              <strong>Market Impact:</strong> This {news.sentiment} news 
              {news.impactScore > 70 
                ? ' is likely to significantly affect prices in the short term.' 
                : news.impactScore > 40 
                ? ' may have moderate influence on market sentiment.'
                : ' has limited immediate price impact but provides market context.'}
              {' '}Published {format(publishedDate, 'MMM dd, yyyy')} at {format(publishedDate, 'HH:mm')} UTC.
            </p>
          </div>
          
          {/* Related Assets */}
          {news.relatedAssets && news.relatedAssets.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Related Assets:</p>
              <div className="flex flex-wrap gap-2">
                {news.relatedAssets.slice(0, 5).map((asset: string) => (
                  <Link 
                    key={asset}
                    to={`/price-prediction/${asset.toLowerCase()}/daily`}
                  >
                    <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
                      {asset}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Links */}
          <div className="flex items-center gap-4 text-sm">
            {news.relatedAssets && news.relatedAssets[0] && (
              <Link 
                to={`/price-prediction/${news.relatedAssets[0].toLowerCase()}/daily`}
                className="text-primary hover:text-primary/80 flex items-center gap-1"
              >
                {news.relatedAssets[0]} Analysis <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            <Link 
              to="/sentiment"
              className="text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Full Sentiment Report <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FactoryNews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');

  const { data, isLoading, refetch, isFetching } = useCryptoFactory();

  const filteredNews = (data?.news || []).filter(n => {
    const matchesSearch = searchQuery === '' || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.relatedAssets.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSentiment = sentimentFilter === 'All' || n.sentiment === sentimentFilter;
    
    return matchesSearch && matchesSentiment;
  });

  // Collect all unique assets mentioned in news
  const allMentionedAssets = useMemo(() => {
    const assets = new Set<string>();
    (data?.news || []).forEach(n => {
      n.relatedAssets?.forEach((a: string) => assets.add(a));
    });
    return Array.from(assets);
  }, [data?.news]);

  const bullishCount = filteredNews.filter(n => n.sentiment === 'bullish').length;
  const bearishCount = filteredNews.filter(n => n.sentiment === 'bearish').length;
  const highImpactCount = filteredNews.filter(n => n.impactScore > 70).length;

  return (
    <Layout>
      <FactoryNewsSchema />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li><Link to="/factory" className="hover:text-primary">Crypto Factory</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-foreground font-medium">Crypto News</li>
          </ol>
        </nav>

        {/* H1 Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold glow-text flex items-center gap-3">
            <Newspaper className="w-10 h-10 text-primary" />
            Crypto News & Sentiment
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
            Real-time cryptocurrency news with AI-powered sentiment analysis. 
            Understand market impact before you trade.
          </p>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Articles</p>
              <p className="text-2xl font-bold">{filteredNews.length}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-green-400">Bullish News</p>
              <p className="text-2xl font-bold text-green-400">{bullishCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-red-400">Bearish News</p>
              <p className="text-2xl font-bold text-red-400">{bearishCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-primary">High Impact</p>
              <p className="text-2xl font-bold text-primary">{highImpactCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* SEO Introduction */}
        <section className="holo-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">How We Analyze Crypto News</h2>
          <div className="prose prose-invert max-w-none text-muted-foreground">
            <p className="mb-3">
              Oracle Bull aggregates cryptocurrency news from 50+ sources and applies AI-powered sentiment 
              analysis to determine market impact. Each article is scored for bullish, neutral, or bearish 
              sentiment and assigned an impact score based on potential price influence.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <h3 className="font-semibold text-green-400 mb-1">Bullish Sentiment</h3>
                <p className="text-sm">News likely to drive prices higher—partnerships, adoption, positive regulation.</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <h3 className="font-semibold text-yellow-400 mb-1">Neutral Sentiment</h3>
                <p className="text-sm">Informational news with limited immediate price impact.</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <h3 className="font-semibold text-red-400 mb-1">Bearish Sentiment</h3>
                <p className="text-sm">News that may cause selling pressure—hacks, bans, negative developments.</p>
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
                  placeholder="Search news or assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/30"
                />
              </div>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-muted/30">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  {sentiments.map((sentiment) => (
                    <SelectItem key={sentiment} value={sentiment}>
                      {sentiment === 'All' ? 'All Sentiment' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
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

        {/* News List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Latest Crypto News ({filteredNews.length})
              </h2>
              <Card className="glass-card">
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="space-y-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full" />
                      ))}
                    </div>
                  ) : filteredNews.length > 0 ? (
                    filteredNews.map((news) => (
                      <NewsCard key={news.id} news={news} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No news matches your filters.
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
                  <Link to="/factory/onchain" className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                    <Activity className="w-4 h-4" />
                    <span>On-Chain Activity</span>
                  </Link>
                  <Link to="/factory/narratives" className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending Narratives</span>
                  </Link>
                  <Link to="/factory/news" className="flex items-center gap-2 p-2 rounded bg-primary/10 text-primary">
                    <Newspaper className="w-4 h-4" />
                    <span>Crypto News</span>
                    <Badge variant="outline" className="ml-auto">{filteredNews.length}</Badge>
                  </Link>
                </nav>
              </CardContent>
            </Card>

            {/* Related Links */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Related Analysis</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/sentiment" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Activity className="w-4 h-4" />
                    Full Sentiment Dashboard
                  </Link>
                  <Link to="/predictions" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Target className="w-4 h-4" />
                    Price Predictions Hub
                  </Link>
                  <Link to="/strength-meter" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <Zap className="w-4 h-4" />
                    Crypto Strength Meter
                  </Link>
                  <Link to="/insights" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <TrendingUp className="w-4 h-4" />
                    AI Market Insights
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Top Crypto Predictions */}
            <TopCryptoPredictionLinks />

            {/* Market Pages */}
            <MarketPagesLinks />

            {/* News Trading Tips */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Trading on News</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• React quickly to <strong className="text-primary">high-impact</strong> news</li>
                  <li>• Verify news from multiple sources before trading</li>
                  <li>• Consider sentiment against current trend</li>
                  <li>• Watch for overreaction opportunities</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* FAQ Section */}
        <section className="mt-8 holo-card p-6">
          <h2 className="text-xl font-semibold mb-4">Crypto News FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground">How is news sentiment calculated?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Our AI analyzes article text, headlines, and context to determine bullish, neutral, or 
                bearish sentiment. We also score impact potential based on the nature of the news and 
                historical patterns.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">How often is news updated?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Our news feed refreshes every minute, pulling from 50+ sources to ensure you never miss 
                breaking developments that could affect your positions.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Should I trade solely based on news sentiment?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                News is one input for trading decisions. Combine sentiment with technical analysis, 
                on-chain data, and broader market conditions for best results.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}