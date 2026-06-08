import { Link } from "react-router-dom";
import { useNewsFeed, timeAgo, sentimentStyle } from "@/hooks/useNews";
import { Newspaper, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeNews() {
  const { data, isLoading } = useNewsFeed({ limit: 9 });
  const articles = data?.articles ?? [];
  if (!isLoading && articles.length === 0) return null;
  const items = articles.slice(0, 8);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-2 rounded-xl bg-primary/15 shrink-0"><Newspaper className="w-5 h-5 text-primary" /></span>
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-display font-bold flex items-center gap-2">
              Latest Crypto News
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-success"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />LIVE</span>
            </h2>
            <p className="text-xs text-muted-foreground truncate">Breaking headlines with AI sentiment — updated every 30 minutes</p>
          </div>
        </div>
        <Link to="/news" className="text-sm text-primary font-semibold inline-flex items-center gap-1 hover:underline shrink-0">All news <ArrowRight className="w-4 h-4" /></Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((a) => {
            const s = sentimentStyle(a.sentiment);
            return (
              <Link key={a.id} to={`/news/${a.slug}`} className="group rounded-xl border border-border/50 bg-card/40 overflow-hidden hover:border-primary/40 transition-all flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {a.imageUrl && <img src={a.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                  <span className={cn("absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded border backdrop-blur-md", s.className)}>{s.label}</span>
                </div>
                <div className="p-2.5 flex flex-col flex-1">
                  <h3 className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">{a.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="font-medium truncate max-w-[90px]">{a.sourceName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 shrink-0"><Clock className="w-2.5 h-2.5" />{timeAgo(a.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
