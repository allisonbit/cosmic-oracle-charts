import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SwapQuote {
  buyAmount: string;
  buyTokenAddress: string;
  sellAmount: string;
  sellTokenAddress: string;
  price: string;
  guaranteedPrice: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
  estimatedGas: string;
  sources: { name: string; proportion: string }[];
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

export function useTrading() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSwapQuote = useCallback(async (
    chainId: number,
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    taker?: string,
  ): Promise<SwapQuote | null> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        action: "quote",
        chainId: String(chainId),
        sellToken,
        buyToken,
        sellAmount,
        ...(taker ? { taker } : {}),
      });

      const { data, error: fnError } = await supabase.functions.invoke("trading", {
        method: "GET",
        headers: {},
        body: undefined,
      });

      // Use fetch directly for GET with query params
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading?${params}`;
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to get quote");
        return null;
      }

      setLoading(false);
      return result as SwapQuote;
    } catch (e: any) {
      setError(e.message || "Quote error");
      setLoading(false);
      return null;
    }
  }, []);

  const getSwapPrice = useCallback(async (
    chainId: number,
    sellToken: string,
    buyToken: string,
    sellAmount: string,
  ) => {
    try {
      const params = new URLSearchParams({
        action: "price",
        chainId: String(chainId),
        sellToken,
        buyToken,
        sellAmount,
      });

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading?${params}`;
      const res = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const getBridgeQuote = useCallback(async (
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    fromAmount: string,
    fromAddress?: string,
  ): Promise<BridgeQuote | null> => {
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading?action=bridge-quote`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount, fromAddress }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.message || result.error || "Bridge quote failed");
        setLoading(false);
        return null;
      }

      setLoading(false);
      return result as BridgeQuote;
    } catch (e: any) {
      setError(e.message || "Bridge error");
      setLoading(false);
      return null;
    }
  }, []);

  const getBridgeChains = useCallback(async () => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading?action=bridge-chains`;
      const res = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  return {
    loading,
    error,
    getSwapQuote,
    getSwapPrice,
    getBridgeQuote,
    getBridgeChains,
    supportedChains: SUPPORTED_CHAINS,
  };
}
