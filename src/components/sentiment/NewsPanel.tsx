import { 
  Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, 
  AlertTriangle, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NewsArticle {
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url: string;
  category: string;
}

const mockNews: NewsArticle[] = [
  {
    title: "Bitcoin ETF inflows reach new all-time high as institutional interest surges",
    source: "CoinDesk",
    time: "12 min ago",
    sentiment: "positive",
    url: "#",
    category: "ETF"
  },
  {
    title: "Ethereum developers announce major upgrade timeline for 2025",
    source: "The Block",
    time: "45 min ago",
    sentiment: "positive",
    url: "#",
    category: "Development"
  },
  {
    title: "SEC delays decision on multiple altcoin ETF applications",
    source: "Bloomberg",
    time: "1 hour ago",
    sentiment: "negative",
    url: "#",
    category: "Regulation"
  },
  {
    title: "Major exchange reports record trading volume amid market volatility",
    source: "CryptoSlate",
    time: "2 hours ago",
    sentiment: "neutral",
    url: "#",
    category: "Exchange"
  },
  {
    title: "DeFi protocol TVL hits yearly high as yield farming returns",
    source: "DeFi Pulse",
    time: "3 hours ago",
    sentiment: "positive",
    url: "#",
    category: "DeFi"
  },
  {
    title: "Whale wallet moves $500M in Bitcoin to unknown address",
    source: "Whale Alert",
    time: "4 hours ago",
    sentiment: "neutral",
    url: "#",
    category: "Whale"
  },
];

export function NewsPanel() {
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
          LATEST CRYPTO NEWS
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          AI-analyzed sentiment
        </div>
      </div>

      <div className="space-y-3">
        {mockNews.map((article, i) => (
          <button
            key={i}
            onClick={() => window.open(article.url, '_blank')}
            className={cn(
              "w-full text-left p-4 rounded-lg bg-muted/30 border-l-4 hover:bg-muted/50 transition-all group",
              getSentimentBorder(article.sentiment)
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.time}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getSentimentIcon(article.sentiment)}
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4 gap-2">
        <Newspaper className="w-4 h-4" />
        Load More News
      </Button>
    </div>
  );
}
