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
  const { refreshInterval = 30000 } = options;

  const [data, setData] = useState<FundingRatesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFundingRates = useCallback(async () => {
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
    return () => clearInterval(interval);
  }, [fetchFundingRates, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFundingRates
  };
}
