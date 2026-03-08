import { useMemo, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useInsights } from "@/hooks/useInsights";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, Clock, Calendar, Share2, BookOpen, TrendingUp,
  BarChart3, Activity, Wallet, HelpCircle, ArrowRight, Check, Copy,
  ChevronUp
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { InArticleAd } from "@/components/ads";

export default function InsightArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useInsights();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
      setShowBackToTop(scrollTop > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const article = useMemo(() => {
    return data?.posts?.find(post => post.slug === slug);
  }, [data?.posts, slug]);

  const relatedArticles = useMemo(() => {
    if (!article || !data?.posts) return [];
    return data.posts
      .filter(post => post.id !== article.id && post.category === article.category)
      .slice(0, 4);
  }, [article, data?.posts]);

  const processedContent = useMemo(() => {
    if (!article?.content) return "";
    let content = article.content;
    content = content
      .replace(/### (.*?)$/gm, '<h3 class="text-lg font-display font-semibold mt-8 mb-3 text-foreground">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-xl font-display font-bold mt-10 mb-4 text-foreground">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4 mb-2 list-disc">$1</li>')
      .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 mb-2"><span class="font-semibold text-primary">$1.</span> $2</li>')
      .replace(/\n\n/g, '</p><p class="mb-5 text-muted-foreground leading-relaxed text-[15px]">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>');
    return `<p class="mb-5 text-muted-foreground leading-relaxed text-[15px]">${content}</p>`;
  }, [article?.content]);

  const structuredData = article ? {
    "@context": "https://schema.org", "@type": "Article",
    "headline": article.title, "description": article.metaDescription,
    "author": { "@type": "Organization", "name": "Oracle Bull" },
    "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" },
    "datePublished": article.publishedAt, "dateModified": article.publishedAt,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://oraclebull.com/insights/${article.slug}` },
    "keywords": [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
    "wordCount": article.wordCount, "articleSection": article.category
  } : null;

  const faqStructuredData = article?.faqs?.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": article.faqs.map(faq => ({
      "@type": "Question", "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  } : null;

  const breadcrumbData = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oraclebull.com" },
      { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://oraclebull.com/insights" },
      ...(article ? [{ "@type": "ListItem", "position": 3, "name": article.title, "item": `https://oraclebull.com/insights/${article.slug}` }] : [])
    ]
  };

  const handleShare = async () => {
    const url = `https://oraclebull.com/insights/${article?.slug}`;
    if (navigator.share) {
      await navigator.share({ title: article?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Skeleton className="h-4 w-48 mb-8" />
            <Skeleton className="h-5 w-20 mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-3/4 mb-6" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-2/3 mb-8" />
            <div className="flex gap-4 mb-10 border-y border-border/30 py-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
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
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Article Not Found</h1>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              This article may have been moved or is no longer available.
            </p>
            <Button onClick={() => navigate("/insights")} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" /> Browse All Insights
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
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:section" content={article.category} />
        <meta property="article:tag" content={article.primaryKeyword} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.metaDescription} />
        {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
        {faqStructuredData && <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>}
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-muted/20">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-muted-foreground/40">/</span>
            <Link to="/insights" className="hover:text-primary transition-colors">Insights</Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground/70 truncate max-w-[250px]">{article.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                {article.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-4 leading-tight tracking-tight">
              {article.title}
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
              {article.metaDescription}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-y border-border/40 py-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {article.readTime}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                {article.wordCount} words
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto gap-1.5 h-8 text-xs"
                onClick={handleShare}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Share"}
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none mb-10 [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
          
          <InArticleAd className="my-8" />

          {/* Key Takeaways */}
          {article.takeaways?.length > 0 && (
            <Card className="mb-8 border-primary/20 bg-primary/3">
              <CardContent className="p-5 sm:p-6">
                <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Key Takeaways
                </h2>
                <ul className="space-y-3">
                  {article.takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* FAQs */}
          {article.faqs && article.faqs.length > 0 && (
            <Card className="mb-8 border-border/40">
              <CardContent className="p-5 sm:p-6">
                <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {article.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border-border/30">
                      <AccordionTrigger className="text-left font-medium text-sm hover:text-primary transition-colors py-3">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Explore Tools CTA */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-5 sm:p-6">
              <h2 className="text-base font-display font-bold mb-4">Explore More Tools</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
                  { to: "/strength", icon: Activity, label: "Strength Meter" },
                  { to: "/factory", icon: TrendingUp, label: "Crypto Factory" },
                  { to: "/scanner", icon: Wallet, label: "Token Scanner" },
                ].map(item => (
                  <Link key={item.to} to={item.to} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/60 hover:bg-primary/10 transition-colors text-sm group">
                    <item.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{item.label}</span>
                    <ArrowRight className="h-3 w-3 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-[11px] text-muted-foreground/70 text-center border-t border-border/30 pt-6 mb-10 leading-relaxed max-w-lg mx-auto">
            This content is for informational purposes only and should not be considered financial advice. 
            Cryptocurrency investments carry significant risk. Always conduct your own research.
          </p>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedArticles.map((post) => (
                  <Link key={post.id} to={`/insights/${post.slug}`} className="group">
                    <Card className="h-full border-border/40 hover:border-primary/30 transition-all duration-200">
                      <CardContent className="p-4 flex gap-3">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-[10px] mb-2">{post.category}</Badge>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" /> {post.readTime}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </Layout>
  );
}
