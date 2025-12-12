import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

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

// Stable polling-based implementation instead of WebSocket
export function useRealtimePricesWS(chainIds: string[]) {
  const [prices, setPrices] = useState<Record<string, RealtimePrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchPrices = useCallback(async () => {
    if (!mountedRef.current || chainIds.length === 0) return;

    try {
      const { data, error } = await supabase.functions.invoke("realtime-prices", {
        body: { chains: chainIds },
      });

      if (error) {
        console.error("Error fetching realtime prices:", error);
        setIsConnected(false);
        return;
      }

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

    // Set up polling every 6 seconds for smoother live updates
    intervalRef.current = setInterval(fetchPrices, 6000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices]);

  return { prices, isConnected, lastUpdate };
}

export function useWhaleAlertsWS(chainId: string) {
  const [alerts, setAlerts] = useState<WhaleAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newAlert, setNewAlert] = useState<WhaleAlert | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const previousAlertsRef = useRef<string[]>([]);

  const fetchAlerts = useCallback(async () => {
    if (!mountedRef.current || !chainId) return;

    try {
      const { data, error } = await supabase.functions.invoke("whale-alerts", {
        body: { chainId },
      });

      if (error) {
        console.error("Error fetching whale alerts:", error);
        setIsConnected(false);
        return;
      }

      if (data?.alerts && mountedRef.current) {
        const alertsData = data.alerts as WhaleAlert[];
        
        // Check for new alerts
        const currentIds = alertsData.map(a => a.id);
        const newAlerts = alertsData.filter(a => !previousAlertsRef.current.includes(a.id));
        
        if (newAlerts.length > 0 && previousAlertsRef.current.length > 0) {
          setNewAlert(newAlerts[0]);
          setTimeout(() => {
            if (mountedRef.current) setNewAlert(null);
          }, 5000);
        }
        
        previousAlertsRef.current = currentIds;
        setAlerts(alertsData);
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Exception fetching whale alerts:", err);
      if (mountedRef.current) {
        setIsConnected(false);
      }
    }
  }, [chainId]);

  useEffect(() => {
    mountedRef.current = true;
    previousAlertsRef.current = [];
    
    // Initial fetch
    fetchAlerts();

    // Poll every 10 seconds for whale alerts
    intervalRef.current = setInterval(fetchAlerts, 10000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAlerts]);

  return { alerts, isConnected, newAlert };
}