import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALCHEMY_NETWORKS: Record<string, string> = {
  ethereum: 'eth-mainnet', polygon: 'polygon-mainnet', arbitrum: 'arb-mainnet',
  base: 'base-mainnet', optimism: 'opt-mainnet', solana: 'solana-mainnet',
  bnb: 'bnb-mainnet', avalanche: 'avax-mainnet',
};

const CHAIN_PLATFORM_IDS: Record<string, string> = {
  ethereum: 'ethereum', polygon: 'polygon-pos', arbitrum: 'arbitrum-one',
  base: 'base', optimism: 'optimistic-ethereum', solana: 'solana',
  bnb: 'binance-smart-chain', bsc: 'binance-smart-chain', avalanche: 'avalanche',
};

const DEXSCREENER_CHAINS: Record<string, string> = {
  ethereum: 'ethereum', polygon: 'polygon', arbitrum: 'arbitrum',
  base: 'base', optimism: 'optimism', solana: 'solana',
  bnb: 'bsc', bsc: 'bsc', avalanche: 'avalanche', fantom: 'fantom',
  cronos: 'cronos', linea: 'linea', scroll: 'scroll', zksync: 'zksync',
  mantle: 'mantle', gnosis: 'gnosis', celo: 'celo', ton: 'ton', sui: 'sui',
};

// Map a DexScreener pair into a normalized token object
function mapPair(pair: any, chain: string) {
  const pairCreatedAt = pair.pairCreatedAt ? Number(pair.pairCreatedAt) : 0;
  const ageMs = pairCreatedAt ? Date.now() - pairCreatedAt : 0;
  const ageHours = ageMs > 0 ? ageMs / 3600000 : undefined;

  return {
    symbol: pair.baseToken?.symbol || 'UNKNOWN',
    name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown',
    contractAddress: pair.baseToken?.address || '',
    pairAddress: pair.pairAddress || '',
    chain,
    price: parseFloat(pair.priceUsd) || 0,
    change24h: pair.priceChange?.h24 ?? 0,
    change1h: pair.priceChange?.h1 ?? undefined,
    change5m: pair.priceChange?.m5 ?? undefined,
    change6h: pair.priceChange?.h6 ?? undefined,
    change7d: undefined,
    volume24h: pair.volume?.h24 || 0,
    liquidity: pair.liquidity?.usd || 0,
    marketCap: pair.marketCap || pair.fdv || 0,
    fdv: pair.fdv || 0,
    txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
    buys24h: pair.txns?.h24?.buys || 0,
    sells24h: pair.txns?.h24?.sells || 0,
    makers: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0), // unique makers approximation
    dexId: pair.dexId || '',
    logo: pair.info?.imageUrl || '',
    verified: !!(pair.info?.imageUrl),
    isTrending: true,
    quoteToken: pair.quoteToken?.symbol || '',
    priceNative: pair.priceNative || '',
    ageHours,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, chain = 'ethereum', mode = 'search', limit = 50 } = await req.json();
    
    const ALCHEMY_KEY = Deno.env.get('ALCHEMY_API_KEY_1') || Deno.env.get('ALCHEMY_API_KEY_2');
    const dexChain = DEXSCREENER_CHAINS[chain] || chain;
    const platformId = CHAIN_PLATFORM_IDS[chain] || chain;
    
    let tokens: any[] = [];

    // ─── MODE: Trending / Top ───
    if (mode === 'trending' || mode === 'top') {
      console.log(`Fetching ${mode} tokens for ${chain}`);
      
      // Use DexScreener /token-boosts/top/v1 for boosted/trending tokens
      try {
        const boostRes = await fetch('https://api.dexscreener.com/token-boosts/top/v1');
        if (boostRes.ok) {
          const boostData = await boostRes.json();
          if (Array.isArray(boostData) && boostData.length > 0) {
            // Get token addresses from boosts for this chain
            const chainBoosts = boostData.filter((b: any) => b.chainId === dexChain);
            const addresses = chainBoosts.map((b: any) => b.tokenAddress).filter(Boolean).slice(0, 30);
            
            if (addresses.length > 0) {
              // Fetch full pair data for boosted tokens
              const pairPromises = addresses.slice(0, 10).map((addr: string) =>
                fetch(`https://api.dexscreener.com/latest/dex/tokens/${addr}`).then(r => r.ok ? r.json() : null).catch(() => null)
              );
              const pairResults = await Promise.all(pairPromises);
              
              const seenSymbols = new Set<string>();
              for (const result of pairResults) {
                if (result?.pairs) {
                  const chainPairs = result.pairs.filter((p: any) => p.chainId === dexChain);
                  const best = chainPairs[0] || result.pairs[0];
                  if (best) {
                    const sym = best.baseToken?.symbol?.toLowerCase();
                    if (sym && !seenSymbols.has(sym)) {
                      seenSymbols.add(sym);
                      tokens.push(mapPair(best, chain));
                    }
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.log('DexScreener boost error:', e);
      }

      // Also fetch top pairs for this chain from DexScreener search
      if (tokens.length < limit) {
        try {
          const topRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${dexChain}`);
          if (topRes.ok) {
            const topData = await topRes.json();
            if (topData.pairs) {
              const chainPairs = topData.pairs.filter((p: any) => p.chainId === dexChain);
              const seenSymbols = new Set(tokens.map(t => t.symbol.toLowerCase()));
              
              for (const pair of chainPairs.slice(0, limit)) {
                const sym = pair.baseToken?.symbol?.toLowerCase();
                if (sym && !seenSymbols.has(sym)) {
                  seenSymbols.add(sym);
                  tokens.push(mapPair(pair, chain));
                }
              }
            }
          }
        } catch (e) {
          console.log('DexScreener top search error:', e);
        }
      }

      // Fallback to CoinGecko if DexScreener returned too few
      if (tokens.length < 10) {
        try {
          const cgUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
          const cgResponse = await fetch(cgUrl);
          if (cgResponse.ok) {
            const cgData = await cgResponse.json();
            if (Array.isArray(cgData)) {
              const seenSymbols = new Set(tokens.map(t => t.symbol.toLowerCase()));
              for (const coin of cgData) {
                const sym = coin.symbol?.toUpperCase();
                if (sym && !seenSymbols.has(sym.toLowerCase())) {
                  seenSymbols.add(sym.toLowerCase());
                  tokens.push({
                    symbol: sym,
                    name: coin.name || sym,
                    contractAddress: '',
                    chain,
                    price: coin.current_price || 0,
                    change24h: coin.price_change_percentage_24h || 0,
                    change1h: coin.price_change_percentage_1h_in_currency || undefined,
                    change7d: coin.price_change_percentage_7d_in_currency || undefined,
                    volume24h: coin.total_volume || 0,
                    marketCap: coin.market_cap || 0,
                    fdv: coin.fully_diluted_valuation || 0,
                    logo: coin.image || '',
                    verified: true,
                    rank: coin.market_cap_rank,
                    coingeckoId: coin.id,
                    sparkline: coin.sparkline_in_7d?.price || [],
                    ath: coin.ath,
                    atl: coin.atl,
                    circulatingSupply: coin.circulating_supply,
                    totalSupply: coin.total_supply,
                  });
                }
              }
            }
          }
        } catch (e) {
          console.log('CoinGecko fallback error:', e);
        }
      }

      return new Response(
        JSON.stringify({ tokens: tokens.slice(0, limit), query: '', chain, mode }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── MODE: Search ───
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ tokens: [], error: 'Query too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isContractAddress = query.startsWith('0x') && query.length === 42;
    const isSolanaAddress = !query.startsWith('0x') && query.length >= 32 && query.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(query);

    if (isContractAddress || isSolanaAddress) {
      console.log(`Looking up address: ${query} on ${chain}`);
      
      try {
        const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`);
        if (dexResponse.ok) {
          const dexData = await dexResponse.json();
          if (dexData.pairs && dexData.pairs.length > 0) {
            const chainPairs = dexData.pairs.filter((p: any) => p.chainId === dexChain || chain === 'all');
            const relevantPairs = chainPairs.length > 0 ? chainPairs : dexData.pairs;
            const seenSymbols = new Set<string>();
            
            for (const pair of relevantPairs.slice(0, limit)) {
              const sym = pair.baseToken?.symbol?.toLowerCase();
              if (sym && !seenSymbols.has(sym)) {
                seenSymbols.add(sym);
                tokens.push(mapPair(pair, pair.chainId || chain));
              }
            }
          }
        }
      } catch (e) {
        console.log('DexScreener lookup error:', e);
      }

      // Alchemy fallback for EVM
      if (tokens.length === 0 && isContractAddress && ALCHEMY_KEY) {
        const network = ALCHEMY_NETWORKS[chain] || 'eth-mainnet';
        if (network !== 'solana-mainnet') {
          try {
            const metadataResponse = await fetch(`https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'alchemy_getTokenMetadata', params: [query] })
            });
            const result = await metadataResponse.json();
            if (result.result?.symbol) {
              tokens.push({
                symbol: result.result.symbol,
                name: result.result.name || result.result.symbol,
                contractAddress: query,
                decimals: result.result.decimals,
                logo: result.result.logo,
                chain, price: 0, change24h: 0, verified: true,
              });
            }
          } catch (e) {
            console.log('Alchemy metadata error:', e);
          }
        }
      }
    } else {
      // Symbol/name search
      console.log(`Searching for: ${query} on ${chain}`);
      
      try {
        const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
        if (dexResponse.ok) {
          const dexData = await dexResponse.json();
          if (dexData.pairs && dexData.pairs.length > 0) {
            const chainPairs = dexData.pairs.filter((p: any) => p.chainId === dexChain || chain === 'all');
            const relevantPairs = chainPairs.length > 0 ? chainPairs : dexData.pairs.slice(0, limit);
            const seenAddresses = new Set<string>();
            
            for (const pair of relevantPairs.slice(0, limit)) {
              const addr = pair.baseToken?.address?.toLowerCase();
              if (!addr || seenAddresses.has(addr)) continue;
              seenAddresses.add(addr);
              tokens.push(mapPair(pair, pair.chainId || chain));
            }
          }
        }
      } catch (e) {
        console.log('DexScreener search error:', e);
      }

      // CoinGecko fallback
      if (tokens.length === 0) {
        try {
          const cgResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
          if (cgResponse.ok) {
            const cgResult = await cgResponse.json();
            if (cgResult.coins?.length > 0) {
              const topCoins = cgResult.coins.slice(0, Math.min(20, limit));
              const coinIds = topCoins.map((c: any) => c.id).join(',');
              
              let priceData: Record<string, any> = {};
              try {
                const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
                if (priceResponse.ok) priceData = await priceResponse.json();
              } catch (e) {
                console.log('CoinGecko price error:', e);
              }
              
              tokens = topCoins.map((coin: any) => {
                const prices = priceData[coin.id] || {};
                return {
                  symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
                  name: coin.name || coin.symbol || 'Unknown',
                  contractAddress: '',
                  chain: 'multi',
                  price: prices.usd || 0,
                  change24h: prices.usd_24h_change || 0,
                  volume24h: prices.usd_24h_vol || 0,
                  marketCap: prices.usd_market_cap || 0,
                  logo: coin.thumb || coin.large,
                  verified: !!coin.market_cap_rank,
                  rank: coin.market_cap_rank,
                  coingeckoId: coin.id,
                };
              });
            }
          }
        } catch (e) {
          console.log('CoinGecko search error:', e);
        }
      }
    }

    console.log(`Found ${tokens.length} tokens for query: ${query} on ${chain}`);

    return new Response(
      JSON.stringify({ tokens, query, chain }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Token search error:', error);
    return new Response(
      JSON.stringify({ tokens: [], error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
