import { useState, useEffect, useCallback } from 'react';

interface FundingRate {
  asset: string;
  symbol: string;
  binance: number;
  bybit: number;
  okx: number;
  avg: number;
}

interface FundingRatesData {
  fundingRates: FundingRate[];
  timestamp: string;
  sources: {
    binance: boolean;
    bybit: boolean;
    okx: boolean;
  };
}

interface UseFundingRatesOptions {
  refreshInterval?: number;
}

export function useFundingRates(options: UseFundingRatesOptions = {}) {
  const { refreshInterval = 15000 } = options; // 15 seconds default for 24/7 updates

  const [data, setData] = useState<FundingRatesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFundingRates = useCallback(async () => {
    // Skip polling while tab is hidden — resumes on visibility return below.
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/funding-rates`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch funding rates');
      }

      // Guard against a 200 that isn't JSON (CDN/error page, SPA fallback) so we
      // surface a clean error instead of a confusing JSON SyntaxError.
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Funding rates endpoint returned a non-JSON response');
      }

      const fundingData = await response.json();
      
      if (fundingData.error) {
        throw new Error(fundingData.error);
      }

      setData(fundingData);
      setError(null);
    } catch (err) {
      console.error('Funding rates fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFundingRates();

    const interval = setInterval(fetchFundingRates, refreshInterval);
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchFundingRates();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchFundingRates, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFundingRates
  };
}
