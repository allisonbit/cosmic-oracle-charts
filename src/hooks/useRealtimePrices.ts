import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RealtimePrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: number;
}

export function useRealtimePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, RealtimePrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchPrices = useCallback(async () => {
    if (!mountedRef.current || symbols.length === 0) return;

    try {
      const { data, error } = await supabase.functions.invoke("crypto-prices");
      
      if (error) {
        console.error("Error fetching realtime prices:", error);
        if (mountedRef.current) setIsConnected(false);
        return;
      }

      if (data?.prices && mountedRef.current) {
        const priceMap: Record<string, RealtimePrice> = {};
        data.prices.forEach((p: any) => {
          if (symbols.includes(p.symbol)) {
            priceMap[p.symbol] = {
              symbol: p.symbol,
              price: p.price,
              change24h: p.change24h,
              lastUpdated: Date.now(),
            };
          }
        });
        setPrices(priceMap);
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Exception fetching realtime prices:", err);
      if (mountedRef.current) setIsConnected(false);
    }
  }, [symbols]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchPrices();

    // Set up polling every 8 seconds for smoother updates
    intervalRef.current = setInterval(fetchPrices, 8000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices]);

  return { prices, isConnected, refetch: fetchPrices };
}
