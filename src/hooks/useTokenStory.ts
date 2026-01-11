import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

interface StoryResult {
  success?: boolean;
  story?: string;
  token?: string;
  error?: string;
  generatedAt: string;
}

export function useTokenStory() {
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateStory = useCallback(async (token: TokenData, sentimentData: SentimentData) => {
    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<StoryResult>('token-story', {
        body: { token, sentimentData },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate story');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.story) {
        setStory(data.story);
        return data.story;
      }

      throw new Error('No story generated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate story';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStory(null);
    setError(null);
  }, []);

  return {
    generateStory,
    story,
    isLoading,
    error,
    reset,
  };
}