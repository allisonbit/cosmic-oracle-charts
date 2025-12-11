import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Hash, TrendingUp, TrendingDown, MessageCircle, Twitter, Globe, Users, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendingTopic {
  tag: string;
  mentions: number;
  sentiment: "bullish" | "bearish" | "neutral";
  change: number;
  twitterMentions?: number;
  redditPosts?: number;
  telegramMessages?: number;
}

interface TopicDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: TrendingTopic | null;
}

export function TopicDetailModal({ open, onOpenChange, topic }: TopicDetailModalProps) {
  if (!topic) return null;

  const twitterCount = topic.twitterMentions || Math.floor(topic.mentions * 0.6);
  const redditCount = topic.redditPosts || Math.floor(topic.mentions * 0.25);
  const telegramCount = topic.telegramMessages || Math.floor(topic.mentions * 0.15);

  const getSentimentAnalysis = () => {
    if (topic.sentiment === "bullish") {
      return "Social sentiment is predominantly positive. Community discussions show optimism about price action and project developments.";
    }
    if (topic.sentiment === "bearish") {
      return "Negative sentiment dominates discussions. Community expressing concerns about price decline or project issues.";
    }
    return "Mixed sentiment across platforms. Community is divided with both bullish and bearish perspectives being shared.";
  };

  const getTrendAnalysis = () => {
    if (topic.change > 20) {
      return "Viral growth detected. This topic is spreading rapidly across social platforms, indicating high community interest.";
    }
    if (topic.change > 0) {
      return "Steady increase in discussions. Growing interest suggests this topic may continue trending.";
    }
    if (topic.change > -10) {
      return "Slight decrease in mentions. Interest may be stabilizing after previous activity.";
    }
    return "Significant decline in discussions. Community attention may be shifting elsewhere.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              topic.sentiment === "bullish" ? "bg-success/20" :
              topic.sentiment === "bearish" ? "bg-danger/20" : "bg-warning/20"
            )}>
              <Hash className={cn(
                "w-6 h-6",
                topic.sentiment === "bullish" ? "text-success" :
                topic.sentiment === "bearish" ? "text-danger" : "text-warning"
              )} />
            </div>
            <div>
              <span className="text-xl font-display">{topic.tag}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-bold",
                  topic.sentiment === "bullish" ? "bg-success/20 text-success" :
                  topic.sentiment === "bearish" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"
                )}>
                  {topic.sentiment.toUpperCase()}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  topic.change >= 0 ? "text-success" : "text-danger"
                )}>
                  {topic.change >= 0 ? "+" : ""}{topic.change}% trend
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Total Mentions */}
          <div className="p-4 rounded-xl bg-muted/10 border border-border/30 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Mentions (24h)</p>
            <p className="text-3xl font-display font-bold text-primary">
              {(topic.mentions / 1000).toFixed(0)}K
            </p>
            <div className={cn(
              "flex items-center justify-center gap-1 mt-2 text-sm",
              topic.change >= 0 ? "text-success" : "text-danger"
            )}>
              {topic.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {topic.change >= 0 ? "+" : ""}{topic.change}% vs yesterday
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Platform Breakdown
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                  <span className="text-sm">Twitter/X</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{(twitterCount / 1000).toFixed(1)}K</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({Math.round((twitterCount / topic.mentions) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#FF4500]" />
                  <span className="text-sm">Reddit</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{(redditCount / 1000).toFixed(1)}K</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({Math.round((redditCount / topic.mentions) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0088cc]" />
                  <span className="text-sm">Telegram</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{(telegramCount / 1000).toFixed(1)}K</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({Math.round((telegramCount / topic.mentions) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className={cn(
            "p-4 rounded-xl border",
            topic.sentiment === "bullish" ? "bg-success/10 border-success/30" :
            topic.sentiment === "bearish" ? "bg-danger/10 border-danger/30" : "bg-warning/10 border-warning/30"
          )}>
            <h4 className="font-display font-bold text-sm mb-2">Sentiment Analysis</h4>
            <p className="text-sm text-muted-foreground">{getSentimentAnalysis()}</p>
          </div>

          {/* Trend Analysis */}
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <h4 className="font-display font-bold text-sm mb-2 text-primary">Trend Analysis</h4>
            <p className="text-sm text-foreground">{getTrendAnalysis()}</p>
          </div>

          {/* External Link */}
          <a
            href={`https://twitter.com/search?q=${encodeURIComponent(topic.tag)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Search on Twitter/X
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}