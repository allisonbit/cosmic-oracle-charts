import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useInsights } from "@/hooks/useInsights";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Search, Clock, ChevronLeft, ChevronRight, FileText, TrendingUp,
  BarChart3, Activity, Calendar, Flame, Shield, Gamepad2, Gift, 
  Newspaper, Zap, BookOpen, ArrowRight, X, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { BannerAd, InArticleAd } from "@/components/ads";
import { InsightsSEOContent } from "@/components/seo";
import { EducationalArticlesPanel } from "@/components/insights/EducationalArticlesPanel";

const ARTICLES_PER_PAGE = 12;

const categories = [
  { id: "all", label: "All Articles", icon: FileText },
  { id: "breaking", label: "Breaking", icon: Newspaper },
  { id: "bitcoin", label: "Bitcoin & ETH", icon: Activity },
  { id: "altcoins", label: "Altcoins", icon: TrendingUp },
  { id: "defi", label: "DeFi", icon: BarChart3 },
  { id: "nft", label: "NFTs", icon: Gamepad2 },
  { id: "airdrop", label: "Airdrops", icon: Gift },
  { id: "security", label: "Security", icon: Shield },
  { id: "market", label: "Analysis", icon: Flame },
];

function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/40">
      <CardContent className="p-0">
        <Skeleton className="h-40 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturedSkeleton() {
  return (
    <Card className="overflow-hidden border-border/40">
      <CardContent className="p-0">
        <Skeleton className="h-56 w-full" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Insights() {
  const { data, isLoading } = useInsights();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("all");

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

  const filteredArticles = useMemo(() => {
    if (!data?.posts) return [];
    let filtered = data.posts;

    if (selectedDate !== "all") {
      filtered = filtered.filter(post => format(parseISO(post.publishedAt), 'yyyy-MM-dd') === selectedDate);
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.metaDescription?.toLowerCase().includes(query) ||
        post.primaryKeyword?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [data?.posts, selectedCategory, searchQuery, selectedDate]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const featuredArticles = data?.posts?.slice(0, 3) || [];
  const todayCount = data?.todayArticles || 0;
  const isFiltered = selectedCategory !== "all" || searchQuery.trim() || selectedDate !== "all";
  const showFeatured = featuredArticles.length > 0 && !isFiltered && currentPage === 1;

  const handleCategoryChange = useCallback((cat: string) => { setSelectedCategory(cat); setCurrentPage(1); }, []);
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); }, []);
  const handleDateChange = useCallback((d: string) => { setSelectedDate(d); setCurrentPage(1); }, []);
  const clearFilters = useCallback(() => { setSelectedCategory("all"); setSearchQuery(""); setSelectedDate("all"); setCurrentPage(1); }, []);

  const structuredData = {
    "@context": "https://schema.org", "@type": "Blog",
    "name": "Oracle Bull Crypto Insights",
    "description": "Expert cryptocurrency market analysis, on-chain data insights, and trading intelligence updated daily.",
    "url": "https://oraclebull.com/insights",
    "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" },
    "blogPost": paginatedArticles.slice(0, 10).map(post => ({
      "@type": "BlogPosting", "headline": post.title, "description": post.metaDescription,
      "url": `https://oraclebull.com/insights/${post.slug}`, "datePublished": post.publishedAt,
      "author": { "@type": "Organization", "name": "Oracle Bull" }
    }))
  };

  return (
    <Layout>
      <Helmet>
        <title>Crypto Market Insights & Analysis | Oracle Bull</title>
        <meta name="description" content="Daily AI-powered cryptocurrency market analysis. Expert insights on Bitcoin, Ethereum, DeFi, altcoins, and more. Updated every day." />
        <link rel="canonical" href="https://oraclebull.com/insights" />
        <meta property="og:title" content="Crypto Market Insights | Oracle Bull" />
        <meta property="og:description" content="Daily AI-powered crypto analysis and trading intelligence." />
        <meta property="og:url" content="https://oraclebull.com/insights" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen pt-16 sm:pt-20 pb-24 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">

          {/* ═══════════ HERO ═══════════ */}
          <header className="mb-8 sm:mb-10">
            <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-card to-card border border-border/50 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-primary/15 text-primary border-primary/25 text-xs gap-1">
                      <Sparkles className="w-3 h-3" /> AI-Powered
                    </Badge>
                    {todayCount > 0 && (
                      <Badge variant="outline" className="text-xs gap-1 border-green-500/30 text-green-600 dark:text-green-400">
                        <Zap className="w-3 h-3" /> {todayCount} new today
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight mb-2">
                    Market Insights
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-lg leading-relaxed">
                    Expert analysis on crypto markets, generated daily with real-time data.
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
                </div>
              </div>
            </div>
          </header>

          {/* ═══════════ SEARCH & FILTERS ═══════════ */}
          <div className="mb-6 space-y-3">
            {/* Search + Date row */}
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
                    onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
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
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active filters indicator */}
            {isFiltered && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''}</span>
                <button onClick={clearFilters} className="text-primary hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear filters
                </button>
              </div>
            )}
          </div>

          {/* ═══════════ FEATURED ═══════════ */}
          {isLoading && currentPage === 1 && !isFiltered ? (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Latest</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2"><FeaturedSkeleton /></div>
                <div className="space-y-4">
                  <FeaturedSkeleton />
                  <FeaturedSkeleton />
                </div>
              </div>
            </section>
          ) : showFeatured && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Latest</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main featured */}
                <Link to={`/insights/${featuredArticles[0].slug}`} className="group md:col-span-2">
                  <Card className="h-full overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <CardContent className="p-0">
                      <div className="h-40 sm:h-56 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent relative overflow-hidden">
                        {featuredArticles[0].imageUrl && (
                          <img src={featuredArticles[0].imageUrl} alt={featuredArticles[0].title} className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                        )}
                        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-card to-transparent" />
                        <Badge variant="secondary" className="absolute top-3 left-3 text-[10px] backdrop-blur-sm bg-background/70">{featuredArticles[0].category}</Badge>
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="font-display font-bold text-base sm:text-xl line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {featuredArticles[0].title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 hidden sm:block leading-relaxed">
                          {featuredArticles[0].metaDescription}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featuredArticles[0].readTime}</span>
                          <span>{featuredArticles[0].wordCount} words</span>
                          <ArrowRight className="h-3.5 w-3.5 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Side featured */}
                <div className="flex flex-col gap-4">
                  {featuredArticles.slice(1, 3).map((article) => (
                    <Link key={article.id} to={`/insights/${article.slug}`} className="group flex-1">
                      <Card className="h-full overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/5">
                        <CardContent className="p-0">
                          <div className="h-24 sm:h-28 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
                            {article.imageUrl && (
                              <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300" loading="lazy" />
                            )}
                            <Badge variant="secondary" className="absolute top-2.5 left-2.5 text-[10px] backdrop-blur-sm bg-background/70">{article.category}</Badge>
                          </div>
                          <div className="p-3 sm:p-4">
                            <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                              <Clock className="h-2.5 w-2.5" /> {article.readTime}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          <BannerAd className="mb-6" />

          {/* ═══════════ ARTICLES GRID ═══════════ */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {paginatedArticles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedArticles.map((post) => (
                    <Link key={post.id} to={`/insights/${post.slug}`} className="group">
                      <Card className="h-full overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 active:scale-[0.99]">
                        <CardContent className="p-0">
                          {/* Image header */}
                          <div className="h-32 sm:h-40 relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                            {post.imageUrl && (
                              <img src={post.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                            )}
                            <div className="absolute top-2.5 left-2.5">
                              <Badge variant="secondary" className="text-[10px] backdrop-blur-sm bg-background/70 shadow-sm">
                                {post.category}
                              </Badge>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-card to-transparent" />
                          </div>

                          <div className="p-4 space-y-2.5">
                            <h3 className="font-display font-semibold text-sm sm:text-[15px] line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                              {post.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {post.metaDescription}
                            </p>
                            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-2.5 border-t border-border/30">
                              <div className="flex items-center gap-2.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {post.readTime}
                                </span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>{post.wordCount} words</span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {paginatedArticles.length === 0 && (
                <div className="text-center py-16 sm:py-20">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                    Try adjusting your search term or category filter to find what you're looking for.
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5">
                    <X className="h-3.5 w-3.5" /> Clear all filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-9 px-3 text-xs gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
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
                          className={cn(
                            "w-9 h-9 text-xs p-0 rounded-lg",
                            currentPage === pageNum && "shadow-sm"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 text-xs gap-1"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </nav>
              )}
            </>
          )}

          <InArticleAd className="mt-8" />
          <EducationalArticlesPanel />
          <InsightsSEOContent />

          <div className="text-center mt-8 text-xs text-muted-foreground">
            Showing {paginatedArticles.length} of {filteredArticles.length} articles
            {data?.totalArticles ? <span> · {data.totalArticles} total published</span> : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
