import { useState } from "react";
import { cn } from "@/lib/utils";

// CoinGecko small image URLs for top coins — used as fallback when API image is unavailable
const COIN_IMAGE_MAP: Record<string, string> = {
  BTC:   "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH:   "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL:   "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNB:   "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  XRP:   "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADA:   "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  DOGE:  "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  DOT:   "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  AVAX:  "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  LINK:  "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  UNI:   "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  ATOM:  "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  LTC:   "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  ARB:   "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  NEAR:  "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
  OP:    "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  AAVE:  "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  MKR:   "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png",
  CRV:   "https://assets.coingecko.com/coins/images/12124/small/Curve.png",
  SNX:   "https://assets.coingecko.com/coins/images/3406/small/SNX.png",
  SHIB:  "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  TRX:   "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  TON:   "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  SUI:   "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  APT:   "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
  INJ:   "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
  SEI:   "https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png",
  WIF:   "https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg",
  BONK:  "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg",
  JUP:   "https://assets.coingecko.com/coins/images/34188/small/jup.png",
  PENDLE:"https://assets.coingecko.com/coins/images/25143/small/Pendle_Logo_Normal.png",
  GMX:   "https://assets.coingecko.com/coins/images/18323/small/arbit.png",
  LDO:   "https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png",
  FIL:   "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
  HBAR:  "https://assets.coingecko.com/coins/images/3688/small/hbar.png",
  VET:   "https://assets.coingecko.com/coins/images/1167/small/VET_Token_Icon.png",
};

interface CoinImageProps {
  symbol: string;
  image?: string;
  size?: number;          // diameter in px, default 28
  className?: string;
  showFallback?: boolean; // show letter avatar if image fails, default true
}

/**
 * CoinImage — shows the real CoinGecko coin logo.
 * Resolves in this order:
 *   1. image prop (from /coins/markets API)
 *   2. COIN_IMAGE_MAP static lookup by symbol
 *   3. Letter avatar fallback
 */
export function CoinImage({ symbol, image, size = 28, className, showFallback = true }: CoinImageProps) {
  const src = image || COIN_IMAGE_MAP[symbol?.toUpperCase()] || "";
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (!showFallback) return null;
    // Letter avatar with deterministic color
    const colors = ["#f7931a","#627eea","#9945ff","#f3ba2f","#346aa9","#0033ad","#c2a633","#e84142","#2775ca","#26a17b"];
    const color = colors[(symbol?.charCodeAt(0) || 0) % colors.length];
    return (
      <div
        className={cn("rounded-full flex items-center justify-center text-white font-bold shrink-0", className)}
        style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
        aria-label={symbol}
      >
        {symbol?.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      className={cn("rounded-full object-cover shrink-0", className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
