import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// ── Static CoinGecko fallback map — for coins not in cryptocurrency-icons ──────
// Extend freely; these are last-resort before the letter avatar.
const COINGECKO_MAP: Record<string, string> = {
  BTC:    "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH:    "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL:    "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNB:    "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  XRP:    "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADA:    "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  DOGE:   "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  DOT:    "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  AVAX:   "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  MATIC:  "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  POL:    "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  LINK:   "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  UNI:    "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  ATOM:   "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  LTC:    "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  ARB:    "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  NEAR:   "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
  OP:     "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  AAVE:   "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  MKR:    "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png",
  CRV:    "https://assets.coingecko.com/coins/images/12124/small/Curve.png",
  SNX:    "https://assets.coingecko.com/coins/images/3406/small/SNX.png",
  SHIB:   "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  TRX:    "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  TON:    "https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png",
  SUI:    "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  APT:    "https://assets.coingecko.com/coins/images/26455/small/aptos_round.png",
  INJ:    "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
  SEI:    "https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png",
  WIF:    "https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg",
  BONK:   "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg",
  JUP:    "https://assets.coingecko.com/coins/images/34188/small/jup.png",
  PENDLE: "https://assets.coingecko.com/coins/images/25143/small/Pendle_Logo_Normal.png",
  GMX:    "https://assets.coingecko.com/coins/images/18323/small/arbit.png",
  LDO:    "https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png",
  FIL:    "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
  HBAR:   "https://assets.coingecko.com/coins/images/3688/small/hbar.png",
  VET:    "https://assets.coingecko.com/coins/images/1167/small/VET_Token_Icon.png",
  FET:    "https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg",
  RENDER: "https://assets.coingecko.com/coins/images/11636/small/rndr.png",
  RNDR:   "https://assets.coingecko.com/coins/images/11636/small/rndr.png",
  IMX:    "https://assets.coingecko.com/coins/images/17233/small/immutableX-symbol-BLK-RGB.png",
  GRT:    "https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png",
  FTM:    "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png",
  SAND:   "https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg",
  MANA:   "https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png",
  CHZ:    "https://assets.coingecko.com/coins/images/8834/small/Chiliz.png",
  EOS:    "https://assets.coingecko.com/coins/images/738/small/eos-eos-logo.png",
  XLM:    "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
  ALGO:   "https://assets.coingecko.com/coins/images/4380/small/download.png",
  FLOW:   "https://assets.coingecko.com/coins/images/13446/small/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png",
  ICP:    "https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png",
  QNT:    "https://assets.coingecko.com/coins/images/3370/small/5ZOu7brX_400x400.jpg",
  STX:    "https://assets.coingecko.com/coins/images/2069/small/Stacks_logo_full.png",
  EGLD:   "https://assets.coingecko.com/coins/images/12335/small/egld-token-logo.png",
  XTZ:    "https://assets.coingecko.com/coins/images/976/small/Tezos-logo.png",
  THETA:  "https://assets.coingecko.com/coins/images/2538/small/theta-token-logo.png",
  ETC:    "https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png",
  XMR:    "https://assets.coingecko.com/coins/images/69/small/monero_logo.png",
  BCH:    "https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png",
  PEPE:   "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
  FLOKI:  "https://assets.coingecko.com/coins/images/16746/small/PNG_image.png",
  TIA:    "https://assets.coingecko.com/coins/images/31967/small/tia.jpg",
  PYTH:   "https://assets.coingecko.com/coins/images/31924/small/pyth.png",
  JTO:    "https://assets.coingecko.com/coins/images/33397/small/jto.png",
  W:      "https://assets.coingecko.com/coins/images/35471/small/wormhole.png",
  ZRO:    "https://assets.coingecko.com/coins/images/28206/small/layerzero.jpeg",
  STRK:   "https://assets.coingecko.com/coins/images/26433/small/starknet.png",
  BRETT:  "https://assets.coingecko.com/coins/images/35529/small/Brett.png",
  POPCAT: "https://assets.coingecko.com/coins/images/39391/small/Popcat.jpg",
};

// ── Build an ordered list of CDN URLs to attempt for a given symbol ────────────
function buildSrcList(symbol: string, imageProp?: string): string[] {
  const sym = symbol?.toUpperCase() || "";
  const symLower = sym.toLowerCase();
  const list: string[] = [];

  // 1. Passed-in image from API (CoinGecko /coins/markets — most accurate)
  if (imageProp) list.push(imageProp);

  // 2. cryptocurrency-icons on jsDelivr CDN — 500+ coins by lowercase symbol
  //    https://github.com/spothq/cryptocurrency-icons
  list.push(`https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/128/color/${symLower}.png`);

  // 3. LiveCoinWatch CDN — additional coverage
  list.push(`https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/32/${symLower}.png`);

  // 4. CoinGecko static map — our hardcoded extended list
  if (COINGECKO_MAP[sym]) list.push(COINGECKO_MAP[sym]);

  return list;
}

// ── Deterministic letter-avatar colors ────────────────────────────────────────
const AVATAR_COLORS = [
  "#f7931a","#627eea","#9945ff","#f3ba2f","#346aa9",
  "#0033ad","#c2a633","#e84142","#2775ca","#26a17b",
  "#e84142","#16213e","#0f3460","#533483","#e94560",
];

interface CoinImageProps {
  symbol: string;
  image?: string;   // API-provided URL (highest priority)
  size?: number;    // diameter in px, default 28
  className?: string;
  showFallback?: boolean;
}

/**
 * CoinImage — resolves coin logos from multiple CDN sources in sequence.
 *
 * Resolution order:
 *   1. image prop   (CoinGecko /coins/markets API — covers top 1000)
 *   2. cryptocurrency-icons CDN (jsDelivr — 500+ coins by symbol)
 *   3. LiveCoinWatch CDN        (additional coverage)
 *   4. COINGECKO_MAP static     (hardcoded ~70 coins)
 *   5. Letter avatar            (never fails)
 */
export function CoinImage({ symbol, image, size = 28, className, showFallback = true }: CoinImageProps) {
  const srcList = useMemo(() => buildSrcList(symbol, image), [symbol, image]);
  const [srcIndex, setSrcIndex] = useState(0);

  const currentSrc = srcList[srcIndex] || "";

  if (!currentSrc) {
    return showFallback ? <LetterAvatar symbol={symbol} size={size} className={className} /> : null;
  }

  return (
    <img
      src={currentSrc}
      alt={`${symbol} cryptocurrency logo`}
      width={size}
      height={size}
      className={cn("rounded-full object-cover shrink-0", className)}
      style={{ width: size, height: size }}
      onError={() => {
        if (srcIndex + 1 < srcList.length) {
          setSrcIndex(i => i + 1); // try next source
        } else {
          setSrcIndex(srcList.length); // trigger letter avatar
        }
      }}
      loading="lazy"
    />
  );
}

function LetterAvatar({ symbol, size, className }: { symbol: string; size: number; className?: string }) {
  const color = AVATAR_COLORS[(symbol?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
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
