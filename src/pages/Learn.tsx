import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/MainSEO";
import { useAIBlog, BlogPost } from "@/hooks/useAIBlog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, TrendingUp, BarChart3, Zap, Brain, Shield,
  LineChart, Globe, Layers, Coins, Image, Target, Scale,
  ArrowLeftRight, Activity, PiggyBank, Clock, Calendar,
  ArrowRight, RefreshCw, Search, X, Sparkles, GraduationCap
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { LearnSEOContent } from "@/components/seo/index";
import { EDUCATIONAL_ARTICLES } from "@/lib/educationalArticles";

const categoryIcons: Record<string, typeof BookOpen> = {
  'Market Structure': BarChart3,
  'On-Chain Analytics': Activity,
  'DeFi Deep Dive': Zap,
  'Bitcoin Analysis': Coins,
  'Ethereum Ecosystem': Brain,
  'Altcoin Research': TrendingUp,
  'Risk Management': Shield,
  'Market Sentiment': LineChart,
  'Technical Analysis': Target,
  'Macro Economics': Globe,
  'Blockchain Technology': Layers,
  'Layer 2 Solutions': Layers,
  'Stablecoin Analysis': Coins,
  'NFT & Digital Assets': Image,
  'Trading Psychology': Brain,
  'Regulatory Landscape': Scale,
  'Capital Rotation': ArrowLeftRight,
  'Derivatives Analysis': LineChart,
  'Network Fundamentals': Activity,
  'Investment Strategies': PiggyBank,
};

const ARTICLES_PER_PAGE = 16;

function ArticleCard({ post }: { post: BlogPost }) {
  const Icon = categoryIcons[post.category] || BookOpen;

  return (
    <Link to={`/insights/${post.slug || post.id}`} className="group">
      <Card className="h-full overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 active:scale-[0.99]">
        <CardContent className="p-0">
          <div className="relative h-32 sm:h-40 overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="absolute top-2.5 left-2.5">
              <Badge variant="secondary" className="text-[10px] backdrop-blur-sm bg-background/70 shadow-sm gap-1">
                <Icon className="w-2.5 h-2.5" />
                {post.category.split(' ')[0]}
              </Badge>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-card to-transparent" />
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            <h3 className="font-display font-semibold text-sm sm:text-[15px] line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {post.metaDescription || post.content.substring(0, 120)}
            </p>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                {post.wordCount && <><span className="text-muted-foreground/40">·</span><span>{post.wordCount} words</span></>}
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/40">
      <CardContent className="p-0">
        <Skeleton className="h-40 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2 pt-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-16" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Learn() {
  const { data, isLoading, refetch, isFetching } = useAIBlog();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    if (!data?.posts) return ['All'];
    const uniqueCats = [...new Set(data.posts.map(p => p.category))];
    return ['All', ...uniqueCats.sort()];
  }, [data?.posts]);

  const availableDates = useMemo(() => {
    if (!data?.posts) return [];
    const dates = [...new Set(data.posts.map(p => format(parseISO(p.publishedAt), 'yyyy-MM-dd')))];
    return dates.sort((a, b) => b.localeCompare(a)).slice(0, 14);
  }, [data?.posts]);

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, 'MMM dd');
  };

  const filteredPosts = useMemo(() => {
    let posts = data?.posts || [];
    if (selectedDate !== 'all') {
      posts = posts.filter(p => format(parseISO(p.publishedAt), 'yyyy-MM-dd') === selectedDate);
    }
    if (activeCategory !== 'All') {
      posts = posts.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.primaryKeyword?.toLowerCase().includes(query)
      );
    }
    return posts;
  }, [data?.posts, activeCategory, searchQuery, selectedDate]);

  const totalPages = Math.ceil(filteredPosts.length / ARTICLES_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const isFiltered = activeCategory !== 'All' || searchQuery.trim() || selectedDate !== 'all';
  const showFeatured = !isFiltered && currentPage === 1 && filteredPosts.length > 0;
  const featuredPost = showFeatured ? filteredPosts[0] : null;
  const gridPosts = featuredPost ? paginatedPosts.filter(p => p.id !== featuredPost.id) : paginatedPosts;

  const handleCategoryChange = useCallback((cat: string) => { setActiveCategory(cat); setCurrentPage(1); }, []);
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); }, []);
  const handleDateChange = useCallback((d: string) => { setSelectedDate(d); setCurrentPage(1); }, []);
  const clearFilters = useCallback(() => { setActiveCategory('All'); setSearchQuery(''); setSelectedDate('all'); setCurrentPage(1); }, []);

  return (
    <Layout>
      <SEO
        title="Crypto Insights - Daily AI-Powered Analysis | Oracle Bull"
        description="Get 20 fresh AI-generated cryptocurrency articles daily. Expert analysis on market structure, DeFi, Bitcoin, Ethereum, altcoins, trading strategies, and more."
      />

      <div className="min-h-screen pt-16 sm:pt-20 pb-24 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">

          {/* ═══════════ HERO ═══════════ */}
          <header className="mb-8 sm:mb-10">
            <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-card to-card border border-border/50 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-primary/15 text-primary border-primary/25 text-xs gap-1">
                      <Sparkles className="w-3 h-3" /> AI-Generated
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      <RefreshCw className="w-3 h-3" /> Updated Daily
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight mb-2">
                    Crypto Insights
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-lg leading-relaxed">
                    Daily AI-powered analysis on market trends, DeFi, Bitcoin, altcoins, and trading strategies.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <strong className="text-foreground">{data?.totalArticles || '—'}</strong> articles
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* ═══════════ SEARCH & FILTERS ═══════════ */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-9 pr-8 bg-card border-border/50 h-10 text-sm rounded-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Select value={selectedDate} onValueChange={handleDateChange}>
                <SelectTrigger className="w-full sm:w-[150px] h-10 bg-card border-border/50 text-sm rounded-lg">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Dates</SelectItem>
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date}>{formatDateLabel(date)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category pills */}
            <div className="overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
              <div className="flex gap-1.5 min-w-max sm:min-w-0 sm:flex-wrap">
                {categories.map(cat => {
                  const Icon = categoryIcons[cat] || BookOpen;
                  const isActive = activeCategory === cat;
                  const count = cat === 'All'
                    ? data?.posts?.length || 0
                    : data?.posts?.filter(p => p.category === cat).length || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      {cat !== 'All' && <Icon className="h-3 w-3" />}
                      {cat === 'All' ? 'All' : cat.split(' ')[0]}
                      <span className={cn(
                        "text-[10px] ml-0.5 px-1.5 py-0.5 rounded-full",
                        isActive ? "bg-primary-foreground/20" : "bg-muted/60"
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isFiltered && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}</span>
                <button onClick={clearFilters} className="text-primary hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear filters
                </button>
              </div>
            )}
          </div>

          {/* ═══════════ FEATURED ═══════════ */}
          {!isLoading && featuredPost && (
            <Link
              to={`/insights/${featuredPost.slug || featuredPost.id}`}
              className="group block mb-8"
            >
              <Card className="overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-0">
                    <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-muted/10">
                      {featuredPost.imageUrl && (
                        <img
                          src={featuredPost.imageUrl}
                          alt={featuredPost.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-card via-card/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 sm:hidden">
                        <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] mb-2">Featured</Badge>
                        <h2 className="text-lg font-display font-bold leading-tight line-clamp-2">{featuredPost.title}</h2>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col justify-center p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/15 text-primary border-primary/25 text-xs">Featured</Badge>
                        <Badge variant="secondary" className="text-xs">{featuredPost.category}</Badge>
                      </div>
                      <h2 className="text-xl lg:text-2xl font-display font-bold group-hover:text-primary transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                        {featuredPost.metaDescription || featuredPost.content.substring(0, 200)}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}</span>
                        <span>{featuredPost.wordCount} words</span>
                        <span className="flex items-center gap-1 text-primary ml-auto">
                          Read Article <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* ═══════════ ARTICLES GRID ═══════════ */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {gridPosts.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {gridPosts.map((post) => <ArticleCard key={post.id} post={post} />)}
                </div>
              )}

              {filteredPosts.length === 0 && (
                <div className="text-center py-16 sm:py-20">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                    {searchQuery ? `No results for "${searchQuery}".` : 'Try selecting a different category.'}
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5">
                    <X className="h-3.5 w-3.5" /> Clear filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Pagination">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 px-3 text-xs">
                    Prev
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn("w-9 h-9 text-xs p-0 rounded-lg", currentPage === pageNum && "shadow-sm")}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 px-3 text-xs">
                    Next
                  </Button>
                </nav>
              )}
            </>
          )}

          {/* ═══════════ EDUCATIONAL FUNDAMENTALS ═══════════ */}
          <section className="mt-12 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg sm:text-xl font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Crypto Fundamentals
              </h2>
              <Link to="/learn" className="text-primary text-sm flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Master cryptocurrency investing with comprehensive educational guides.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {EDUCATIONAL_ARTICLES.slice(0, 8).map((article) => (
                <Link key={article.id} to={`/learn/${article.slug}`} className="group">
                  <Card className="h-full border-border/40 hover:border-primary/30 transition-all duration-200 hover:shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                      <Badge variant="outline" className="text-[10px] mb-2">{article.category}</Badge>
                      <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {article.metaDescription}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                        <Clock className="w-2.5 h-2.5" /> {article.readTime}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <LearnSEOContent />

          <div className="text-center mt-8 text-xs text-muted-foreground">
            Showing {paginatedPosts.length} of {filteredPosts.length} articles
            {data?.totalArticles ? <span> · {data.totalArticles} total published</span> : null}
          </div>

          {/* ═══════ NOSCRIPT CRAWLABLE LINKS ═══════ */}
          <noscript>
            <div style={{ padding: '24px 0' }}>
              <h2>Cryptocurrency Educational Guides</h2>
              <p>Comprehensive guides covering crypto market analysis, DeFi, on-chain analytics, trading strategies, and blockchain technology fundamentals.</p>
              <ul>
                {EDUCATIONAL_ARTICLES.map(article => (
                  <li key={article.slug}>
                    <a href={`https://oraclebull.com/learn/${article.slug}`}>{article.title}</a>
                    {article.metaDescription && <span> — {article.metaDescription}</span>}
                  </li>
                ))}
              </ul>
              {data?.posts?.map(post => (
                <li key={post.slug}>
                  <a href={`https://oraclebull.com/learn/${post.slug}`}>{post.title}</a>
                </li>
              ))}
              <p>
                <a href="https://oraclebull.com/insights">Market Insights</a> · 
                <a href="https://oraclebull.com/predictions">Price Predictions</a> · 
                <a href="https://oraclebull.com/dashboard">Market Dashboard</a> · 
                <a href="https://oraclebull.com/sentiment">Sentiment Analysis</a>
              </p>
            </div>
          </noscript>
        </div>
      </div>
    </Layout>
  );
}
