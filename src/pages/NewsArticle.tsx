import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  Clock, ExternalLink, Brain, ArrowRight, TrendingUp, Activity,
  ChevronLeft, Share2, Check, Loader2, Tag,
  Newspaper, HelpCircle, Twitter, Link as LinkIcon,
} from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";
import { useNewsArticle, timeAgo, sentimentStyle, type NewsArticleData } from "@/hooks/useNews";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// Wide, impactful article body rendering
function renderMarkdown(md: string): string {
  let html = (md || "")
    .replace(/#### (.*?)$/gm,
      '<h4 class="text-xl font-display font-bold mt-8 mb-3 text-foreground tracking-tight">$1</h4>')
    .replace(/### (.*?)$/gm,
      '<h3 class="text-2xl md:text-3xl font-display font-bold mt-12 mb-4 text-foreground tracking-tight">$1</h3>')
    .replace(/## (.*?)$/gm,
      '<h2 class="text-3xl md:text-4xl font-display font-bold mt-14 mb-5 text-foreground tracking-tight border-t border-border/30 pt-10">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/^> (.*?)$/gm,
      '<blockquote class="border-l-4 border-primary pl-6 my-8 text-xl md:text-2xl text-foreground font-light leading-relaxed italic">$1</blockquote>')
    .replace(/^- (.*?)$/gm,
      '<li class="ml-6 mb-4 list-disc text-lg md:text-xl leading-relaxed text-muted-foreground">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 font-medium hover:text-primary/80">$1</a>')
    .replace(/\n\n/g,
      '</p><p class="mb-7 text-muted-foreground leading-[1.85] text-lg md:text-xl">');
  html = `<p class="mb-7 text-muted-foreground leading-[1.85] text-lg md:text-xl">${html}</p>`;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "h2", "h3", "h4", "strong", "em", "li", "ul", "ol", "a", "br", "span", "blockquote"],
    ALLOWED_ATTR: ["href", "class", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

// Related article — horizontal card for bottom rail
function RelatedHorizontal({ a }: { a: NewsArticleData }) {
  const s = sentimentStyle(a.sentiment);
  return (
    <Link to={`/news/${a.slug}`} className="group flex flex-col gap-3 shrink-0 w-64 md:w-72">
      <div className="aspect-video overflow-hidden bg-muted">
        {a.imageUrl && (
          <img src={a.imageUrl} alt={a.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-px border uppercase tracking-wider ${s.className}`}>{s.label}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />{timeAgo(a.publishedAt)}
          </span>
        </div>
        <h3 className="font-bold font-display text-sm md:text-base leading-snug line-clamp-3 group-hover:text-primary transition-colors tracking-tight">
          {a.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{a.sourceName}</p>
      </div>
    </Link>
  );
}

// Sidebar related article row
function RelatedRow({ a }: { a: NewsArticleData }) {
  const s = sentimentStyle(a.sentiment);
  return (
    <Link to={`/news/${a.slug}`} className="editorial-row items-start gap-3 group py-4">
      {a.imageUrl && (
        <div className="w-16 h-12 overflow-hidden shrink-0 bg-muted">
          <img src={a.imageUrl} alt={a.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[9px] font-bold px-1.5 py-px border ${s.className}`}>{s.label}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-bold leading-snug line-clamp-3 group-hover:text-primary transition-colors">{a.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{a.sourceName}</p>
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
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(h > 0 ? (scrollTop / h) * 100 : 0);
      setStickyVisible(scrollTop > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contentHtml = useMemo(() => (article?.content ? renderMarkdown(article.content) : ""), [article?.content]);

  const articleUrl = `${SITE_URL}/news/${article?.slug}`;

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(articleUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  const handleShare = async () => {
    if (navigator.share) { await navigator.share({ title: article?.title, url: articleUrl }); }
    else { handleCopyLink(); }
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
          <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
            This story may have expired from the feed. Browse the latest crypto news instead.
          </p>
          <button onClick={() => navigate("/news")}
            className="bg-primary text-primary-foreground px-6 py-3 font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2">
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
      <div className="fixed top-0 left-0 h-0.5 bg-primary z-[100] transition-all duration-100" style={{ width: `${progress}%` }} />

      {/* Sticky share bar — appears after scrolling past header */}
      {stickyVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 h-12 flex items-center gap-4 max-w-5xl">
            {/* Progress fills the bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
            <Link to="/news" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 shrink-0">
              <ChevronLeft className="w-3.5 h-3.5" /> News
            </Link>
            <h2 className="flex-1 text-sm font-bold line-clamp-1 text-foreground min-w-0">{article.title}</h2>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(canonical)}`}
                target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on X">
                <Twitter className="w-4 h-4" />
              </a>
              <button onClick={handleCopyLink} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Copy link">
                {copied ? <Check className="w-4 h-4 text-success" /> : <LinkIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-8 flex flex-wrap items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-primary transition-colors">News</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1 flex-1 min-w-0">{article.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_280px] gap-14">

            {/* Article */}
            <article>

              {/* Category strip */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="section-label text-primary">{article.category}</span>
                <span className={`text-xs font-bold px-3 py-1 border uppercase tracking-wider ${s.className}`}>
                  AI: {s.label}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5 ml-auto">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime}
                </span>
              </div>

              {/* Headline — very large */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-[1.08] mb-6 tracking-tight">
                {article.title}
              </h1>

              {/* Lead / teaser */}
              {article.metaDescription && (
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 font-light border-l-4 border-primary pl-5">
                  {article.metaDescription}
                </p>
              )}

              {/* Data strip: sentiment + coins + source */}
              <div className="flex flex-wrap items-stretch gap-0 border-y border-border my-8">
                <div className="py-4 pr-6 border-r border-border">
                  <div className="section-label mb-1">AI Sentiment</div>
                  <span className={`text-base font-bold ${s.className.split(" ").find(c => c.startsWith("text-"))}`}>
                    {s.label}
                  </span>
                </div>
                <div className="py-4 px-6 border-r border-border">
                  <div className="section-label mb-1">Source</div>
                  <span className="text-base font-bold">{article.sourceName}</span>
                </div>
                <div className="py-4 px-6 border-r border-border">
                  <div className="section-label mb-1">Published</div>
                  <span className="text-sm font-medium text-muted-foreground">{formatDate(article.publishedAt)}</span>
                </div>
                {article.coins.length > 0 && (
                  <div className="py-4 px-6">
                    <div className="section-label mb-1">Coins</div>
                    <div className="flex flex-wrap gap-1.5">
                      {article.coins.slice(0, 4).map(c => (
                        <Link key={c.id} to={`/price-prediction/${c.id}`}
                          className="text-xs font-bold text-primary hover:underline">${c.symbol}</Link>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleShare}
                  className="py-4 px-5 ml-auto text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-sm font-medium border-l border-border"
                  aria-label="Share">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
                  Share
                </button>
              </div>

              {/* Hero image — full width, no borders */}
              {article.imageUrl && (
                <div className="overflow-hidden mb-10 aspect-video bg-muted">
                  <img src={article.imageUrl} alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                </div>
              )}

              {/* Article body */}
              <div className="prose prose-neutral dark:prose-invert max-w-none mb-10"
                dangerouslySetInnerHTML={{ __html: contentHtml }} />

              {/* Source attribution */}
              <div className="border-l-4 border-primary/40 pl-5 py-3 mb-8 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  AI-summarised brief based on reporting by{" "}
                  <a href={article.externalUrl} target="_blank" rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline">{article.sourceName}</a>.
                  Read the full report at the source.
                </p>
              </div>

              {/* Read full source CTA */}
              <div className="mb-12 flex flex-wrap gap-3">
                <a href={article.externalUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-bold hover:bg-foreground/90 transition-all">
                  Read full story on {article.sourceName} <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={handleShare}
                  className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium hover:border-primary/50 hover:text-primary transition-all">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
                  Share
                </button>
              </div>


              {/* Key Takeaways */}
              {article.takeaways.length > 0 && (
                <div className="mb-12 border-t-2 border-foreground pt-8">
                  <h2 className="font-bold font-display text-2xl md:text-3xl mb-6 flex items-center gap-3">
                    <Brain className="w-6 h-6 text-primary" /> Key Takeaways
                  </h2>
                  <ul className="space-y-5">
                    {article.takeaways.map((t, i) => (
                      <li key={i} className="flex gap-4 text-lg md:text-xl text-muted-foreground leading-relaxed border-b border-border/30 pb-5 last:border-0 last:pb-0">
                        <span className="font-mono text-primary font-bold shrink-0 mt-0.5 text-sm">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-3">
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
                  <h2 className="font-bold font-display text-2xl md:text-3xl mb-6 flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {article.faqs.map((f, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-border/40">
                        <AccordionTrigger className="text-left font-bold text-base md:text-lg hover:text-primary transition-colors py-4">
                          {f.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base md:text-lg leading-loose pb-5">
                          {f.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Horizontal related articles at bottom */}
              {related.length > 0 && (
                <div className="border-t-2 border-foreground pt-8 mb-8">
                  <h2 className="font-bold font-display text-2xl mb-6">Read Next</h2>
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x">
                    {related.map(r => <RelatedHorizontal key={r.id} a={r} />)}
                  </div>
                  <Link to="/news"
                    className="mt-6 inline-flex items-center gap-2 text-primary font-bold hover:underline text-sm">
                    All crypto news <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground/60 border-t border-border/30 pt-5 leading-relaxed">
                Aggregated for informational purposes with attribution and a link to the original source. AI sentiment is a
                research signal, not financial advice. Always do your own research before making investment decisions.
              </p>
            </article>

            {/* Sidebar */}
            <aside className="space-y-0">

              {/* Coins mentioned */}
              {article.coins.length > 0 && (
                <div className="mb-8">
                  <div className="section-header">
                    <h2 className="font-bold font-display text-base flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" /> Coins Mentioned
                    </h2>
                  </div>
                  <div>
                    {article.coins.map((c) => (
                      <Link key={c.id} to={`/price-prediction/${c.id}`}
                        className="editorial-row items-center justify-between group">
                        <div>
                          <span className="font-bold text-sm">{c.name}</span>
                          <span className="text-muted-foreground text-xs ml-1.5">{c.symbol}</span>
                        </div>
                        <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          AI Predict <TrendingUp className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sidebar related */}
              {related.length > 0 && (
                <div className="sticky top-24">
                  <div className="section-header">
                    <h2 className="font-bold font-display text-base">More Stories</h2>
                  </div>
                  <div>
                    {related.slice(0, 4).map((r) => <RelatedRow key={r.id} a={r} />)}
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
