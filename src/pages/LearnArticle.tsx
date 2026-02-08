import { useParams, Link } from "react-router-dom";
import { SITE_URL } from "@/lib/siteConfig";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { EDUCATIONAL_ARTICLES } from "@/lib/educationalArticles";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Share2,
  MessageCircle
} from "lucide-react";
import { InArticleAd } from "@/components/ads";

export default function LearnArticle() {
  const { slug } = useParams();
  
  const article = EDUCATIONAL_ARTICLES.find(a => a.slug === slug);
  
  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist.
          </p>
          <Link to="/learn">
            <Button>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Learn
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Get related articles (same category or different)
  const relatedArticles = EDUCATIONAL_ARTICLES
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  // FAQ Schema
  const faqSchema = {
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
  };

  // Article Schema
  const articleSchema = {
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
      "url": SITE_URL
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/learn/${article.slug}`
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{article.metaTitle}</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={[article.primaryKeyword, ...article.secondaryKeywords].join(", ")} />
        <link rel="canonical" href={`${SITE_URL}/learn/${article.slug}`} />
        <meta property="og:title" content={article.metaTitle} />
        <meta property="og:description" content={article.metaDescription} />
        <meta property="og:url" content={`${SITE_URL}/learn/${article.slug}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <div className="min-h-screen pt-20 pb-24 sm:pb-12">
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/learn" className="hover:text-primary">Learn</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{article.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {article.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              {article.metaDescription}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                Educational Guide
              </span>
            </div>
          </header>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant="default">{article.primaryKeyword}</Badge>
            {article.secondaryKeywords.map(keyword => (
              <Badge key={keyword} variant="outline">{keyword}</Badge>
            ))}
          </div>

          {/* Main Content */}
          <div 
            className="prose prose-invert prose-lg max-w-none mb-12"
            style={{
              '--tw-prose-headings': 'hsl(var(--foreground))',
              '--tw-prose-body': 'hsl(var(--muted-foreground))',
              '--tw-prose-bold': 'hsl(var(--foreground))',
              '--tw-prose-links': 'hsl(var(--primary))',
            } as React.CSSProperties}
          >
            {article.content.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-display font-bold mt-8 mb-4 text-foreground">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-display font-bold mt-6 mb-3 text-foreground">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('#### ')) {
                return <h4 key={i} className="text-base font-bold mt-4 mb-2 text-foreground">{paragraph.replace('#### ', '')}</h4>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={i} className="ml-4 text-muted-foreground">{paragraph.replace('- ', '')}</li>;
              }
              if (paragraph.trim() === '') return null;
              return <p key={i} className="mb-4 text-muted-foreground leading-relaxed">{paragraph}</p>;
            })}
          </div>

          {/* In-article Ad */}
          <InArticleAd className="my-8" />

          {/* FAQs */}
          {article.faqs.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {article.faqs.map((faq, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="font-bold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground text-sm">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Related Links */}
          {article.relatedLinks.length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-display font-bold mb-4">Explore More Tools</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {article.relatedLinks.map((link, i) => (
                  <Link 
                    key={i} 
                    to={link.url}
                    className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2"
                  >
                    <span className="text-sm font-medium">{link.text}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related Articles */}
          <section className="mb-12">
            <h2 className="text-lg font-display font-bold mb-4">Continue Learning</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/learn/${related.slug}`}
                  className="group"
                >
                  <Card className="h-full border-border/50 hover:border-primary/50 transition-all">
                    <CardContent className="p-4">
                      <Badge variant="outline" className="text-[10px] mb-2">
                        {related.category}
                      </Badge>
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        {related.readTime}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Share */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-border">
            <span className="text-sm text-muted-foreground">Share this article:</span>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </article>
      </div>
    </Layout>
  );
}
