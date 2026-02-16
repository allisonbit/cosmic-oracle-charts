import { useState } from 'react';
import { BookOpen, Loader2, Sparkles, X, TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTokenStory } from '@/hooks/useTokenStory';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  rank?: number;
}

interface SentimentData {
  fearGreedIndex: number;
  socialSentiment: number;
  volatilityIndex: number;
  whaleActivity: number;
  marketMomentum: string;
  whaleMood: string;
  netflow: number;
}

interface TellMeTheStoryProps {
  token: TokenData;
  sentimentData: SentimentData;
  className?: string;
}

export function TellMeTheStory({ token, sentimentData, className }: TellMeTheStoryProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generateStory, story, isLoading, error, reset } = useTokenStory();

  const handleOpen = async () => {
    setOpen(true);
    if (!story) {
      await generateStory(token, sentimentData);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRegenerate = async () => {
    reset();
    await generateStory(token, sentimentData);
  };

  const handleCopy = async () => {
    if (story) {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      toast.success('Story copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBiasIcon = () => {
    if (token.change24h > 2) return <TrendingUp className="w-4 h-4 text-success" />;
    if (token.change24h < -2) return <TrendingDown className="w-4 h-4 text-danger" />;
    return <Minus className="w-4 h-4 text-warning" />;
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <Button
        variant="cosmic"
        size="sm"
        onClick={handleOpen}
        className={cn("gap-2", className)}
      >
        <BookOpen className="w-4 h-4" />
        Tell Me the Story
        <Sparkles className="w-3 h-3 text-warning" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-display">
                    {token.name} Market Story
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    {token.symbol} • {formatPrice(token.price)} 
                    <span className={cn(
                      "flex items-center gap-1 font-medium",
                      token.change24h > 0 ? "text-success" : token.change24h < 0 ? "text-danger" : "text-muted-foreground"
                    )}>
                      {getBiasIcon()}
                      {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="px-6 py-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
                    <Loader2 className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm font-display">Analyzing market data...</p>
                  <p className="text-muted-foreground/60 text-xs">Combining sentiment from all sources</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="p-4 rounded-full bg-danger/10">
                    <X className="w-8 h-8 text-danger" />
                  </div>
                  <p className="text-danger font-medium">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              ) : story ? (
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-card/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Fear & Greed</p>
                      <p className={cn(
                        "font-bold",
                        sentimentData.fearGreedIndex > 60 ? "text-success" : 
                        sentimentData.fearGreedIndex < 40 ? "text-danger" : "text-warning"
                      )}>
                        {sentimentData.fearGreedIndex}/100
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Social</p>
                      <p className={cn(
                        "font-bold",
                        sentimentData.socialSentiment > 60 ? "text-success" : 
                        sentimentData.socialSentiment < 40 ? "text-danger" : "text-warning"
                      )}>
                        {sentimentData.socialSentiment.toFixed(0)}/100
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Whale Mood</p>
                      <p className={cn(
                        "font-bold capitalize",
                        sentimentData.whaleMood === 'accumulating' ? "text-success" : 
                        sentimentData.whaleMood === 'distributing' ? "text-danger" : "text-warning"
                      )}>
                        {sentimentData.whaleMood}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/50 border border-border/30">
                      <p className="text-xs text-muted-foreground">Momentum</p>
                      <p className={cn(
                        "font-bold",
                        sentimentData.marketMomentum === 'BULLISH' ? "text-success" : 
                        sentimentData.marketMomentum === 'BEARISH' ? "text-danger" : "text-warning"
                      )}>
                        {sentimentData.marketMomentum}
                      </p>
                    </div>
                  </div>

                  {/* AI Story */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-card/80 to-card/40 border border-border/30">
                    <div className="prose prose-sm max-w-none">
                      {story.split('\n').map((paragraph, idx) => (
                        paragraph.trim() ? (
                          <p key={idx} className="text-foreground/90 leading-relaxed mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ) : null
                      ))}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-xs text-muted-foreground/60 text-center">
                    AI-generated analysis for informational purposes only. Not financial advice.
                  </p>
                </div>
              ) : null}
            </div>
          </ScrollArea>

          {story && (
            <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between gap-3 bg-card/30">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <a href={`/price-prediction/${token.symbol.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                  Full Analysis
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}