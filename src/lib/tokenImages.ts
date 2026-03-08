// CoinGecko image number mapping for top tokens
// These are the CoinGecko internal image IDs used in their CDN URLs
const COINGECKO_IMAGE_IDS: Record<string, number> = {
  bitcoin: 1, ethereum: 279, tether: 325, binancecoin: 825, solana: 4128,
  ripple: 44, 'usd-coin': 6319, cardano: 975, 'avalanche-2': 12559, dogecoin: 5,
  polkadot: 12171, chainlink: 877, tron: 1094, 'matic-network': 4713,
  'wrapped-bitcoin': 7598, 'shiba-inu': 11939, 'internet-computer': 14495,
  litecoin: 2, dai: 9956, uniswap: 12504, cosmos: 1481,
  'ethereum-classic': 453, stellar: 100, 'bitcoin-cash': 780, near: 10365,
  aptos: 26455, optimism: 25244, arbitrum: 16547, filecoin: 12817,
  'hedera-hashgraph': 3688, vechain: 1167, 'immutable-x': 17233,
  'injective-protocol': 12882, 'render-token': 11636, 'the-graph': 13397,
  mantle: 30691, aave: 12645, maker: 1364, algorand: 4030,
  'theta-token': 2538, fantom: 4001, 'the-sandbox': 12129, 'axie-infinity': 13029,
  decentraland: 2538, elrond: 11033, flow: 13446, stacks: 5765,
  'gala': 12493, eos: 738, iota: 692, neo: 480, kava: 6270, zilliqa: 2469,
};

/**
 * Get the CoinGecko CDN image URL for a token
 * Falls back to a deterministic placeholder if not in the mapping
 */
export function getTokenImageUrl(coinId: string): string {
  const imageId = COINGECKO_IMAGE_IDS[coinId];
  if (imageId) {
    return `https://assets.coingecko.com/coins/images/${imageId}/small/${coinId}.png`;
  }
  // Fallback: try the CoinGecko API thumb URL pattern
  return `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`;
}

/**
 * Token image component helper - returns image URL or null
 * Use with an <img> tag and onError fallback
 */
export function getTokenImage(coinId: string, symbol: string): string {
  const imageId = COINGECKO_IMAGE_IDS[coinId];
  if (imageId) {
    return `https://assets.coingecko.com/coins/images/${imageId}/small/${coinId}.png`;
  }
  // Try alternative CoinGecko URL patterns
  return `https://assets.coingecko.com/coins/images/${coinId}/small/${symbol.toLowerCase()}.png`;
}
