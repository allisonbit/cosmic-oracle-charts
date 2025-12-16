import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { useAIBlog, BlogPost } from "@/hooks/useAIBlog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SocialShare, useShareMeta } from "@/components/ui/social-share";
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
  Search
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

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

function BlogPostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const Icon = categoryIcons[post.category] || BookOpen;
  const colorClass = categoryColors[post.category] || 'bg-primary/20 text-primary border-primary/30';
  
  return (
    <Card 
      className="glass-card hover:border-primary/40 transition-all cursor-pointer group overflow-hidden h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-36 overflow-hidden shrink-0">
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
        <Badge className={cn("absolute top-3 left-3 border text-xs", colorClass)}>
          <Icon className="w-3 h-3 mr-1" />
          {post.category}
        </Badge>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
          {post.metaDescription || post.content.substring(0, 120)}...
        </p>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {post.readTime}
            {post.wordCount && (
              <span className="text-muted-foreground/60">• {post.wordCount} words</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
            Read <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BlogPostModal({ post, open, onClose }: { post: BlogPost | null; open: boolean; onClose: () => void }) {
  const baseUrl = 'https://oraclebull.com';
  
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

  if (!post) return null;
  
  const Icon = categoryIcons[post.category] || BookOpen;
  const colorClass = categoryColors[post.category] || 'bg-primary/20 text-primary border-primary/30';
  const shareUrl = `${baseUrl}/learn/${post.slug || post.id}`;
  
  // Parse markdown-like content for better rendering
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 text-muted-foreground mb-1">
            {line.replace(/^[-*]\s/, '')}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={idx} className="ml-4 text-muted-foreground mb-1 list-decimal">
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
          <p key={idx} className="text-muted-foreground mb-3 leading-relaxed">
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
      return <p key={idx} className="text-muted-foreground mb-3 leading-relaxed">{line}</p>;
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="relative h-56 overflow-hidden shrink-0">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <Badge className={cn("border mb-2", colorClass)}>
              <Icon className="w-3 h-3 mr-1" />
              {post.category}
            </Badge>
            <h2 className="text-2xl font-bold leading-tight">{post.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {post.wordCount || 'N/A'} words
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-6">
          <article className="py-4 prose prose-invert max-w-none">
            {renderContent(post.content)}
            
            {post.takeaways && post.takeaways.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-5 mt-6">
                <h4 className="font-semibold flex items-center gap-2 mb-4 text-foreground">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Key Takeaways
                </h4>
                <ul className="space-y-3">
                  {post.takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SEO Keywords Display */}
            {post.primaryKeyword && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.primaryKeyword}
                  </Badge>
                  {post.secondaryKeywords?.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share Section */}
            <div className="bg-muted/20 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-medium mb-3">Share this article</h4>
              <SocialShare 
                title={post.title}
                description={post.metaDescription}
                url={shareUrl}
                imageUrl={post.imageUrl}
                variant="buttons"
              />
            </div>
          </article>
        </ScrollArea>
        
        <div className="flex items-center justify-between p-4 border-t shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <Skeleton className="h-36 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Learn() {
  const { data, isLoading, refetch, isFetching } = useAIBlog();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique categories from posts
  const categories = useMemo(() => {
    if (!data?.posts) return ['All'];
    const uniqueCats = [...new Set(data.posts.map(p => p.category))];
    return ['All', ...uniqueCats.sort()];
  }, [data?.posts]);
  
  // Filter posts by category and search
  const filteredPosts = useMemo(() => {
    let posts = data?.posts || [];
    
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
  }, [data?.posts, activeCategory, searchQuery]);

  // Featured post is the first one when showing all
  const featuredPost = activeCategory === 'All' && !searchQuery ? filteredPosts[0] : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  return (
    <Layout>
      <SEO 
        title="Crypto Insights - Daily AI-Powered Analysis | Oracle Bull"
        description="Get 20 fresh AI-generated cryptocurrency articles daily. Expert analysis on market structure, DeFi, Bitcoin, Ethereum, altcoins, trading strategies, and more."
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold glow-text flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Crypto Insights
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered crypto intelligence • <span className="text-primary font-medium">{data?.totalArticles || 20} articles</span> updated daily
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 md:w-64 h-9"
              />
            </div>
            
            {data?.date && (
              <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" />
                {format(new Date(data.date), 'MMM dd, yyyy')}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2 shrink-0"
            >
              <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </section>

        {/* Stats Bar */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glass-card p-3">
              <div className="text-xs text-muted-foreground">Total Articles</div>
              <div className="text-xl font-bold text-primary">{data.totalArticles}</div>
            </Card>
            <Card className="glass-card p-3">
              <div className="text-xs text-muted-foreground">Categories</div>
              <div className="text-xl font-bold">{categories.length - 1}</div>
            </Card>
            <Card className="glass-card p-3">
              <div className="text-xs text-muted-foreground">Avg. Read Time</div>
              <div className="text-xl font-bold">5 min</div>
            </Card>
            <Card className="glass-card p-3">
              <div className="text-xs text-muted-foreground">Updated</div>
              <div className="text-xl font-bold">Daily</div>
            </Card>
          </div>
        )}

        {/* Category Navigation */}
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-2">
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
                  onClick={() => setActiveCategory(category)}
                  className={cn("gap-2 shrink-0", !isActive && "bg-muted/30")}
                >
                  {category !== 'All' && <Icon className="w-3.5 h-3.5" />}
                  {category}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Featured Post */}
        {!isLoading && featuredPost && (
          <Card 
            className="glass-card overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPost(featuredPost)}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img 
                  src={featuredPost.imageUrl}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent md:hidden" />
              </div>
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Featured
                  </Badge>
                  <Badge className={cn("border", categoryColors[featuredPost.category])}>
                    {featuredPost.category}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mt-3 line-clamp-3">
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
          </Card>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <BlogSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridPosts.map((post) => (
              <BlogPostCard 
                key={post.id} 
                post={post} 
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No articles found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : 'Try selecting a different category or refresh for new content.'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        {!isLoading && filteredPosts.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {data?.totalArticles || 0} articles
            {activeCategory !== 'All' && ` in ${activeCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}

        {/* Post Modal */}
        <BlogPostModal 
          post={selectedPost}
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      </main>
    </Layout>
  );
}
