import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCryptoFactory } from "@/hooks/useCryptoFactory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, Search, RefreshCw, Flame, Zap, Target, Activity,
  Calendar, Newspaper, ChevronRight, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { TopCryptoPredictionLinks } from "@/components/factory/AssetPredictionLinks";

function FactoryNarrativesSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Crypto Narratives & Trends - Market Sectors Today | Oracle Bull",
    description: "Track trending cryptocurrency narratives and market sectors. Discover which crypto themes are gaining momentum: AI tokens, DeFi, Layer 2s, meme coins, and more.",
    url: "https://oraclebull.com/factory/narratives",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://oraclebull.com" },
        { "@type": "ListItem", position: 2, name: "Crypto Factory", item: "https://oraclebull.com/factory" },
        { "@type": "ListItem", position: 3, name: "Narratives", item: "https://oraclebull.com/factory/narratives" }
      ]
    }
  };

  return (
    <Helmet>
      <title>Crypto Narratives & Trends | Market Sectors Today | Oracle Bull</title>
      <meta name="description" content="Track trending cryptocurrency narratives and market sectors in real-time. Discover which themes are gaining momentum: AI tokens, DeFi protocols, Layer 2 solutions, meme coins, and emerging crypto trends." />
      <meta name="keywords" content="crypto narratives, crypto trends, market sectors, AI tokens, DeFi, Layer 2, meme coins, crypto themes, market momentum" />
      <link rel="canonical" href="https://oraclebull.com/factory/narratives" />
      <meta property="og:title" content="Crypto Narratives & Trends | Hot Sectors Today | Oracle Bull" />
      <meta property="og:description" content="Track trending crypto narratives and market sectors. See which themes are gaining momentum in real-time." />
      <meta property="og:url" content="https://oraclebull.com/factory/narratives" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

function NarrativeCard({ narrative }: { narrative: any }) {
  const sentimentColors = {
    bullish: 'text-green-400 bg-green-500/10 border-green-500/30',
    neutral: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    bearish: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const sentimentLabels = {
    bullish: 'Bullish Momentum',
    neutral: 'Consolidating',
    bearish: 'Bearish Pressure',
  };

  return (
    <article className="border rounded-lg border-border/50 p-5 hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{narrative.narrative}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={cn("border", sentimentColors[narrative.sentiment as keyof typeof sentimentColors])}>
                {sentimentLabels[narrative.sentiment as keyof typeof sentimentLabels]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary">{narrative.momentum}</span>
          </div>
          <p className={cn(
            "text-sm font-medium",
            narrative.weeklyChange >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {narrative.weeklyChange >= 0 ? '+' : ''}{narrative.weeklyChange.toFixed(1)}% (7d)
          </p>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4">{narrative.description}</p>
      
      {/* SEO-friendly analysis */}
      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-muted-foreground">
          The <strong>{narrative.narrative}</strong> sector is showing{' '}
          <strong className={narrative.sentiment === 'bullish' ? 'text-green-400' : narrative.sentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400'}>
            {narrative.sentiment}
          </strong> momentum with a {narrative.weeklyChange >= 0 ? 'positive' : 'negative'} 7-day performance. 
          {narrative.sentiment === 'bullish' 
            ? ' Capital is flowing into this narrative as investors position for continued growth.'
            : narrative.sentiment === 'bearish' 
            ? ' Traders are rotating out of this sector as momentum fades.'
            : ' Market participants are watching for a directional breakout.'}
        </p>
      </div>
      
      {/* Top Assets */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Top Assets in This Narrative:</p>
        <div className="flex flex-wrap gap-2">
          {narrative.topAssets.map((asset: string) => (
            <Link 
              key={asset}
              to={`/price-prediction/${asset.toLowerCase()}/daily`}
              className="inline-block"
            >
              <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
                {asset}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Related Chains */}
      {narrative.chains && narrative.chains.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Active Chains:</p>
          <div className="flex flex-wrap gap-2">
            {narrative.chains.map((chain: string) => (
              <Link 
                key={chain}
                to={`/chain/${chain.toLowerCase()}`}
              >
                <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                  {chain}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Action Links */}
      <div className="flex items-center gap-4 text-sm pt-3 border-t border-border/50">
        <Link 
          to="/strength-meter"
          className="text-primary hover:text-primary/80 flex items-center gap-1"
        >
          Strength Meter <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

export default function FactoryNarratives() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch, isFetching } = useCryptoFactory();

  const filteredNarratives = data?.narratives.filter(n => 
    n.narrative.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.topAssets.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const bullishCount = filteredNarratives.filter(n => n.sentiment === 'bullish').length;
  const bearishCount = filteredNarratives.filter(n => n.sentiment === 'bearish').length;

  return (
    <Layout>
      <FactoryNarrativesSchema />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li><Link to="/factory" className="hover:text-primary">Crypto Factory</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-foreground font-medium">Trending Narratives</li>
          </ol>
        </nav>

        {/* H1 Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold glow-text flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Crypto Narratives & Trends
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
            Track the hottest cryptocurrency narratives and market sectors. 
            From AI tokens to Layer 2 solutions—see where capital is flowing today.
          </p>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Narratives</p>
              <p className="text-2xl font-bold">{filteredNarratives.length}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-green-400">Bullish Sectors</p>
              <p className="text-2xl font-bold text-green-400">{bullishCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-red-400">Bearish Sectors</p>
              <p className="text-2xl font-bold text-red-400">{bearishCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Neutral</p>
              <p className="text-2xl font-bold">{filteredNarratives.length - bullishCount - bearishCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* SEO Introduction */}
        <section className="holo-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">What Are Crypto Narratives?</h2>
          <div className="prose max-w-none text-muted-foreground">
            <p className="mb-3">
              Crypto narratives are thematic investment trends that drive capital flows in the cryptocurrency market. 
              Understanding which narratives are gaining momentum helps traders identify potential winners 
              before mainstream adoption. Oracle Bull tracks narrative momentum across all major sectors.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1">🤖 AI & Machine Learning</h3>
                <p className="text-sm">Tokens powering decentralized AI infrastructure and compute networks.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1">🔗 Layer 2 Scaling</h3>
                <p className="text-sm">Solutions making Ethereum and Bitcoin faster and cheaper.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-1">🏦 DeFi & RWAs</h3>
                <p className="text-sm">Decentralized finance and real-world asset tokenization.</p>
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
                  placeholder="Search narratives or assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/30"
                />
              </div>
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

        {/* Narratives Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Active Market Narratives
              </h2>
              {isLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : filteredNarratives.length > 0 ? (
                <div className="grid gap-4">
                  {filteredNarratives.map((narrative) => (
                    <NarrativeCard key={narrative.id} narrative={narrative} />
                  ))}
                </div>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No narratives match your search.
                  </CardContent>
                </Card>
              )}
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
                  <Link to="/factory/narratives" className="flex items-center gap-2 p-2 rounded bg-primary/10 text-primary">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending Narratives</span>
                    <Badge variant="outline" className="ml-auto">{filteredNarratives.length}</Badge>
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
                  <Link to="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
                    <BarChart3 className="w-4 h-4" />
                    Market Dashboard
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Top Crypto Predictions */}
            <TopCryptoPredictionLinks />

            {/* Trading Tips */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Narrative Trading Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Focus on narratives with <strong>high momentum scores</strong></li>
                  <li>• Early entry in emerging narratives offers best returns</li>
                  <li>• Diversify across multiple bullish sectors</li>
                  <li>• Watch for narrative rotation signals</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* FAQ Section */}
        <section className="mt-8 holo-card p-6">
          <h2 className="text-xl font-semibold mb-4">Crypto Narratives FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground">How is narrative momentum calculated?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Momentum scores combine price performance, volume trends, social sentiment, and capital flows 
                for tokens within each narrative sector. Higher scores indicate stronger buying interest.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">How often do crypto narratives change?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Narratives can shift within weeks as market attention rotates. Some mega-narratives like 
                DeFi or Layer 2s persist for months, while micro-narratives may peak in days.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Should I invest in multiple narratives?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Diversifying across 2-4 strong narratives reduces risk while maintaining upside potential. 
                Avoid over-concentration in a single sector regardless of current momentum.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}