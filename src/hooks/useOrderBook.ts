import { useState, useEffect, useCallback } from 'react';
import { invokeFunction } from '@/integrations/supabase/functions';

interface OrderLevel {
  price: number;
  amount: number;
  total: number;
}

interface OrderBookData {
  bids: OrderLevel[];
  asks: OrderLevel[];
  spread: number;
  totalDepth: number;
  imbalance: number;
  exchange: string;
  pair: string;
  timestamp: string;
}

interface UseOrderBookOptions {
  pair?: string;
  exchange?: string;
  limit?: number;
  refreshInterval?: number;
}

export function useOrderBook(options: UseOrderBookOptions = {}) {
  const {
    pair = 'BTCUSDT',
    exchange = 'binance',
    limit = 10,
    refreshInterval = 2000 // 2 seconds for real-time order book updates
  } = options;

  const [data, setData] = useState<OrderBookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderBook = useCallback(async () => {
    // Skip polling while the tab is hidden — saves edge-function invocations on
    // backgrounded/abandoned tabs. We refresh on visibility return below.
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    try {
      const { data: orderBookData, error: fetchError } = await invokeFunction('orderbook', {
        body: { pair, exchange: exchange.toLowerCase(), limit },
      });
      if (fetchError) throw fetchError;
      if (orderBookData?.error) throw new Error(orderBookData.error);
      setData(orderBookData);
      setError(null);
    } catch (err) {
      console.error('Order book fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [pair, exchange, limit]);

  useEffect(() => {
    fetchOrderBook();

    const interval = setInterval(fetchOrderBook, refreshInterval);
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchOrderBook();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchOrderBook, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchOrderBook
  };
}
