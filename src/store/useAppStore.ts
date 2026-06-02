import { create } from 'zustand';

export interface TradeTarget {
  symbol: string;
  name?: string;
  contractAddress?: string;
  chain?: string;
  chainId?: number;
  price?: number;
  logo?: string;
  action?: "buy" | "sell" | "swap" | "bridge";
}

interface AppState {
  // Trade Modal State
  isTradeOpen: boolean;
  tradeTarget: TradeTarget | null;
  openTrade: (target: TradeTarget) => void;
  closeTrade: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isTradeOpen: false,
  tradeTarget: null,
  openTrade: (target) => set({ isTradeOpen: true, tradeTarget: target }),
  closeTrade: () => set({ isTradeOpen: false, tradeTarget: null }),
}));
