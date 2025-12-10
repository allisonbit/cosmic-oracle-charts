import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Alchemy network endpoints
const ALCHEMY_NETWORKS = {
  ethereum: 'eth-mainnet',
  polygon: 'polygon-mainnet',
  arbitrum: 'arb-mainnet',
  base: 'base-mainnet',
  optimism: 'opt-mainnet',
};

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, chain = 'ethereum' } = await req.json();
    
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ tokens: [], error: 'Query too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ALCHEMY_KEY = Deno.env.get('ALCHEMY_API_KEY_1') || Deno.env.get('ALCHEMY_API_KEY_2');
    
    if (!ALCHEMY_KEY) {
      console.error('Alchemy API key not configured');
      return new Response(
        JSON.stringify({ tokens: [], error: 'API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const network = ALCHEMY_NETWORKS[chain as keyof typeof ALCHEMY_NETWORKS] || 'eth-mainnet';
    const baseUrl = `https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
    
    const isContractAddress = query.startsWith('0x') && query.length === 42;
    
    let tokens: any[] = [];

    if (isContractAddress) {
      // Direct contract address lookup
      console.log(`Looking up contract: ${query} on ${network}`);
      
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
      console.log('Metadata result:', JSON.stringify(metadataResult));

      if (metadataResult.result && metadataResult.result.symbol) {
        const metadata = metadataResult.result;
        
        // Get token price from Alchemy
        const priceResponse = await fetch(`https://api.g.alchemy.com/prices/v1/${ALCHEMY_KEY}/tokens/by-address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addresses: [{
              network: network,
              address: query
            }]
          })
        });

        let price = 0;
        let change24h = 0;
        
        try {
          const priceResult = await priceResponse.json();
          console.log('Price result:', JSON.stringify(priceResult));
          if (priceResult.data && priceResult.data[0]?.prices?.[0]) {
            price = parseFloat(priceResult.data[0].prices[0].value) || 0;
            change24h = parseFloat(priceResult.data[0].prices[0].change24h) || 0;
          }
        } catch (e) {
          console.log('Price fetch error:', e);
        }

        tokens.push({
          symbol: metadata.symbol,
          name: metadata.name || metadata.symbol,
          contractAddress: query,
          decimals: metadata.decimals,
          logo: metadata.logo,
          chain: chain,
          price: price,
          change24h: change24h,
          verified: true
        });
      }
    } else {
      // Search by symbol/name using Alchemy asset search
      console.log(`Searching for: ${query} on ${network}`);
      
      // Use Alchemy's token API to search
      const searchUrl = `https://api.g.alchemy.com/data/v1/${ALCHEMY_KEY}/assets/search`;
      
      const searchResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          networks: [network],
          limit: 20
        })
      });

      const searchResult = await searchResponse.json();
      console.log('Search result:', JSON.stringify(searchResult).slice(0, 500));

      if (searchResult.results && searchResult.results.length > 0) {
        // Get prices for all found tokens
        const addresses = searchResult.results
          .filter((r: any) => r.address && r.address !== '0x0000000000000000000000000000000000000000')
          .map((r: any) => ({
            network: network,
            address: r.address
          }));

        let priceMap: Record<string, { price: number; change24h: number }> = {};
        
        if (addresses.length > 0) {
          try {
            const priceResponse = await fetch(`https://api.g.alchemy.com/prices/v1/${ALCHEMY_KEY}/tokens/by-address`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ addresses })
            });
            
            const priceResult = await priceResponse.json();
            if (priceResult.data) {
              priceResult.data.forEach((item: any) => {
                if (item.address && item.prices?.[0]) {
                  priceMap[item.address.toLowerCase()] = {
                    price: parseFloat(item.prices[0].value) || 0,
                    change24h: parseFloat(item.prices[0].change24h) || 0
                  };
                }
              });
            }
          } catch (e) {
            console.log('Batch price error:', e);
          }
        }

        tokens = searchResult.results.map((result: any) => {
          const priceData = priceMap[result.address?.toLowerCase()] || { price: 0, change24h: 0 };
          return {
            symbol: result.symbol || 'UNKNOWN',
            name: result.name || result.symbol || 'Unknown Token',
            contractAddress: result.address || '',
            decimals: result.decimals || 18,
            logo: result.logo,
            chain: chain,
            price: priceData.price,
            change24h: priceData.change24h,
            verified: result.verified || false
          };
        });
      }

      // If no results from asset search, try a fallback approach
      if (tokens.length === 0) {
        // Try CoinGecko as fallback for broader search
        try {
          const cgResponse = await fetch(
            `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
          );
          const cgResult = await cgResponse.json();
          
          if (cgResult.coins && cgResult.coins.length > 0) {
            tokens = cgResult.coins.slice(0, 20).map((coin: any) => ({
              symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
              name: coin.name || coin.symbol || 'Unknown',
              contractAddress: '',
              decimals: 18,
              logo: coin.thumb || coin.large,
              chain: 'multi',
              price: 0,
              change24h: 0,
              verified: coin.market_cap_rank ? true : false,
              rank: coin.market_cap_rank,
              coingeckoId: coin.id
            }));
          }
        } catch (e) {
          console.log('CoinGecko fallback error:', e);
        }
      }
    }

    console.log(`Found ${tokens.length} tokens for query: ${query}`);

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
