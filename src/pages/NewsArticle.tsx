import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import {
  Clock, ExternalLink, Brain, ArrowRight, TrendingUp, Activity,
  ChevronLeft, Check, Loader2, Tag,
  Newspaper, HelpCircle, Link as LinkIcon,
  Facebook, Send, MessageCircle, Mail,
} from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";
import { useNewsArticle, timeAgo, sentimentStyle, type NewsArticleData } from "@/hooks/useNews";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function renderMarkdown(md: string): string {
  let html = (md || "")
    .replace(/#### (.*?)$/gm,
      '<h4 class="text-base md:text-lg font-display font-bold mt-6 mb-2 text-foreground tracking-tight">$1</h4>')
    .replace(/### (.*?)$/gm,
      '<h3 class="text-lg md:text-xl font-display font-bold mt-8 mb-3 text-foreground tracking-tight">$1</h3>')
    .replace(/## (.*?)$/gm,
      '<h2 class="text-xl md:text-2xl font-display font-bold mt-10 mb-4 text-foreground tracking-tight border-t border-border/30 pt-8">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/^> (.*?)$/gm,
      '<blockquote class="border-l-4 border-primary pl-4 my-6 text-base md:text-lg text-foreground font-light leading-relaxed italic">$1</blockquote>')
    .replace(/^- (.*?)$/gm,
      '<li class="ml-5 mb-3 list-disc text-sm md:text-base leading-relaxed text-muted-foreground">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 font-medium hover:text-primary/80 break-words">$1</a>')
    .replace(/\n\n/g,
      '</p><p class="mb-5 text-muted-foreground leading-[1.75] text-sm md:text-base">');
  html = `<p class="mb-5 text-muted-foreground leading-[1.75] text-sm md:text-base">${html}</p>`;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "h2", "h3", "h4", "strong", "em", "li", "ul", "ol", "a", "br", "span", "blockquote"],
    ALLOWED_ATTR: ["href", "class", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

function RelatedHorizontal({ a }: { a: NewsArticleData }) {
  const s = sentimentStyle(a.sentiment);
  return (
    <Link to={`/news/${a.slug}`} className="group flex flex-col gap-2 shrink-0 w-56 sm:w-64 snap-start">
      <div className="aspect-video overflow-hidden bg-muted">
        {a.imageUrl && (
          <img src={a.imageUrl} alt={a.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] font-bold px-1.5 py-px border uppercase tracking-wider ${s.className}`}>{s.label}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />{timeAgo(a.publishedAt)}
          </span>
        </div>
        <h3 className="font-bold font-display text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
          {a.title}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1 font-medium">{a.sourceName}</p>
      </div>
    </Link>
  );
}

function RelatedRow({ a }: { a: NewsArticleData }) {
  const s = sentimentStyle(a.sentiment);
  return (
    <Link to={`/news/${a.slug}`} className="editorial-row items-start gap-3 group py-3">
      {a.imageUrl && (
        <div className="w-14 h-10 overflow-hidden shrink-0 bg-muted">
          <img src={a.imageUrl} alt={a.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[9px] font-bold px-1 py-px border ${s.className}`}>{s.label}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(a.publishedAt)}</span>
        </div>
        <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">{a.sourceName}</p>
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

  const shareLinks = article ? {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(article.title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(article.title + " " + articleUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent("Check out this article: " + articleUrl)}`,
  } : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <Helmet><title>Article not found | Oracle Bull News</title></Helmet>
        <div className="container mx-auto px-4 py-20 text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3 font-display">Article not found</h1>
          <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
            This story may have expired. Browse the latest crypto news instead.
          </p>
          <button onClick={() => navigate("/news")}
            className="bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2">
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
        <meta property="article:published_time" content={isoPublished} />
        <meta property="article:section" content={article.category} />
      </Helmet>

      {/* Reading progress bar — only when NOT showing sticky bar */}
      {!stickyVisible && (
        <div className="fixed top-0 left-0 h-0.5 bg-primary z-[100] transition-all duration-100" style={{ width: `${progress}%` }} />
      )}

      {/* Sticky bar on scroll */}
      {stickyVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
          <div className="container mx-auto px-4 h-11 flex items-center gap-3 max-w-4xl">
            <Link to="/news" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 shrink-0">
              <ChevronLeft className="w-3.5 h-3.5" /> News
            </Link>
            <h2 className="flex-1 text-xs sm:text-sm font-bold line-clamp-1 text-foreground min-w-0">{article.title}</h2>
            <div className="flex items-center gap-0.5 shrink-0">
              <a href={shareLinks!.x} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on X">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={shareLinks!.facebook} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href={shareLinks!.telegram} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on Telegram">
                <Send className="w-3.5 h-3.5" />
              </a>
              <button onClick={handleCopyLink} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Copy link">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <LinkIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-[11px] text-muted-foreground mb-6 flex items-center gap-1.5 overflow-hidden">
            <Link to="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
            <span className="shrink-0">/</span>
            <Link to="/news" className="hover:text-primary transition-colors shrink-0">News</Link>
            <span className="shrink-0">/</span>
            <span className="text-foreground truncate">{article.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_240px] gap-8 lg:gap-12">

            {/* Article */}
            <article className="min-w-0 overflow-hidden">

              {/* Category + sentiment */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="section-label text-primary">{article.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wider ${s.className}`}>
                  AI: {s.label}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" /> {article.readTime}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display leading-tight mb-4 tracking-tight break-words">
                {article.title}
              </h1>

              {/* Lead */}
              {article.metaDescription && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 border-l-3 border-primary pl-4">
                  {article.metaDescription}
                </p>
              )}

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground py-3 border-y border-border/50 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">{article.sourceName}</span>
                </div>
                <span>{formatDate(article.publishedAt)}</span>
                {article.coins.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {article.coins.slice(0, 4).map(c => (
                      <Link key={c.id} to={`/price-prediction/${c.id}`}
                        className="font-bold text-primary hover:underline">${c.symbol}</Link>
                    ))}
                  </div>
                )}
                <div className="ml-auto flex items-center gap-0.5">
                  <a href={shareLinks!.x} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on X">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href={shareLinks!.facebook} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on Facebook">
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a href={shareLinks!.linkedin} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on LinkedIn">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href={shareLinks!.telegram} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on Telegram">
                    <Send className="w-3.5 h-3.5" />
                  </a>
                  <a href={shareLinks!.whatsapp} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Share on WhatsApp">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={handleCopyLink}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors" aria-label="Copy link">
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Hero image */}
              {article.imageUrl && (
                <div className="overflow-hidden mb-8 aspect-video bg-muted">
                  <img src={article.imageUrl} alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }} />
                </div>
              )}

              {/* Article body */}
              <div className="max-w-none mb-8 overflow-hidden break-words"
                dangerouslySetInnerHTML={{ __html: contentHtml }} />

              {/* Source attribution */}
              <div className="border-l-3 border-primary/40 pl-4 py-2 mb-6 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  AI-summarised brief based on reporting by{" "}
                  <a href={article.externalUrl} target="_blank" rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline">{article.sourceName}</a>.
                </p>
              </div>

              {/* Source CTA + Share */}
              <div className="mb-10 space-y-4">
                <a href={article.externalUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs sm:text-sm font-bold hover:bg-foreground/90 transition-all">
                  Read full story on {article.sourceName} <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium mr-1">Share:</span>
                  <a href={shareLinks!.x} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </a>
                  <a href={shareLinks!.facebook} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    <Facebook className="w-3.5 h-3.5" /> Facebook
                  </a>
                  <a href={shareLinks!.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                  <a href={shareLinks!.reddit} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                    Reddit
                  </a>
                  <a href={shareLinks!.telegram} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    <Send className="w-3.5 h-3.5" /> Telegram
                  </a>
                  <a href={shareLinks!.whatsapp} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a href={shareLinks!.email}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                  <button onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:border-primary/50 hover:text-primary transition-all">
                    {copied ? <><Check className="w-3.5 h-3.5 text-success" /> Copied</> : <><LinkIcon className="w-3.5 h-3.5" /> Copy Link</>}
                  </button>
                </div>
              </div>

              {/* Key Takeaways */}
              {article.takeaways.length > 0 && (
                <div className="mb-10 border-t border-border pt-6">
                  <h2 className="font-bold font-display text-lg sm:text-xl mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" /> Key Takeaways
                  </h2>
                  <ul className="space-y-3">
                    {article.takeaways.map((t, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed border-b border-border/20 pb-3 last:border-0 last:pb-0">
                        <span className="font-mono text-primary font-bold shrink-0 text-xs mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-border/30 flex flex-wrap gap-2">
                    <Link to="/predictions"
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-all">
                      <TrendingUp className="w-3.5 h-3.5" /> AI Predictions
                    </Link>
                    <Link to="/sentiment"
                      className="inline-flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-medium hover:border-primary/50 transition-colors">
                      <Activity className="w-3.5 h-3.5" /> Sentiment
                    </Link>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {article.faqs.length > 0 && (
                <div className="mb-10 border-t border-border/30 pt-6">
                  <h2 className="font-bold font-display text-lg sm:text-xl mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" /> FAQ
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {article.faqs.map((f, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-border/40">
                        <AccordionTrigger className="text-left font-bold text-sm hover:text-primary transition-colors py-3">
                          {f.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                          {f.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Related articles at bottom */}
              {related.length > 0 && (
                <div className="border-t border-border pt-6 mb-6">
                  <h2 className="font-bold font-display text-lg mb-4">Read Next</h2>
                  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x -mx-4 px-4">
                    {related.map(r => <RelatedHorizontal key={r.id} a={r} />)}
                  </div>
                  <Link to="/news"
                    className="mt-4 inline-flex items-center gap-1.5 text-primary font-bold hover:underline text-xs">
                    All crypto news <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-muted-foreground/50 border-t border-border/20 pt-4 leading-relaxed">
                Aggregated for informational purposes with attribution and link to original source. AI sentiment is a
                research signal, not financial advice. Always do your own research.
              </p>
            </article>

            {/* Sidebar — hidden on mobile, compact on desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-16 space-y-6">
                {/* Coins mentioned */}
                {article.coins.length > 0 && (
                  <div>
                    <h2 className="font-bold font-display text-sm flex items-center gap-2 mb-3">
                      <Tag className="w-3.5 h-3.5 text-primary" /> Coins
                    </h2>
                    <div>
                      {article.coins.map((c) => (
                        <Link key={c.id} to={`/price-prediction/${c.id}`}
                          className="editorial-row items-center justify-between group py-2">
                          <div>
                            <span className="font-bold text-xs">{c.name}</span>
                            <span className="text-muted-foreground text-[10px] ml-1">{c.symbol}</span>
                          </div>
                          <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Predict <TrendingUp className="w-2.5 h-2.5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related */}
                {related.length > 0 && (
                  <div>
                    <h2 className="font-bold font-display text-sm mb-3">More Stories</h2>
                    <div>
                      {related.slice(0, 4).map((r) => <RelatedRow key={r.id} a={r} />)}
                    </div>
                    <Link to="/news" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      All news <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}
