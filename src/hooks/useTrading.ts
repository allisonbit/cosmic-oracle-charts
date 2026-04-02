import { useState, useCallback } from "react";

export interface SwapQuote {
  allowanceTarget: string;
  buyAmount: string;
  buyToken: string;
  sellAmount: string;
  sellToken: string;
  minBuyAmount: string;
  gas: string;
  gasPrice: string;
  liquidityAvailable: boolean;
  route: { fills: { from: string; to: string; source: string; proportionBps: string }[] };
  transaction?: { to: string; data: string; value: string; gas: string; gasPrice: string };
  fees?: { zeroExFee?: { amount: string; token: string } };
}

export interface BridgeQuote {
  id: string;
  type: string;
  tool: string;
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: { symbol: string; decimals: number; address: string };
    toToken: { symbol: string; decimals: number; address: string };
    fromAmount: string;
    toAmount: string;
  };
  estimate: {
    toAmount: string;
    toAmountMin: string;
    approvalAddress: string;
    executionDuration: number;
    gasCosts: { amount: string; token: { symbol: string } }[];
    feeCosts: { amount: string; token: { symbol: string } }[];
  };
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    chainId: number;
  };
}

export interface Chain {
  id: number;
  name: string;
  icon: string;
  nativeCurrency: { symbol: string; decimals: number };
}

const SUPPORTED_CHAINS: Chain[] = [
  { id: 1, name: "Ethereum", icon: "⟠", nativeCurrency: { symbol: "ETH", decimals: 18 } },
  { id: 137, name: "Polygon", icon: "⬡", nativeCurrency: { symbol: "MATIC", decimals: 18 } },
  { id: 56, name: "BNB Chain", icon: "◆", nativeCurrency: { symbol: "BNB", decimals: 18 } },
  { id: 42161, name: "Arbitrum", icon: "◈", nativeCurrency: { symbol: "ETH", decimals: 18 } },
  { id: 10, name: "Optimism", icon: "⊕", nativeCurrency: { symbol: "ETH", decimals: 18 } },
  { id: 43114, name: "Avalanche", icon: "▲", nativeCurrency: { symbol: "AVAX", decimals: 18 } },
  { id: 8453, name: "Base", icon: "🔵", nativeCurrency: { symbol: "ETH", decimals: 18 } },
  { id: 324, name: "zkSync", icon: "⚡", nativeCurrency: { symbol: "ETH", decimals: 18 } },
];

const BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function tradingFetch(params: Record<string, string>, method = "GET", body?: unknown) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/functions/v1/trading?${qs}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: API_KEY,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

export function useTrading() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSwapPrice = useCallback(async (
    chainId: number, sellToken: string, buyToken: string, sellAmount: string,
  ): Promise<SwapQuote | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradingFetch({
        action: "price", chainId: String(chainId), sellToken, buyToken, sellAmount,
      });
      if (data.error || data.reason) {
        setError(data.reason || data.error || "Price unavailable");
        setLoading(false);
        return null;
      }
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message || "Price error");
      setLoading(false);
      return null;
    }
  }, []);

  const getSwapQuote = useCallback(async (
    chainId: number, sellToken: string, buyToken: string, sellAmount: string, taker: string,
  ): Promise<SwapQuote | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradingFetch({
        action: "quote", chainId: String(chainId), sellToken, buyToken, sellAmount, taker,
      });
      if (data.error || data.reason) {
        setError(data.reason || data.error || "Quote unavailable");
        setLoading(false);
        return null;
      }
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message || "Quote error");
      setLoading(false);
      return null;
    }
  }, []);

  const getBridgeQuote = useCallback(async (
    fromChainId: number, toChainId: number,
    fromTokenAddress: string, toTokenAddress: string,
    fromAmount: string, fromAddress?: string,
  ): Promise<BridgeQuote | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await tradingFetch(
        { action: "bridge-quote" },
        "POST",
        { fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount, fromAddress },
      );
      if (data.error || data.message) {
        setError(data.message || data.error || "Bridge quote failed");
        setLoading(false);
        return null;
      }
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message || "Bridge error");
      setLoading(false);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    getSwapQuote,
    getSwapPrice,
    getBridgeQuote,
    supportedChains: SUPPORTED_CHAINS,
  };
}
