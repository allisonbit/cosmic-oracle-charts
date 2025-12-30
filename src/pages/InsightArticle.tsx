import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useInsights } from "@/hooks/useInsights";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  Clock, 
  Calendar,
  Share2,
  BookOpen,
  TrendingUp,
  BarChart3,
  Activity,
  Wallet,
  HelpCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { InArticleAd, SidebarAd } from "@/components/ads";

// Internal links configuration
const internalLinks = [
  { keyword: "ethereum", path: "/chain/ethereum", label: "Ethereum Dashboard" },
  { keyword: "base", path: "/chain/base", label: "Base Dashboard" },
  { keyword: "solana", path: "/chain/solana", label: "Solana Dashboard" },
  { keyword: "bitcoin", path: "/dashboard", label: "Market Dashboard" },
  { keyword: "strength", path: "/strength", label: "Crypto Strength Meter" },
  { keyword: "sentiment", path: "/sentiment", label: "Market Sentiment" },
  { keyword: "factory", path: "/factory", label: "Crypto Factory" },
  { keyword: "explorer", path: "/explorer", label: "Token Explorer" },
  { keyword: "wallet", path: "/portfolio", label: "Wallet Scanner" },
];

export default function InsightArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useInsights();

  const article = useMemo(() => {
    return data?.posts?.find(post => post.slug === slug);
  }, [data?.posts, slug]);

  const relatedArticles = useMemo(() => {
    if (!article || !data?.posts) return [];
    return data.posts
      .filter(post => post.id !== article.id && post.category === article.category)
      .slice(0, 3);
  }, [article, data?.posts]);

  // Process content to add internal links
  const processedContent = useMemo(() => {
    if (!article?.content) return "";
    
    let content = article.content;
    
    // Convert markdown to HTML
    content = content
      .replace(/### (.*?)$/gm, '<h3 class="text-lg font-display font-semibold mt-6 mb-3 text-foreground">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-xl font-display font-bold mt-8 mb-4 text-foreground">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 mb-2"><span class="font-semibold text-primary">$1.</span> $2</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');

    return `<p class="mb-4 text-muted-foreground leading-relaxed">${content}</p>`;
  }, [article?.content]);

  // JSON-LD Article structured data
  const structuredData = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "author": {
      "@type": "Organization",
      "name": "Oracle Bull"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Oracle Bull",
      "url": "https://oraclebull.com"
    },
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://oraclebull.com/insights/${article.slug}`
    },
    "keywords": [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
    "wordCount": article.wordCount,
    "articleSection": article.category
  } : null;

  // FAQ structured data
  const faqStructuredData = article?.faqs?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://oraclebull.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Insights",
        "item": "https://oraclebull.com/insights"
      },
      ...(article ? [{
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://oraclebull.com/insights/${article.slug}`
      }] : [])
    ]
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-2/3 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Button onClick={() => navigate("/insights")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Insights
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const shareUrl = `https://oraclebull.com/insights/${article.slug}`;

  return (
    <Layout>
      <Helmet>
        <title>{article.metaTitle || article.title} | Oracle Bull</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={[article.primaryKeyword, ...article.secondaryKeywords].join(", ")} />
        <link rel="canonical" href={shareUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:section" content={article.category} />
        <meta property="article:tag" content={article.primaryKeyword} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.metaDescription} />
        
        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        )}
        {faqStructuredData && (
          <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
        )}
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      <article className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/insights" className="hover:text-primary transition-colors">Insights</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/insights")}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Insights
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            <Badge variant="outline" className="mb-4">
              {article.category}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              {article.metaDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border/50 py-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {article.wordCount} words
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      url: shareUrl
                    });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <div 
            className="prose prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
          
          {/* In-article ad after content */}
          <InArticleAd className="my-8" />

          {/* Key Takeaways */}
          {article.takeaways?.length > 0 && (
            <Card className="mb-8 border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Key Takeaways
                </h2>
                <ul className="space-y-2">
                  {article.takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary font-bold">{index + 1}.</span>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* FAQs */}
          {article.faqs && article.faqs.length > 0 && (
            <Card className="mb-8 border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {article.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Internal Links CTA */}
          <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-6">
              <h2 className="text-lg font-display font-bold mb-4">
                Explore Oracle Bull Analytics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors text-sm">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Dashboard
                </Link>
                <Link to="/strength" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors text-sm">
                  <Activity className="h-4 w-4 text-primary" />
                  Strength Meter
                </Link>
                <Link to="/factory" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Crypto Factory
                </Link>
                <Link to="/portfolio" className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors text-sm">
                  <Wallet className="h-4 w-4 text-primary" />
                  Wallet Scanner
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center border-t border-border/50 pt-6 mb-8">
            This content is for informational purposes only and should not be considered financial advice. 
            Cryptocurrency investments carry significant risk. Always conduct your own research.
          </p>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-bold mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((post) => (
                  <Link key={post.id} to={`/insights/${post.slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-all">
                      <CardContent className="p-4">
                        <Badge variant="outline" className="text-xs mb-2">
                          {post.category}
                        </Badge>
                        <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </Layout>
  );
}
