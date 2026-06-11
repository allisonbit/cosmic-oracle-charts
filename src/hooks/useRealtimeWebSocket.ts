import { useState, useEffect, useCallback, useRef } from "react";
import { invokeFunction } from "@/integrations/supabase/functions";
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
    // Skip polling while the tab is hidden — saves Supabase edge invocations on
    // abandoned/background tabs at scale. We refresh immediately on re-focus below.
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    try {
      // Use deduplicated fetch to prevent duplicate requests
      const data = await debouncedFetch(
        `realtime-prices-${chainIds.sort().join(",")}`,
        async () => {
          const { data, error } = await invokeFunction("realtime-prices", {
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

    // Set up polling every 8 seconds for 24/7 real-time updates
    intervalRef.current = setInterval(fetchPrices, 8000);

    // Refresh as soon as the user returns to the tab (covers the hidden-skip above)
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchPrices();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", onVisible);
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
    // Skip polling while the tab is hidden (resumes on re-focus below).
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    try {
      // Use deduplicated fetch
      const data = await debouncedFetch(
        `whale-alerts-${chainId}`,
        async () => {
          const { data, error } = await invokeFunction("whale-alerts", {
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

    // Poll every 15 seconds for whale alerts - 24/7 updates
    intervalRef.current = setInterval(fetchAlerts, 15000);

    // Refresh on tab re-focus (covers the hidden-skip above)
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchAlerts();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchAlerts]);

  return { alerts, isConnected, newAlert };
}