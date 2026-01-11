import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhaleTransaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  asset: string;
  amount: number;
  value: number;
  from: string;
  to: string;
  hash: string;
  timestamp: number;
  chain: string;
  impact: 'high' | 'medium' | 'low';
}

// Get API key from multiple possible sources
function getAlchemyApiKey(): string {
  return Deno.env.get('ALCHEMY_API_KEY_1') || 
         Deno.env.get('ALCHEMY_API_KEY_2') || 
         Deno.env.get('ALCHEMY_API_KEY_3') ||
         '';
}

// Alchemy network endpoints
const alchemyNetworks: Record<string, string> = {
  ethereum: 'eth-mainnet',
  polygon: 'polygon-mainnet',
  arbitrum: 'arb-mainnet',
  optimism: 'opt-mainnet',
  base: 'base-mainnet',
};

// Known exchange and whale addresses
const knownAddresses: Record<string, { name: string; type: 'exchange' | 'whale' | 'defi' }> = {
  '0x28c6c06298d514db089934071355e5743bf21d60': { name: 'Binance Hot Wallet', type: 'exchange' },
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549': { name: 'Binance Cold Wallet', type: 'exchange' },
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': { name: 'Coinbase', type: 'exchange' },
  '0x503828976d22510aad0201ac7ec88293211d23da': { name: 'Coinbase 2', type: 'exchange' },
  '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503': { name: 'Binance US', type: 'exchange' },
  '0x56eddb7aa87536c09ccc2793473599fd21a8b17f': { name: 'Kraken', type: 'exchange' },
  '0x53d284357ec70ce289d6d64134dfac8e511c8a3d': { name: 'Kraken Hot', type: 'exchange' },
  '0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4': { name: 'OKX', type: 'exchange' },
  '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b': { name: 'OKX 2', type: 'exchange' },
  '0xd24400ae8bfebb18ca49be86258a3c749cf46853': { name: 'Gemini', type: 'exchange' },
  '0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0': { name: 'Gemini 2', type: 'exchange' },
  '0xba12222222228d8ba445958a75a0704d566bf2c8': { name: 'Balancer Vault', type: 'defi' },
  '0x1111111254eeb25477b68fb85ed929f73a960582': { name: '1inch Router', type: 'defi' },
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V2 Router', type: 'defi' },
  '0xe592427a0aece92de3edee1f18e0157c05861564': { name: 'Uniswap V3 Router', type: 'defi' },
};

// Token contract addresses for major tokens
const tokenContracts: Record<string, { address: string; decimals: number; symbol: string }> = {
  'USDT': { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6, symbol: 'USDT' },
  'USDC': { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6, symbol: 'USDC' },
  'WETH': { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18, symbol: 'WETH' },
  'WBTC': { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals: 8, symbol: 'WBTC' },
  'LINK': { address: '0x514910771af9ca656af840dff83e8264ecf986ca', decimals: 18, symbol: 'LINK' },
  'UNI': { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18, symbol: 'UNI' },
  'AAVE': { address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', decimals: 18, symbol: 'AAVE' },
};

// Price estimates for value calculation
const tokenPrices: Record<string, number> = {
  'ETH': 3650, 'WETH': 3650, 'USDT': 1, 'USDC': 1, 'WBTC': 97500,
  'LINK': 28, 'UNI': 16.5, 'AAVE': 280, 'DAI': 1, 'MATIC': 0.62,
  'ARB': 1.15, 'OP': 2.45,
};

async function fetchAlchemyTransfers(network: string, apiKey: string): Promise<any[]> {
  const alchemyNetwork = alchemyNetworks[network] || 'eth-mainnet';
  const url = `https://${alchemyNetwork}.g.alchemy.com/v2/${apiKey}`;
  
  try {
    // Get latest block number
    const blockResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      })
    });
    
    const blockData = await blockResponse.json();
    const latestBlock = parseInt(blockData.result, 16);
    const fromBlock = `0x${(latestBlock - 100).toString(16)}`; // Last ~100 blocks
    
    // Fetch asset transfers for known exchange addresses
    const exchangeAddresses = Object.keys(knownAddresses).slice(0, 5);
    const transfers: any[] = [];
    
    for (const address of exchangeAddresses) {
      // Fetch outgoing transfers (from exchanges = accumulation signal)
      const outResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock,
            toBlock: 'latest',
            fromAddress: address,
            category: ['external', 'erc20'],
            maxCount: '0x5',
            withMetadata: true,
          }]
        })
      });
      
      const outData = await outResponse.json();
      if (outData.result?.transfers) {
        transfers.push(...outData.result.transfers.map((t: any) => ({ ...t, direction: 'out', exchangeAddress: address })));
      }
      
      // Fetch incoming transfers (to exchanges = distribution signal)
      const inResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromBlock,
            toBlock: 'latest',
            toAddress: address,
            category: ['external', 'erc20'],
            maxCount: '0x5',
            withMetadata: true,
          }]
        })
      });
      
      const inData = await inResponse.json();
      if (inData.result?.transfers) {
        transfers.push(...inData.result.transfers.map((t: any) => ({ ...t, direction: 'in', exchangeAddress: address })));
      }
    }
    
    return transfers;
  } catch (error) {
    console.error('Error fetching Alchemy transfers:', error);
    return [];
  }
}

function processTransfers(transfers: any[], chain: string): WhaleTransaction[] {
  const whaleThreshold = 50000; // $50k minimum for whale classification
  const processed: WhaleTransaction[] = [];
  
  for (const transfer of transfers) {
    const asset = transfer.asset || 'ETH';
    const rawAmount = parseFloat(transfer.value) || 0;
    const price = tokenPrices[asset] || 1;
    const value = rawAmount * price;
    
    // Only include transfers above whale threshold
    if (value < whaleThreshold) continue;
    
    const fromExchange = knownAddresses[transfer.from?.toLowerCase()];
    const toExchange = knownAddresses[transfer.to?.toLowerCase()];
    
    let type: 'buy' | 'sell' | 'transfer';
    let impact: 'high' | 'medium' | 'low';
    
    if (fromExchange?.type === 'exchange' && !toExchange) {
      type = 'buy'; // Outflow from exchange = accumulation
    } else if (!fromExchange && toExchange?.type === 'exchange') {
      type = 'sell'; // Inflow to exchange = distribution
    } else {
      type = 'transfer';
    }
    
    if (value >= 1000000) impact = 'high';
    else if (value >= 250000) impact = 'medium';
    else impact = 'low';
    
    processed.push({
      id: transfer.hash || `whale-${Date.now()}-${Math.random()}`,
      type,
      asset,
      amount: rawAmount,
      value,
      from: fromExchange?.name || shortenAddress(transfer.from),
      to: toExchange?.name || shortenAddress(transfer.to),
      hash: transfer.hash || '',
      timestamp: transfer.metadata?.blockTimestamp ? new Date(transfer.metadata.blockTimestamp).getTime() : Date.now(),
      chain,
      impact,
    });
  }
  
  // Sort by value (largest first) and limit
  return processed.sort((a, b) => b.value - a.value).slice(0, 20);
}

function shortenAddress(address: string): string {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function calculateNetflow(transactions: WhaleTransaction[]): { netflow: number; inflow: number; outflow: number } {
  let inflow = 0;
  let outflow = 0;
  
  for (const tx of transactions) {
    if (tx.type === 'sell') {
      inflow += tx.value;
    } else if (tx.type === 'buy') {
      outflow += tx.value;
    }
  }
  
  return {
    netflow: outflow - inflow,
    inflow,
    outflow,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chain = 'ethereum' } = await req.json().catch(() => ({}));
    const apiKey = getAlchemyApiKey();
    
    if (!apiKey) {
      console.error('No Alchemy API key found');
      // Return mock data if no API key
      return new Response(JSON.stringify({
        transactions: generateMockTransactions(chain),
        netflow: 340000000,
        inflow: 1200000000,
        outflow: 1540000000,
        lastUpdated: new Date().toISOString(),
        source: 'mock'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Fetching whale data for ${chain} using Alchemy`);
    
    const transfers = await fetchAlchemyTransfers(chain, apiKey);
    const transactions = processTransfers(transfers, chain);
    const { netflow, inflow, outflow } = calculateNetflow(transactions);
    
    // If no real data, supplement with mock
    const finalTransactions = transactions.length > 0 ? transactions : generateMockTransactions(chain);
    
    return new Response(JSON.stringify({
      transactions: finalTransactions,
      netflow,
      inflow,
      outflow,
      lastUpdated: new Date().toISOString(),
      source: transactions.length > 0 ? 'alchemy' : 'mock'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in whale-tracker function:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      transactions: [],
      netflow: 0,
      inflow: 0,
      outflow: 0,
      lastUpdated: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMockTransactions(chain: string): WhaleTransaction[] {
  const assets = ['ETH', 'USDT', 'USDC', 'WBTC', 'LINK'];
  const types: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer'];
  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Gemini'];
  
  return Array.from({ length: 8 }, (_, i) => {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const price = tokenPrices[asset] || 1;
    const amount = (50000 + Math.random() * 500000) / price;
    const value = amount * price;
    
    return {
      id: `mock-${Date.now()}-${i}`,
      type,
      asset,
      amount,
      value,
      from: type === 'buy' ? exchanges[Math.floor(Math.random() * exchanges.length)] : `0x${Math.random().toString(16).slice(2, 8)}...`,
      to: type === 'sell' ? exchanges[Math.floor(Math.random() * exchanges.length)] : `0x${Math.random().toString(16).slice(2, 8)}...`,
      hash: `0x${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now() - Math.random() * 3600000,
      chain,
      impact: value >= 500000 ? 'high' : value >= 100000 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}
