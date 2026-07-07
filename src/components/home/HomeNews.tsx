import { Link } from "react-router-dom";
import { useNewsFeed, timeAgo, sentimentStyle } from "@/hooks/useNews";
import { Newspaper, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeNews() {
  const { data, isLoading } = useNewsFeed({ limit: 10 });
  const articles = data?.articles ?? [];
  if (!isLoading && articles.length === 0) return null;

  const [hero, ...rest] = articles.slice(0, 9);
  const listItems = rest.slice(0, 7);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="section-header mb-5">
        <span className="section-label flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5" />
          Latest News
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-success ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />LIVE
          </span>
        </span>
        <Link to="/news" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline shrink-0">
          All news <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-72 bg-muted/30 animate-pulse rounded-sm" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/20 animate-pulse border-b border-border/20" />
          ))}
        </div>
      ) : (
        <div>
          {/* Hero article */}
          {hero && (
            <Link to={`/news/${hero.slug}`} className="group block mb-6 border-b border-border/30 pb-6">
              {hero.imageUrl && (
                <div className="aspect-[16/7] mb-4 overflow-hidden rounded-sm">
                  <img
                    src={hero.imageUrl}
                    alt={hero.title}
                    loading="eager"
                    width={800}
                    height={350}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border", sentimentStyle(hero.sentiment).className)}>
                  {sentimentStyle(hero.sentiment).label}
                </span>
                {hero.category && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                    {hero.category}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-extrabold leading-tight group-hover:text-primary transition-colors mb-3">
                {hero.title}
              </h2>
              {hero.metaDescription && (
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  {hero.metaDescription}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{hero.sourceName}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />{timeAgo(hero.publishedAt)}
                </span>
                {hero.readTime && (
                  <>
                    <span>·</span>
                    <span>{hero.readTime} min read</span>
                  </>
                )}
              </div>
            </Link>
          )}

          {/* Article list rows */}
          <div>
            {listItems.map((a) => {
              const s = sentimentStyle(a.sentiment);
              return (
                <Link key={a.id} to={`/news/${a.slug}`} className="editorial-row group items-start">
                  {a.imageUrl && (
                    <div className="w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        loading="lazy"
                        width={96}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn("font-bold text-[10px]", s.className)}>{s.label}</span>
                      <span className="font-medium truncate max-w-[100px]">{a.sourceName}</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3" />{timeAgo(a.publishedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
