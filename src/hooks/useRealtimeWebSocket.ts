import { useState, useEffect, useCallback, useRef } from "react";

const SUPABASE_URL = "wss://qynszkirmcrldqmiplwh.functions.supabase.co/functions/v1";

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

export function useRealtimePricesWS(chainIds: string[]) {
  const [prices, setPrices] = useState<Record<string, RealtimePrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log("Connecting to realtime prices WebSocket...");
    const ws = new WebSocket(`${SUPABASE_URL}/realtime-prices`);

    ws.onopen = () => {
      console.log("Realtime prices WebSocket connected");
      setIsConnected(true);
      
      // Subscribe to specific chains
      ws.send(JSON.stringify({
        type: "subscribe",
        chains: chainIds,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "price_update") {
          setPrices(data.prices);
          setLastUpdate(data.timestamp);
        }
        
        if (data.type === "pong") {
          console.log("Received pong from server");
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("Realtime prices WebSocket closed");
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [chainIds]);

  useEffect(() => {
    connect();

    // Set up ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { prices, isConnected, lastUpdate };
}

export function useWhaleAlertsWS(chainId: string) {
  const [alerts, setAlerts] = useState<WhaleAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newAlert, setNewAlert] = useState<WhaleAlert | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log("Connecting to whale alerts WebSocket...");
    const ws = new WebSocket(`${SUPABASE_URL}/whale-alerts`);

    ws.onopen = () => {
      console.log("Whale alerts WebSocket connected");
      setIsConnected(true);
      
      // Subscribe to specific chain
      ws.send(JSON.stringify({
        type: "subscribe",
        chainId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "whale_alerts") {
          setAlerts(data.alerts);
        }
        
        if (data.type === "new_whale_alert" && data.alerts.length > 0) {
          const alert = data.alerts[0];
          setNewAlert(alert);
          setAlerts(prev => [alert, ...prev.slice(0, 19)]);
          
          // Clear new alert notification after 5 seconds
          setTimeout(() => setNewAlert(null), 5000);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("Whale alerts WebSocket closed");
      setIsConnected(false);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [chainId]);

  useEffect(() => {
    connect();

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { alerts, isConnected, newAlert };
}
