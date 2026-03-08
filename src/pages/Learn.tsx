import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { SITE_URL } from "@/lib/siteConfig";
import { useAIBlog, BlogPost } from "@/hooks/useAIBlog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SocialShare, useShareMeta } from "@/components/ui/social-share";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Brain, 
  Shield,
  LineChart,
  Globe,
  Layers,
  Coins,
  Image,
  Target,
  Scale,
  ArrowLeftRight,
  Activity,
  PiggyBank,
  Clock,
  Calendar,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  ArrowLeft,
  FileText,
  Search,
  X,
  HelpCircle
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { LearnSEOContent } from "@/components/seo";
import { EDUCATIONAL_ARTICLES } from "@/lib/educationalArticles";

// Category icons mapping for 20 themes
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

const categoryColors: Record<string, string> = {
  'Market Structure': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'On-Chain Analytics': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'DeFi Deep Dive': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'Bitcoin Analysis': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Ethereum Ecosystem': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Altcoin Research': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Risk Management': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Market Sentiment': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Technical Analysis': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Macro Economics': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Blockchain Technology': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  'Layer 2 Solutions': 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  'Stablecoin Analysis': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'NFT & Digital Assets': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Trading Psychology': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Regulatory Landscape': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  'Capital Rotation': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  'Derivatives Analysis': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Network Fundamentals': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  'Investment Strategies': 'bg-stone-500/20 text-stone-400 border-stone-500/30',
};

function BlogPostCard({ post }: { post: BlogPost }) {
  const Icon = categoryIcons[post.category] || BookOpen;
  const colorClass = categoryColors[post.category] || 'bg-primary/20 text-primary border-primary/30';
  
  return (
    <Link 
      to={`/insights/${post.slug || post.id}`}
      className="glass-card hover:border-primary/40 transition-all cursor-pointer group overflow-hidden h-full flex flex-col active:scale-[0.98] touch-manipulation rounded-xl border border-border/50"
    >
      <div className="relative h-32 sm:h-36 overflow-hidden shrink-0">
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Badge className={cn("absolute top-2 left-2 border text-[10px] sm:text-xs", colorClass)}>
          <Icon className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">{post.category}</span>
          <span className="sm:hidden">{post.category.split(' ')[0]}</span>
        </Badge>
      </div>
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2 flex-1">
          {post.metaDescription || post.content.substring(0, 120)}...
        </p>
        <div className="flex items-center justify-between mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </div>
          <div className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
            Read <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogPostModal({ post, open, onClose }: { post: BlogPost | null; open: boolean; onClose: () => void }) {
  const baseUrl = SITE_URL;
  
  useEffect(() => {
    if (post && open) {
      useShareMeta({
        title: `${post.metaTitle || post.title} | Oracle Bull`,
        description: post.metaDescription,
        image: post.imageUrl,
        url: `${baseUrl}/learn/${post.slug || post.id}`,
      });
    }
  }, [post, open]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!post) return null;
  
  const Icon = categoryIcons[post.category] || BookOpen;
  const colorClass = categoryColors[post.category] || 'bg-primary/20 text-primary border-primary/30';
  const shareUrl = `${baseUrl}/learn/${post.slug || post.id}`;
  
  // Parse markdown-like content for better rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg sm:text-xl font-bold mt-5 sm:mt-6 mb-2 sm:mb-3 text-foreground">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base sm:text-lg font-semibold mt-3 sm:mt-4 mb-1.5 sm:mb-2 text-foreground">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 text-muted-foreground mb-1 text-sm sm:text-base">
            {line.replace(/^[-*]\s/, '')}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={idx} className="ml-4 text-muted-foreground mb-1 list-decimal text-sm sm:text-base">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={idx} />;
      }
      // Handle internal links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      if (linkRegex.test(line)) {
        const parts = line.split(linkRegex);
        return (
          <p key={idx} className="text-muted-foreground mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base">
            {parts.map((part, i) => {
              if (i % 3 === 1) {
                const url = parts[i + 1];
                return (
                  <Link key={i} to={url} className="text-primary hover:underline">
                    {part}
                  </Link>
                );
              }
              if (i % 3 === 2) return null;
              return part;
            })}
          </p>
        );
      }
      return <p key={idx} className="text-muted-foreground mb-2 sm:mb-3 leading-relaxed text-sm sm:text-base">{line}</p>;
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-50 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8 sm:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header Image */}
        <div className="relative h-40 sm:h-56 overflow-hidden shrink-0">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
            <Badge className={cn("border mb-1.5 sm:mb-2 text-[10px] sm:text-xs", colorClass)}>
              <Icon className="w-3 h-3 mr-1" />
              {post.category}
            </Badge>
            <h2 className="text-lg sm:text-2xl font-bold leading-tight line-clamp-2">{post.title}</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-[10px] sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 sm:w-4 h-3 sm:h-4" />
                {post.wordCount || 'N/A'} words
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 sm:w-4 h-3 sm:h-4" />
                {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 -webkit-overflow-scrolling-touch">
          <article className="py-3 sm:py-4 max-w-none">
            {renderContent(post.content)}
            
            {post.takeaways && post.takeaways.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4 sm:p-5 mt-4 sm:mt-6">
                <h4 className="font-semibold flex items-center gap-2 mb-3 sm:mb-4 text-foreground text-sm sm:text-base">
                  <Lightbulb className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  Key Takeaways
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {post.takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                      <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQ Section with Schema */}
            {post.faqs && post.faqs.length > 0 && (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-5 mt-4 sm:mt-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-3 sm:mb-4 text-foreground text-sm sm:text-base">
                    <HelpCircle className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                    Frequently Asked Questions
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    {post.faqs.map((faq, index) => (
                      <div key={index} className="border-b border-border/30 pb-3 last:border-0 last:pb-0">
                        <h5 className="font-medium text-sm sm:text-base text-foreground mb-1.5">{faq.question}</h5>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* FAQ Schema */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      "mainEntity": post.faqs.map(faq => ({
                        "@type": "Question",
                        "name": faq.question,
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": faq.answer
                        }
                      }))
                    })
                  }}
                />
              </>
            )}

            {/* SEO Keywords Display */}
            {post.primaryKeyword && (
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    {post.primaryKeyword}
                  </Badge>
                  {post.secondaryKeywords?.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] sm:text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share Section */}
            <div className="bg-muted/20 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6 mb-4">
              <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">Share this article</h4>
              <SocialShare 
                title={post.title}
                description={post.metaDescription}
                url={shareUrl}
                imageUrl={post.imageUrl}
                variant="buttons"
              />
            </div>
          </article>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-t shrink-0 bg-background">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs sm:text-sm h-8 sm:h-9">
            <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 sm:mr-2" />
            Back
          </Button>
          <SocialShare 
            title={post.title}
            description={post.metaDescription}
            url={shareUrl}
            imageUrl={post.imageUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BlogSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <Skeleton className="h-32 sm:h-36 w-full" />
          <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <Skeleton className="h-4 sm:h-5 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-full" />
            <Skeleton className="h-3 sm:h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Learn() {
  const { data, isLoading, refetch, isFetching } = useAIBlog();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');

  // Get unique categories from posts
  const categories = useMemo(() => {
    if (!data?.posts) return ['All'];
    const uniqueCats = [...new Set(data.posts.map(p => p.category))];
    return ['All', ...uniqueCats.sort()];
  }, [data?.posts]);

  // Get unique dates from posts
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
  
  // Filter posts by category, search, and date
  const filteredPosts = useMemo(() => {
    let posts = data?.posts || [];
    
    // Date filter
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
        p.content.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.primaryKeyword?.toLowerCase().includes(query)
      );
    }
    
    return posts;
  }, [data?.posts, activeCategory, searchQuery, selectedDate]);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
  }, []);

  // Handle date change
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  // Featured post is the first one when showing all
  const featuredPost = activeCategory === 'All' && !searchQuery && selectedDate === 'all' && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  return (
    <Layout>
      <SEO 
        title="Crypto Insights - Daily AI-Powered Analysis | Oracle Bull"
        description="Get 20 fresh AI-generated cryptocurrency articles daily. Expert analysis on market structure, DeFi, Bitcoin, Ethereum, altcoins, trading strategies, and more."
      />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <section className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold glow-text flex items-center gap-2">
              <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
              Crypto Insights
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              AI-powered crypto intelligence • <span className="text-primary font-medium">{data?.totalArticles || 20} new articles</span> today
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[140px] sm:flex-none">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 w-full sm:w-48 md:w-64 h-8 sm:h-9 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Date Filter Dropdown */}
            <Select value={selectedDate} onValueChange={handleDateChange}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 bg-card/50 border-primary/20 text-xs sm:text-sm">
                <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 text-primary" />
                <SelectValue placeholder="Filter date" />
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5 sm:gap-2 shrink-0 h-8 sm:h-9 px-2 sm:px-3"
            >
              <RefreshCw className={cn("w-3.5 sm:w-4 h-3.5 sm:h-4", isFetching && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </section>

        {/* Stats Bar - Mobile optimized */}
        {data && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <Card className="glass-card p-2 sm:p-3 border-primary/30">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Today's Articles</div>
              <div className="text-base sm:text-xl font-bold text-primary">{data.totalArticles}</div>
            </Card>
            <Card className="glass-card p-2 sm:p-3">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Categories</div>
              <div className="text-base sm:text-xl font-bold">{categories.length - 1}</div>
            </Card>
            <Card className="glass-card p-2 sm:p-3">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Avg. Read</div>
              <div className="text-base sm:text-xl font-bold">5 min</div>
            </Card>
            <Card className="glass-card p-2 sm:p-3">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Fresh Daily</div>
              <div className="text-base sm:text-xl font-bold text-green-400">20+</div>
            </Card>
          </div>
        )}

        {/* Category Navigation - Touch optimized horizontal scroll */}
        <div 
          className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-hide touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((category) => {
            const Icon = categoryIcons[category] || BookOpen;
            const isActive = activeCategory === category;
            const count = category === 'All' 
              ? data?.posts?.length || 0 
              : data?.posts?.filter(p => p.category === category).length || 0;
            
            return (
              <Button
                key={category}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  "gap-1 sm:gap-2 shrink-0 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm touch-manipulation active:scale-95 transition-transform",
                  !isActive && "bg-muted/30"
                )}
              >
                {category !== 'All' && <Icon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
                <span className="max-w-[80px] sm:max-w-none truncate">
                  {category === 'All' ? 'All' : category.split(' ')[0]}
                </span>
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs min-w-[18px] justify-center">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Featured Post - Mobile optimized */}
        {!isLoading && featuredPost && (
          <Link 
            to={`/insights/${featuredPost.slug || featuredPost.id}`}
            className="glass-card overflow-hidden cursor-pointer group active:scale-[0.99] transition-transform touch-manipulation block rounded-xl border border-border/50"
          >
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-0">
              <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
                <img 
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
                
                {/* Mobile: Overlay content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                      Featured
                    </Badge>
                    <Badge className={cn("border text-[10px]", categoryColors[featuredPost.category])}>
                      {featuredPost.category.split(' ')[0]}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold leading-tight line-clamp-2">
                    {featuredPost.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featuredPost.readTime}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      Read More <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Desktop: Side content */}
              <CardContent className="hidden sm:flex p-4 sm:p-6 flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Featured
                  </Badge>
                  <Badge className={cn("border", categoryColors[featuredPost.category])}>
                    {featuredPost.category}
                  </Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mt-3 line-clamp-3 text-sm">
                  {featuredPost.metaDescription || featuredPost.content.substring(0, 200)}...
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {featuredPost.wordCount} words
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    Read Full Article <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </div>
          </Link>
        )}

        {/* Posts Grid - Responsive */}
        {isLoading ? (
          <BlogSkeleton />
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridPosts.map((post) => (
              <BlogPostCard 
                key={post.id} 
                post={post} 
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-8 sm:p-12 text-center">
              <BookOpen className="w-10 sm:w-12 h-10 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold">No articles found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {searchQuery 
                  ? `No results for "${searchQuery}".`
                  : 'Try selecting a different category or refresh.'}
              </p>
              {(searchQuery || activeCategory !== 'All') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        {!isLoading && filteredPosts.length > 0 && (
          <p className="text-center text-[10px] sm:text-sm text-muted-foreground pb-4">
            Showing {filteredPosts.length} of {data?.totalArticles || 0} articles
            {activeCategory !== 'All' && ` in ${activeCategory}`}
          </p>
        )}

        {/* Post Modal */}
        <BlogPostModal 
          post={selectedPost}
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      </main>

      {/* Educational Fundamentals Section */}
      <div className="container mx-auto px-4 mt-8">
        <section className="mb-8">
          <h2 className="font-display text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Crypto Fundamentals Library
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Master cryptocurrency investing with our comprehensive educational guides.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {EDUCATIONAL_ARTICLES.slice(0, 8).map((article) => (
              <Link
                key={article.id}
                to={`/learn/${article.slug}`}
                className="group"
              >
                <Card className="h-full border-border/50 hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <Badge variant="outline" className="text-[10px] mb-2">
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {article.metaDescription}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {article.readTime}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        
        {/* SEO Content Section */}
        <LearnSEOContent />
      </div>

      {/* Add styles for hiding scrollbar while maintaining scroll functionality */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Layout>
  );
}
