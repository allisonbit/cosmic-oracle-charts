import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  Clock, ExternalLink, Brain, ArrowRight, TrendingUp, Activity,
  ChevronLeft, Share2, Bookmark, Check, Loader2, Tag,
  Newspaper, HelpCircle,
} from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";
import { useNewsArticle, timeAgo, sentimentStyle, type NewsArticleData } from "@/hooks/useNews";
import { InArticleAd, SidebarAd } from "@/components/ads";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// Larger, more readable markdown rendering
function renderMarkdown(md: string): string {
  let html = (md || "")
    .replace(/#### (.*?)$/gm, '<h4 class="text-xl font-display font-semibold mt-8 mb-3 text-foreground">$1</h4>')
    .replace(/### (.*?)$/gm, '<h3 class="text-2xl font-display font-semibold mt-10 mb-4 text-foreground">$1</h3>')
    .replace(/## (.*?)$/gm, '<h2 class="text-3xl font-display font-bold mt-12 mb-5 text-foreground">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/^- (.*?)$/gm, '<li class="ml-5 mb-3 list-disc text-lg leading-relaxed">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
    .replace(/\n\n/g, '</p><p class="mb-6 text-muted-foreground leading-loose text-lg">');
  html = `<p class="mb-6 text-muted-foreground leading-loose text-lg">${html}</p>`;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "h2", "h3", "h4", "strong", "em", "li", "ul", "ol", "a", "br", "span"],
    ALLOWED_ATTR: ["href", "class"],
    ALLOW_DATA_ATTR: false,
  });
}

// Related article row — editorial style
function RelatedCard({ a }: { a: NewsArticleData }) {
  const s = sentimentStyle(a.sentiment);
  return (
    <Link to={`/news/${a.slug}`} className="editorial-row items-start gap-3 group py-4">
      {a.imageUrl && (
        <div className="w-16 h-12 overflow-hidden shrink-0 bg-muted">
          <img
            src={a.imageUrl}
            alt={a.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex gap-1.5 mb-1.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${s.className}`}>{s.label}</span>
        </div>
        <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary transition-colors">{a.title}</h3>
        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />{timeAgo(a.publishedAt)}
        </div>
      </div>
    </Link>
  );
}

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useNewsArticle(slug);
  const article = data?.article ?? null;
  const related = data?.related ?? [];

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(h > 0 ? (document.documentElement.scrollTop / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contentHtml = useMemo(() => (article?.content ? renderMarkdown(article.content) : ""), [article?.content]);

  const handleShare = async () => {
    const url = `${SITE_URL}/news/${article?.slug}`;
    if (navigator.share) { await navigator.share({ title: article?.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <Helmet><title>Article not found | Oracle Bull News</title><meta name="robots" content="noindex" /></Helmet>
        <div className="container mx-auto px-4 py-32 text-center">
          <Newspaper className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 font-display">Article not found</h1>
          <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">This story may have expired from the feed. Browse the latest crypto news instead.</p>
          <button onClick={() => navigate("/news")} className="bg-primary text-primary-foreground px-6 py-3 font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to News
          </button>
        </div>
      </Layout>
    );
  }

  const s = sentimentStyle(article.sentiment);
  const canonical = `${SITE_URL}/news/${article.slug}`;
  const isoPublished = new Date(article.publishedAt).toISOString();

  const newsArticleLd = {
    "@context": "https://schema.org", "@type": "NewsArticle",
    headline: article.title,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: isoPublished, dateModified: isoPublished,
    author: { "@type": "Organization", name: article.sourceName || "Oracle Bull" },
    publisher: { "@type": "Organization", name: "Oracle Bull", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/oracle-bull-logo.jpg` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    articleSection: article.category,
    description: article.metaDescription,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
    isBasedOn: article.externalUrl || undefined,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "News", item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonical },
    ],
  };
  const faqLd = article.faqs.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: article.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  } : null;

  return (
    <Layout>
      <Helmet>
        <title>{article.metaTitle || `${article.title} | Oracle Bull News`}</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="keywords" content={[article.primaryKeyword, ...article.secondaryKeywords].join(", ")} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription} />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={isoPublished} />
        <meta property="article:section" content={article.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.metaDescription} />
        {article.imageUrl && <meta name="twitter:image" content={article.imageUrl} />}
        <script type="application/ld+json">{JSON.stringify(newsArticleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
      </Helmet>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 h-1 bg-primary z-[100] transition-all duration-150" style={{ width: `${progress}%` }} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-8 flex flex-wrap items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-primary transition-colors">News</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1 flex-1">{article.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_300px] gap-14">

            {/* Article body */}
            <article>
              {/* Category + sentiment badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`text-xs font-bold px-3 py-1 border uppercase tracking-wider ${s.className}`}>
                  AI: {s.label}
                </span>
                <span className="text-xs font-bold px-3 py-1 border border-border text-muted-foreground uppercase tracking-wider">
                  {article.category}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5 ml-auto">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime} read
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6 tracking-tight">
                {article.title}
              </h1>

              {/* Meta description teaser */}
              {article.metaDescription && (
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 font-light border-l-4 border-primary/30 pl-5">
                  {article.metaDescription}
                </p>
              )}

              {/* Source line + share */}
              <div className="flex items-center gap-4 mb-10 pb-8 border-b border-border">
                <div className="w-10 h-10 overflow-hidden border border-border shrink-0 flex items-center justify-center bg-muted">
                  {article.sourceIcon ? (
                    <img src={article.sourceIcon} alt={article.sourceName} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <Newspaper className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm">Aggregated from {article.sourceName}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(article.publishedAt)} · {timeAgo(article.publishedAt)}</div>
                </div>
                <button
                  onClick={handleShare}
                  className="p-2.5 border border-border hover:border-primary/50 hover:text-primary transition-all"
                  aria-label="Share article"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Hero image */}
              {article.imageUrl && (
                <div className="overflow-hidden mb-10 aspect-video bg-muted">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                  />
                </div>
              )}

              {/* Article content */}
              <div className="prose prose-neutral dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: contentHtml }} />

              {/* Source attribution */}
              <div className="border-l-4 border-primary/40 pl-5 py-3 mb-8 bg-muted/20">
                <p className="text-sm text-muted-foreground m-0">
                  This is an original, AI-summarised brief. The full report — including the publisher's complete
                  reporting — is on{" "}
                  <a href={article.externalUrl} target="_blank" rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline">{article.sourceName}</a>.
                </p>
              </div>

              {/* Read full source */}
              <div className="mb-12">
                <a
                  href={article.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold border-2 border-primary/30 text-primary px-6 py-3 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  Continue reading on {article.sourceName} <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <InArticleAd className="my-10" />

              {/* Key Takeaways — no card chrome */}
              {article.takeaways.length > 0 && (
                <div className="mb-12 border-t border-border/30 pt-8">
                  <h2 className="font-bold font-display text-2xl mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-primary" /> Key Takeaways
                  </h2>
                  <ul className="space-y-4">
                    {article.takeaways.map((t, i) => (
                      <li key={i} className="flex gap-4 text-base text-muted-foreground leading-relaxed">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-5 border-t border-border flex flex-wrap gap-3">
                    <Link to="/predictions"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:bg-primary/90 transition-all">
                      <TrendingUp className="w-4 h-4" /> View AI Predictions
                    </Link>
                    <Link to="/sentiment"
                      className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-medium hover:border-primary/50 transition-colors">
                      <Activity className="w-4 h-4" /> Market Sentiment
                    </Link>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {article.faqs.length > 0 && (
                <div className="mb-12 border-t border-border/30 pt-8">
                  <h2 className="font-bold font-display text-2xl mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {article.faqs.map((f, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-border/40">
                        <AccordionTrigger className="text-left font-medium text-base hover:text-primary transition-colors py-4">
                          {f.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-loose pb-5">
                          {f.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground/70 border-t border-border/40 pt-6 mb-4 leading-relaxed">
                Aggregated for informational purposes with attribution and a link to the original source. AI sentiment is a
                research signal, not financial advice. Always do your own research.
              </p>
            </article>

            {/* Sidebar */}
            <aside className="space-y-0">
              <SidebarAd className="mb-6 hidden lg:flex" />

              {/* Coins mentioned */}
              {article.coins.length > 0 && (
                <div className="mb-8">
                  <div className="section-header mb-0">
                    <h2 className="font-bold font-display text-base flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" /> Coins Mentioned
                    </h2>
                  </div>
                  <div>
                    {article.coins.map((c) => (
                      <Link
                        key={c.id}
                        to={`/price-prediction/${c.id}`}
                        className="editorial-row items-center justify-between group"
                      >
                        <span className="font-bold text-sm">
                          {c.name}{" "}
                          <span className="text-muted-foreground font-normal text-xs">{c.symbol}</span>
                        </span>
                        <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Predict <TrendingUp className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related articles */}
              {related.length > 0 && (
                <div className="sticky top-24">
                  <div className="section-header mb-0">
                    <h2 className="font-bold font-display text-base">Read Next</h2>
                  </div>
                  <div>
                    {related.map((r) => <RelatedCard key={r.id} a={r} />)}
                  </div>
                  <Link to="/news" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                    All crypto news <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
