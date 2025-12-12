import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Alchemy network endpoints
const ALCHEMY_NETWORKS: Record<string, string> = {
  ethereum: 'eth-mainnet',
  polygon: 'polygon-mainnet',
  arbitrum: 'arb-mainnet',
  base: 'base-mainnet',
  optimism: 'opt-mainnet',
  solana: 'solana-mainnet',
  bnb: 'bnb-mainnet',
  avalanche: 'avax-mainnet',
};

// Chain platform IDs for CoinGecko filtering
const CHAIN_PLATFORM_IDS: Record<string, string> = {
  ethereum: 'ethereum',
  polygon: 'polygon-pos',
  arbitrum: 'arbitrum-one',
  base: 'base',
  optimism: 'optimistic-ethereum',
  solana: 'solana',
  bnb: 'binance-smart-chain',
  avalanche: 'avalanche',
};

// DexScreener chain identifiers
const DEXSCREENER_CHAINS: Record<string, string> = {
  ethereum: 'ethereum',
  polygon: 'polygon',
  arbitrum: 'arbitrum',
  base: 'base',
  optimism: 'optimism',
  solana: 'solana',
  bnb: 'bsc',
  avalanche: 'avalanche',
};

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

    // MODE: Get trending/top tokens for the chain
    if (mode === 'trending' || mode === 'top') {
      console.log(`Fetching ${mode} tokens for ${chain}`);
      
      // Try DexScreener for trending pairs on this chain
      try {
        const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/trending?chain=${dexChain}`);
        if (dexResponse.ok) {
          const dexData = await dexResponse.json();
          if (dexData.pairs && dexData.pairs.length > 0) {
            tokens = dexData.pairs.slice(0, limit).map((pair: any) => ({
              symbol: pair.baseToken?.symbol || 'UNKNOWN',
              name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown',
              contractAddress: pair.baseToken?.address || '',
              pairAddress: pair.pairAddress || '',
              chain: chain,
              price: parseFloat(pair.priceUsd) || 0,
              change24h: pair.priceChange?.h24 || 0,
              change1h: pair.priceChange?.h1 || 0,
              volume24h: pair.volume?.h24 || 0,
              liquidity: pair.liquidity?.usd || 0,
              marketCap: pair.fdv || pair.marketCap || 0,
              txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
              buys24h: pair.txns?.h24?.buys || 0,
              sells24h: pair.txns?.h24?.sells || 0,
              dexId: pair.dexId || '',
              logo: pair.info?.imageUrl || '',
              verified: pair.info?.imageUrl ? true : false,
              isTrending: true,
              priceChange5m: pair.priceChange?.m5 || 0,
              priceChange1h: pair.priceChange?.h1 || 0,
              priceChange6h: pair.priceChange?.h6 || 0,
            }));
          }
        }
      } catch (e) {
        console.log('DexScreener trending error:', e);
      }

      // Fallback to CoinGecko for top coins
      if (tokens.length === 0) {
        try {
          const cgUrl = platformId === 'ethereum' || platformId === 'solana' 
            ? `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`
            : `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${platformId}-ecosystem&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
          
          const cgResponse = await fetch(cgUrl);
          const cgData = await cgResponse.json();
          
          if (Array.isArray(cgData)) {
            tokens = cgData.map((coin: any) => ({
              symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
              name: coin.name || coin.symbol || 'Unknown',
              contractAddress: '',
              chain: chain,
              price: coin.current_price || 0,
              change24h: coin.price_change_percentage_24h || 0,
              change1h: coin.price_change_percentage_1h_in_currency || 0,
              change7d: coin.price_change_percentage_7d_in_currency || 0,
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
            }));
          }
        } catch (e) {
          console.log('CoinGecko markets error:', e);
        }
      }

      return new Response(
        JSON.stringify({ tokens, query: '', chain, mode }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // MODE: Search tokens
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ tokens: [], error: 'Query too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isContractAddress = query.startsWith('0x') && query.length === 42;
    const isSolanaAddress = !query.startsWith('0x') && query.length >= 32 && query.length <= 44;

    // Contract address lookup via DexScreener
    if (isContractAddress || isSolanaAddress) {
      console.log(`Looking up address: ${query} on ${chain}`);
      
      try {
        // Try DexScreener first - works for all chains
        const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`);
        if (dexResponse.ok) {
          const dexData = await dexResponse.json();
          if (dexData.pairs && dexData.pairs.length > 0) {
            // Filter to requested chain if possible
            const chainPairs = dexData.pairs.filter((p: any) => 
              p.chainId === dexChain || chain === 'all'
            );
            const relevantPairs = chainPairs.length > 0 ? chainPairs : dexData.pairs;
            
            tokens = relevantPairs.slice(0, limit).map((pair: any) => ({
              symbol: pair.baseToken?.symbol || 'UNKNOWN',
              name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown',
              contractAddress: pair.baseToken?.address || query,
              pairAddress: pair.pairAddress || '',
              chain: pair.chainId || chain,
              price: parseFloat(pair.priceUsd) || 0,
              change24h: pair.priceChange?.h24 || 0,
              change1h: pair.priceChange?.h1 || 0,
              change5m: pair.priceChange?.m5 || 0,
              volume24h: pair.volume?.h24 || 0,
              liquidity: pair.liquidity?.usd || 0,
              marketCap: pair.fdv || pair.marketCap || 0,
              txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
              buys24h: pair.txns?.h24?.buys || 0,
              sells24h: pair.txns?.h24?.sells || 0,
              dexId: pair.dexId || '',
              logo: pair.info?.imageUrl || '',
              verified: pair.info?.imageUrl ? true : false,
              quoteToken: pair.quoteToken?.symbol || '',
              priceNative: pair.priceNative || '',
            }));
          }
        }
      } catch (e) {
        console.log('DexScreener lookup error:', e);
      }

      // Fallback to Alchemy for EVM chains
      if (tokens.length === 0 && isContractAddress && ALCHEMY_KEY) {
        const network = ALCHEMY_NETWORKS[chain] || 'eth-mainnet';
        if (network !== 'solana-mainnet') {
          const baseUrl = `https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
          
          try {
            const metadataResponse = await fetch(baseUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getTokenMetadata',
                params: [query]
              })
            });

            const metadataResult = await metadataResponse.json();
            if (metadataResult.result && metadataResult.result.symbol) {
              const metadata = metadataResult.result;
              tokens.push({
                symbol: metadata.symbol,
                name: metadata.name || metadata.symbol,
                contractAddress: query,
                decimals: metadata.decimals,
                logo: metadata.logo,
                chain: chain,
                price: 0,
                change24h: 0,
                verified: true
              });
            }
          } catch (e) {
            console.log('Alchemy metadata error:', e);
          }
        }
      }
    } else {
      // Symbol/name search via DexScreener
      console.log(`Searching for: ${query} on ${chain}`);
      
      try {
        const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
        if (dexResponse.ok) {
          const dexData = await dexResponse.json();
          if (dexData.pairs && dexData.pairs.length > 0) {
            // Filter to requested chain
            const chainPairs = dexData.pairs.filter((p: any) => 
              p.chainId === dexChain || chain === 'all'
            );
            const relevantPairs = chainPairs.length > 0 ? chainPairs : dexData.pairs.slice(0, limit);
            
            // Dedupe by token address
            const seenAddresses = new Set();
            tokens = relevantPairs
              .filter((pair: any) => {
                const addr = pair.baseToken?.address?.toLowerCase();
                if (!addr || seenAddresses.has(addr)) return false;
                seenAddresses.add(addr);
                return true;
              })
              .slice(0, limit)
              .map((pair: any) => ({
                symbol: pair.baseToken?.symbol || 'UNKNOWN',
                name: pair.baseToken?.name || pair.baseToken?.symbol || 'Unknown',
                contractAddress: pair.baseToken?.address || '',
                pairAddress: pair.pairAddress || '',
                chain: pair.chainId || chain,
                price: parseFloat(pair.priceUsd) || 0,
                change24h: pair.priceChange?.h24 || 0,
                change1h: pair.priceChange?.h1 || 0,
                change5m: pair.priceChange?.m5 || 0,
                volume24h: pair.volume?.h24 || 0,
                liquidity: pair.liquidity?.usd || 0,
                marketCap: pair.fdv || pair.marketCap || 0,
                txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
                buys24h: pair.txns?.h24?.buys || 0,
                sells24h: pair.txns?.h24?.sells || 0,
                dexId: pair.dexId || '',
                logo: pair.info?.imageUrl || '',
                verified: pair.info?.imageUrl ? true : false,
                quoteToken: pair.quoteToken?.symbol || '',
              }));
          }
        }
      } catch (e) {
        console.log('DexScreener search error:', e);
      }

      // Fallback to CoinGecko
      if (tokens.length === 0) {
        try {
          const cgResponse = await fetch(
            `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
          );
          const cgResult = await cgResponse.json();
          
          if (cgResult.coins && cgResult.coins.length > 0) {
            const topCoins = cgResult.coins.slice(0, Math.min(20, limit));
            const coinIds = topCoins.map((c: any) => c.id).join(',');
            
            let priceData: Record<string, any> = {};
            try {
              const priceResponse = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
              );
              priceData = await priceResponse.json();
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
                verified: coin.market_cap_rank ? true : false,
                rank: coin.market_cap_rank,
                coingeckoId: coin.id
              };
            });
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
