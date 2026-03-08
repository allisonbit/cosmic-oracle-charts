import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const coinId = token.name?.toLowerCase().replace(/\s+/g, '-') || token.symbol.toLowerCase();

  return (
    <Button
      variant="cosmic"
      size="sm"
      onClick={() => navigate(`/price-prediction/${coinId}/daily`)}
      className={cn("gap-2", className)}
    >
      <BookOpen className="w-4 h-4" />
      Tell Me the Story
      <Sparkles className="w-3 h-3 text-warning" />
    </Button>
  );
}
