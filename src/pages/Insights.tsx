import { useState, useMemo } from "react";
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
  Newspaper, Zap, BookOpen, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { BannerAd, InArticleAd } from "@/components/ads";
import { InsightsSEOContent } from "@/components/seo";
import { EducationalArticlesPanel } from "@/components/insights/EducationalArticlesPanel";

const ARTICLES_PER_PAGE = 12;

const categories = [
  { id: "all", label: "All", icon: FileText },
  { id: "breaking", label: "Breaking", icon: Newspaper },
  { id: "bitcoin", label: "Bitcoin & ETH", icon: Activity },
  { id: "altcoins", label: "Altcoins", icon: TrendingUp },
  { id: "defi", label: "DeFi", icon: BarChart3 },
  { id: "nft", label: "NFTs", icon: Gamepad2 },
  { id: "airdrop", label: "Airdrops", icon: Gift },
  { id: "security", label: "Security", icon: Shield },
  { id: "market", label: "Analysis", icon: Flame },
];

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
    if (isToday(date)) return `Today`;
    if (isYesterday(date)) return `Yesterday`;
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

  const handleCategoryChange = (cat: string) => { setSelectedCategory(cat); setCurrentPage(1); };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleDateChange = (d: string) => { setSelectedDate(d); setCurrentPage(1); };

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
        <div className="container mx-auto px-3 sm:px-4">

          {/* ═══════════ HERO ═══════════ */}
          <header className="mb-8 sm:mb-12">
            <div className="holo-card p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-xs px-2.5 py-0.5">
                    <Zap className="w-3 h-3 mr-1" /> AI-Powered
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">
                  Crypto Market <span className="text-primary glow-text">Insights</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                  AI-generated daily analysis across Bitcoin, DeFi, altcoins, NFTs, and more.
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-primary" />
                    <strong className="text-foreground">{todayCount}</strong> new today
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <strong className="text-foreground">{data?.totalArticles || 0}</strong> total articles
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ═══════════ FEATURED ═══════════ */}
          {featuredArticles.length > 0 && selectedCategory === "all" && !searchQuery && currentPage === 1 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Latest</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {featuredArticles.map((article, i) => (
                  <Link key={article.id} to={`/insights/${article.slug}`} className="group">
                    <Card className={cn(
                      "h-full overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5",
                      i === 0 && "md:col-span-2 md:row-span-2"
                    )}>
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className={cn(
                          "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center relative overflow-hidden",
                          i === 0 ? "h-32 sm:h-48" : "h-24 sm:h-32"
                        )}>
                          {article.imageUrl && (
                            <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover opacity-30" loading="lazy" />
                          )}
                          <Badge variant="secondary" className="relative z-10 text-[10px]">{article.category}</Badge>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className={cn(
                            "font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors",
                            i === 0 ? "text-base sm:text-lg" : "text-sm"
                          )}>
                            {article.title}
                          </h3>
                          {i === 0 && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 hidden sm:block">
                              {article.metaDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mt-2">
                            <Clock className="h-2.5 w-2.5" /> {article.readTime}
                            <span className="text-muted-foreground/40">•</span>
                            {article.wordCount} words
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ═══════════ FILTERS ═══════════ */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 bg-card/50 border-border/50 h-10 text-sm"
                />
              </div>
              <Select value={selectedDate} onValueChange={handleDateChange}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card/50 border-border/50 text-sm">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
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
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                        selectedCategory === cat.id
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <BannerAd className="mb-6" />

          {/* ═══════════ ARTICLES GRID ═══════════ */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-28 sm:h-36 w-full" />
                    <div className="p-3 sm:p-4 space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {paginatedArticles.map((post) => (
                  <Link key={post.id} to={`/insights/${post.slug}`} className="group">
                    <Card className="h-full overflow-hidden border-border/50 hover:border-primary/40 transition-all hover:shadow-md hover:shadow-primary/5 active:scale-[0.99]">
                      <CardContent className="p-0">
                        {/* Image header */}
                        <div className="h-28 sm:h-36 relative overflow-hidden bg-gradient-to-br from-muted/40 to-muted/20">
                          {post.imageUrl && (
                            <img src={post.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" loading="lazy" />
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-[10px] backdrop-blur-sm bg-background/70">
                              {post.category}
                            </Badge>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-card to-transparent" />
                        </div>

                        <div className="p-3 sm:p-4 space-y-2">
                          <h3 className="font-display font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block leading-relaxed">
                            {post.metaDescription}
                          </p>
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground pt-2 border-t border-border/30">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> {post.readTime}
                              </span>
                              <span className="hidden sm:inline">{post.wordCount} words</span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {paginatedArticles.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-base font-semibold mb-1">No articles found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-1.5 mt-8" aria-label="Pagination">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-2.5 text-xs">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <Button key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm"
                          onClick={() => setCurrentPage(pageNum)} className="w-8 h-8 text-xs p-0">
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-2.5 text-xs">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </nav>
              )}
            </>
          )}

          <InArticleAd className="mt-8" />
          <EducationalArticlesPanel />
          <InsightsSEOContent />

          <div className="text-center mt-6 text-xs text-muted-foreground">
            Showing {paginatedArticles.length} of {filteredArticles.length} articles
            {data?.totalArticles ? <span> • {data.totalArticles} total published</span> : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
