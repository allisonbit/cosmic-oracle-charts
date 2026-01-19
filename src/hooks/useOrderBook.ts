import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    try {
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('orderbook', {
        body: {},
        headers: {},
      });

      // Use query params approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orderbook?pair=${pair}&exchange=${exchange.toLowerCase()}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch order book');
      }

      const orderBookData = await response.json();
      
      if (orderBookData.error) {
        throw new Error(orderBookData.error);
      }

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
    return () => clearInterval(interval);
  }, [fetchOrderBook, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchOrderBook
  };
}
