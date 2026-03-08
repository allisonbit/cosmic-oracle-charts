import { 
  Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, 
  AlertTriangle, Sparkles, Loader2, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RealNewsArticle } from "@/hooks/useSentimentData";

interface NewsPanelProps {
  news: RealNewsArticle[];
  isLoading?: boolean;
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NewsPanel({ news, isLoading }: NewsPanelProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-danger" />;
      default: return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getSentimentBorder = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'border-l-success';
      case 'negative': return 'border-l-danger';
      default: return 'border-l-warning';
    }
  };

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          LIVE CRYPTO NEWS
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          AI-analyzed sentiment • Live
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : news.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No news available</p>
      ) : (
        <div className="space-y-3">
          {news.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "block w-full text-left p-4 rounded-lg bg-muted/30 border-l-4 hover:bg-muted/50 transition-all group",
                getSentimentBorder(article.sentiment)
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  {article.body && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{article.body}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium text-foreground">{article.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(article.publishedAt)}
                    </span>
                    {article.categories && (
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground truncate max-w-[120px]">
                        {article.categories.split('|')[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getSentimentIcon(article.sentiment)}
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
