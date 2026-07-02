import { Link } from "react-router-dom";
import { useNewsFeed, timeAgo, sentimentStyle } from "@/hooks/useNews";
import { Newspaper, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeNews() {
  const { data, isLoading } = useNewsFeed({ limit: 9 });
  const articles = data?.articles ?? [];
  if (!isLoading && articles.length === 0) return null;

  const [hero, ...rest] = articles.slice(0, 8);
  const listItems = rest.slice(0, 6);

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
          <div className="h-56 bg-muted/30 animate-pulse rounded-sm" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted/20 animate-pulse border-b border-border/20" />
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
                    alt=""
                    loading="eager"
                    width={800}
                    height={350}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                  />
                </div>
              )}
              <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mb-2 inline-block border", sentimentStyle(hero.sentiment).className)}>
                {sentimentStyle(hero.sentiment).label}
              </span>
              <h2 className="text-xl md:text-2xl font-display font-bold leading-snug group-hover:text-primary transition-colors mb-2">
                {hero.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium">{hero.sourceName}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />{timeAgo(hero.publishedAt)}
                </span>
              </div>
            </Link>
          )}

          {/* Article list rows */}
          <div>
            {listItems.map((a) => {
              const s = sentimentStyle(a.sentiment);
              return (
                <Link key={a.id} to={`/news/${a.slug}`} className="editorial-row group">
                  {a.imageUrl && (
                    <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={a.imageUrl}
                        alt=""
                        loading="lazy"
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                      <span className={cn("font-bold", s.className)}>{s.label}</span>
                      <span>·</span>
                      <span className="font-medium truncate max-w-[80px]">{a.sourceName}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="w-2.5 h-2.5" />{timeAgo(a.publishedAt)}
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
