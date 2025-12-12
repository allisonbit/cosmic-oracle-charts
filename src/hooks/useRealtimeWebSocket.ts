import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { debouncedFetch } from "@/lib/requestQueue";

interface RealtimePrice {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface WhaleAlert {
  id: string;
  type: "buy" | "sell" | "transfer";
  token: string;
  amount: number;
  value: number;
  timestamp: number;
  txHash: string;
  fromWallet: string;
  toWallet?: string;
  explorerUrl: string;
  chainId: string;
  impact: "low" | "medium" | "high";
}

// Stable polling-based implementation with request deduplication
export function useRealtimePricesWS(chainIds: string[]) {
  const [prices, setPrices] = useState<Record<string, RealtimePrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchPrices = useCallback(async () => {
    if (!mountedRef.current || chainIds.length === 0) return;

    try {
      // Use deduplicated fetch to prevent duplicate requests
      const data = await debouncedFetch(
        `realtime-prices-${chainIds.sort().join(",")}`,
        async () => {
          const { data, error } = await supabase.functions.invoke("realtime-prices", {
            body: { chains: chainIds },
          });
          if (error) throw error;
          return data;
        },
        2000 // 2 second dedupe window
      );

      if (data?.prices && mountedRef.current) {
        setPrices(data.prices);
        setLastUpdate(data.timestamp || Date.now());
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Exception fetching realtime prices:", err);
      if (mountedRef.current) {
        setIsConnected(false);
      }
    }
  }, [chainIds]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchPrices();

    // Set up polling every 15 seconds (reduced from 6s to prevent rate limiting)
    intervalRef.current = setInterval(fetchPrices, 15000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices]);

  return { prices, isConnected, lastUpdate };
}

// Whale alerts hook - notifications disabled, just fetch data silently
export function useWhaleAlertsWS(chainId: string, enableNotifications = false) {
  const [alerts, setAlerts] = useState<WhaleAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newAlert, setNewAlert] = useState<WhaleAlert | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const previousAlertsRef = useRef<string[]>([]);

  const fetchAlerts = useCallback(async () => {
    if (!mountedRef.current || !chainId) return;

    try {
      // Use deduplicated fetch
      const data = await debouncedFetch(
        `whale-alerts-${chainId}`,
        async () => {
          const { data, error } = await supabase.functions.invoke("whale-alerts", {
            body: { chainId },
          });
          if (error) throw error;
          return data;
        },
        3000 // 3 second dedupe window
      );

      if (data?.alerts && mountedRef.current) {
        const alertsData = data.alerts as WhaleAlert[];
        
        // Only set new alert if notifications are enabled
        if (enableNotifications) {
          const currentIds = alertsData.map(a => a.id);
          const newAlerts = alertsData.filter(a => !previousAlertsRef.current.includes(a.id));
          
          if (newAlerts.length > 0 && previousAlertsRef.current.length > 0) {
            setNewAlert(newAlerts[0]);
            setTimeout(() => {
              if (mountedRef.current) setNewAlert(null);
            }, 5000);
          }
          
          previousAlertsRef.current = currentIds;
        }
        
        setAlerts(alertsData);
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Exception fetching whale alerts:", err);
      if (mountedRef.current) {
        setIsConnected(false);
      }
    }
  }, [chainId, enableNotifications]);

  useEffect(() => {
    mountedRef.current = true;
    previousAlertsRef.current = [];
    
    // Initial fetch
    fetchAlerts();

    // Poll every 30 seconds for whale alerts (reduced from 10s)
    intervalRef.current = setInterval(fetchAlerts, 30000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAlerts]);

  return { alerts, isConnected, newAlert };
}