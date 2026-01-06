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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { BannerAd, InArticleAd } from "@/components/ads";
import { InsightsSEOContent } from "@/components/seo";

const ARTICLES_PER_PAGE = 12;

const categories = [
  { id: "all", label: "All Articles", icon: FileText },
  { id: "ethereum", label: "Ethereum", icon: Activity },
  { id: "base", label: "Base", icon: BarChart3 },
  { id: "solana", label: "Solana", icon: TrendingUp },
  { id: "bitcoin", label: "Bitcoin", icon: Activity },
  { id: "market", label: "Market Analysis", icon: BarChart3 },
];

export default function Insights() {
  const { data, isLoading } = useInsights();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("all");

  // Get unique dates from articles
  const availableDates = useMemo(() => {
    if (!data?.posts) return [];
    const dates = [...new Set(data.posts.map(p => format(parseISO(p.publishedAt), 'yyyy-MM-dd')))];
    return dates.sort((a, b) => b.localeCompare(a));
  }, [data?.posts]);

  // Format date for display
  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today (${format(date, 'MMM dd')})`;
    if (isYesterday(date)) return `Yesterday (${format(date, 'MMM dd')})`;
    return format(date, 'MMM dd, yyyy');
  };

  const filteredArticles = useMemo(() => {
    if (!data?.posts) return [];
    
    let filtered = data.posts;
    
    // Date filter
    if (selectedDate !== "all") {
      filtered = filtered.filter(post => 
        format(parseISO(post.publishedAt), 'yyyy-MM-dd') === selectedDate
      );
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => 
        post.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.metaDescription.toLowerCase().includes(query) ||
        post.primaryKeyword.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [data?.posts, selectedCategory, searchQuery, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const featuredArticle = data?.posts?.[0];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Oracle Bull Crypto Insights",
    "description": "Expert cryptocurrency market analysis, on-chain data insights, and trading intelligence updated daily.",
    "url": "https://oraclebull.com/insights",
    "publisher": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": "https://oraclebull.com"
    },
    "blogPost": paginatedArticles.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.metaDescription,
      "url": `https://oraclebull.com/insights/${post.slug}`,
      "datePublished": post.publishedAt,
      "author": {
        "@type": "Organization",
        "name": "Oracle Bull"
      }
    }))
  };

  return (
    <Layout>
      <Helmet>
        <title>Crypto Market Insights & Analysis | Oracle Bull</title>
        <meta name="description" content="Daily cryptocurrency market analysis, on-chain data insights, Ethereum, Bitcoin, Solana, and Base network intelligence. Expert trading research updated every day." />
        <meta name="keywords" content="crypto analysis, ethereum analysis, bitcoin prediction, solana insights, base network, on-chain data, market sentiment, crypto trading" />
        <link rel="canonical" href="https://oraclebull.com/insights" />
        <meta property="og:title" content="Crypto Market Insights & Analysis | Oracle Bull" />
        <meta property="og:description" content="Daily cryptocurrency market analysis and trading intelligence. Expert insights on Ethereum, Bitcoin, Solana, Base, and more." />
        <meta property="og:url" content="https://oraclebull.com/insights" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen pt-16 sm:pt-20 pb-24 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <header className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-2 sm:mb-4">
              Crypto Market <span className="text-primary glow-text">Insights</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
              Your comprehensive crypto blog • <span className="text-primary font-medium">{data?.totalArticles || 20} fresh articles</span> added today
            </p>
            {/* Today's Date Banner */}
            <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm px-3 py-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Badge>
            </div>
          </header>

          {/* Search and Filters */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            {/* Search and Date Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 bg-card/50 border-primary/20 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
              
              {/* Date Filter Dropdown */}
              <Select value={selectedDate} onValueChange={handleDateChange}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 sm:h-11 bg-card/50 border-primary/20">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">All Dates</SelectItem>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {formatDateLabel(date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filters - Scrollable on mobile */}
            <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
              <div className="flex sm:flex-wrap sm:justify-center gap-2 min-w-max sm:min-w-0">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm whitespace-nowrap touch-manipulation active:scale-95",
                        selectedCategory === cat.id && "glow-text"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline sm:inline">{cat.label}</span>
                      <span className="xs:hidden">{cat.label.split(' ')[0]}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Featured Article */}
          {featuredArticle && selectedCategory === "all" && !searchQuery && currentPage === 1 && (
            <Link to={`/insights/${featuredArticle.slug}`} className="block mb-6 sm:mb-8">
              <Card className="group overflow-hidden border-primary/30 hover:border-primary/50 active:scale-[0.99] transition-all bg-gradient-to-br from-primary/5 to-transparent touch-manipulation">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <Badge variant="secondary" className="mb-2 sm:mb-4 text-xs">Featured</Badge>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-display font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">
                    {featuredArticle.metaDescription}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{featuredArticle.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {featuredArticle.readTime}
                    </span>
                    <span className="hidden sm:inline">{featuredArticle.wordCount} words</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          
          {/* Ad placement before articles grid */}
          <BannerAd className="mb-6 sm:mb-8" />

          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-28 sm:h-40 w-full" />
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                      <Skeleton className="h-4 sm:h-6 w-full" />
                      <Skeleton className="h-3 sm:h-4 w-full" />
                      <Skeleton className="h-3 sm:h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {paginatedArticles.map((post, index) => (
                  <Link 
                    key={post.id} 
                    to={`/insights/${post.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden border-border/50 hover:border-primary/50 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-primary/10 touch-manipulation">
                      <CardContent className="p-0">
                        {/* Article Image Placeholder */}
                        <div className="h-24 sm:h-32 md:h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary/30">
                            {post.category.charAt(0)}
                          </div>
                        </div>
                        
                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {post.category}
                          </Badge>
                          
                          <h3 className="font-display font-semibold text-sm sm:text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                            {post.metaDescription}
                          </p>
                          
                          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground pt-2 border-t border-border/50">
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {post.readTime}
                            </span>
                            <span className="hidden sm:inline">{post.wordCount} words</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {paginatedArticles.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>
                  
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 sm:w-10 sm:h-9 text-xs sm:text-sm p-0"
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
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </nav>
              )}
            </>
          )}

          {/* In-article ad after article count */}
          <InArticleAd className="mt-8" />
          
          {/* SEO Content Section */}
          <InsightsSEOContent />

          {/* Article Count */}
          <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
            Showing {paginatedArticles.length} of {filteredArticles.length} articles
            {data?.totalArticles && <span className="hidden sm:inline"> • {data.totalArticles} total published</span>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
