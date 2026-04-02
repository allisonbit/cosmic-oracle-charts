import { createContext, useContext, useState, ReactNode } from "react";

interface TradeTarget {
  symbol: string;
  name?: string;
  contractAddress?: string;
  chain?: string;
  chainId?: number;
  price?: number;
  logo?: string;
  action?: "buy" | "sell" | "swap" | "bridge";
}

interface TradeContextType {
  isOpen: boolean;
  target: TradeTarget | null;
  openTrade: (target: TradeTarget) => void;
  closeTrade: () => void;
}

const TradeContext = createContext<TradeContextType>({
  isOpen: false,
  target: null,
  openTrade: () => {},
  closeTrade: () => {},
});

export function TradeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<TradeTarget | null>(null);

  const openTrade = (t: TradeTarget) => {
    setTarget(t);
    setIsOpen(true);
  };

  const closeTrade = () => {
    setIsOpen(false);
    setTarget(null);
  };

  return (
    <TradeContext.Provider value={{ isOpen, target, openTrade, closeTrade }}>
      {children}
    </TradeContext.Provider>
  );
}

export const useTrade = () => useContext(TradeContext);
