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
  Gamepad2,
  Scale,
  Cpu,
  GraduationCap,
  Clock,
  Calendar,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const categoryIcons: Record<string, typeof BookOpen> = {
  'Market Analysis': BarChart3,
  'Trending': TrendingUp,
  'DeFi': Zap,
  'Bitcoin': BookOpen,
  'Ethereum': Brain,
  'Altcoins': TrendingUp,
  'NFTs & Gaming': Gamepad2,
  'Regulation': Scale,
  'Technology': Cpu,
  'Education': GraduationCap,
};

const categoryColors: Record<string, string> = {
  'Market Analysis': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Trending': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'DeFi': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Bitcoin': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Ethereum': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Altcoins': 'bg-green-500/20 text-green-400 border-green-500/30',
  'NFTs & Gaming': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Regulation': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Technology': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Education': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function BlogPostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const Icon = categoryIcons[post.category] || BookOpen;
  const colorClass = categoryColors[post.category] || 'bg-primary/20 text-primary border-primary/30';
  
  return (
    <Card 
      className="glass-card hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Badge className={cn("absolute top-3 left-3 border", colorClass)}>
          <Icon className="w-3 h-3 mr-1" />
          {post.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {post.content.substring(0, 150)}...
        </p>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {post.readTime} read
          </div>
          <div className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
            Read More <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BlogPostModal({ post, open, onClose }: { post: BlogPost | null; open: boolean; onClose: () => void }) {
  const baseUrl = 'https://oraclebull.com';
  
  // Update OG meta tags when post is selected
  useEffect(() => {
    if (post && open) {
      useShareMeta({
        title: `${post.title} | Oracle Crypto Insights`,
        description: post.content.substring(0, 160),
        image: post.imageUrl,
        url: `${baseUrl}/learn?post=${post.id}`,
      });
    }
  }, [post, open]);

  if (!post) return null;
  
  const Icon = categoryIcons[post.category] || BookOpen;
  const colorClass = categoryColors[post.category] || 'bg-primary/20 text-primary border-primary/30';
  const shareUrl = `${baseUrl}/learn?post=${post.id}`;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <Badge className={cn("border mb-2", colorClass)}>
              <Icon className="w-3 h-3 mr-1" />
              {post.category}
            </Badge>
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime} read
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {post.content}
            </p>
            
            {post.takeaways && post.takeaways.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {post.takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Social Share Section */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">Share this article</h4>
              <SocialShare 
                title={post.title}
                description={post.content.substring(0, 160)}
                url={shareUrl}
                imageUrl={post.imageUrl}
                variant="buttons"
              />
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>
          <SocialShare 
            title={post.title}
            description={post.content.substring(0, 160)}
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
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

  const categories = ['All', ...Object.keys(categoryIcons)];
  
  const filteredPosts = activeCategory === 'All' 
    ? data?.posts || []
    : data?.posts?.filter(p => p.category === activeCategory) || [];

  return (
    <Layout>
      <SEO 
        title="Crypto Insights - Daily AI-Powered Analysis | Oracle"
        description="Get daily AI-generated cryptocurrency insights, market analysis, and educational content. 10 fresh articles every day covering all aspects of crypto."
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold glow-text flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Crypto Insights
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered daily crypto analysis • 10 fresh articles every day
            </p>
          </div>

          <div className="flex items-center gap-3">
            {data?.date && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(data.date), 'MMMM dd, yyyy')}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </section>

        {/* Category Navigation */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || BookOpen;
              const isActive = activeCategory === category;
              return (
                <Button
                  key={category}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={cn("gap-2 shrink-0", !isActive && "bg-muted/30")}
                >
                  {category !== 'All' && <Icon className="w-4 h-4" />}
                  {category}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Featured Post */}
        {!isLoading && filteredPosts.length > 0 && activeCategory === 'All' && (
          <Card 
            className="glass-card overflow-hidden cursor-pointer group"
            onClick={() => setSelectedPost(filteredPosts[0])}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={filteredPosts[0].imageUrl}
                  alt={filteredPosts[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent md:hidden" />
              </div>
              <CardContent className="p-6 flex flex-col justify-center">
                <Badge className={cn("w-fit border mb-3", categoryColors[filteredPosts[0].category])}>
                  Featured
                </Badge>
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {filteredPosts[0].title}
                </h2>
                <p className="text-muted-foreground mt-3 line-clamp-3">
                  {filteredPosts[0].content.substring(0, 250)}...
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {filteredPosts[0].readTime} read
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.slice(activeCategory === 'All' ? 1 : 0).map((post) => (
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
                Try selecting a different category or refresh for new content.
              </p>
            </CardContent>
          </Card>
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
