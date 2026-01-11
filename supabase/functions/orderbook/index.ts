import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pair = url.searchParams.get('pair') || 'BTCUSDT';
    const exchange = url.searchParams.get('exchange') || 'binance';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    console.log(`Fetching orderbook for ${pair} from ${exchange}`);

    let bids: OrderBookLevel[] = [];
    let asks: OrderBookLevel[] = [];
    let spread = 0;
    let totalDepth = 0;

    if (exchange === 'binance') {
      const response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${pair}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      const data = await response.json();
      
      let bidTotal = 0;
      bids = data.bids.slice(0, limit).map((bid: string[]) => {
        const price = parseFloat(bid[0]);
        const amount = parseFloat(bid[1]);
        bidTotal += amount;
        return { price, amount, total: bidTotal };
      });

      let askTotal = 0;
      asks = data.asks.slice(0, limit).map((ask: string[]) => {
        const price = parseFloat(ask[0]);
        const amount = parseFloat(ask[1]);
        askTotal += amount;
        return { price, amount, total: askTotal };
      });

      if (bids.length > 0 && asks.length > 0) {
        spread = asks[0].price - bids[0].price;
      }

      const bidDepth = bids.reduce((sum, b) => sum + b.price * b.amount, 0);
      const askDepth = asks.reduce((sum, a) => sum + a.price * a.amount, 0);
      totalDepth = bidDepth + askDepth;
    } else if (exchange === 'kraken') {
      // Kraken uses different symbol format
      const krakenPair = pair.replace('USDT', 'USD').replace('BTC', 'XBT');
      const response = await fetch(
        `https://api.kraken.com/0/public/Depth?pair=${krakenPair}&count=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Kraken API error: ${response.status}`);
      }

      const data = await response.json();
      const pairKey = Object.keys(data.result)[0];
      
      if (pairKey && data.result[pairKey]) {
        let bidTotal = 0;
        bids = data.result[pairKey].bids.slice(0, limit).map((bid: string[]) => {
          const price = parseFloat(bid[0]);
          const amount = parseFloat(bid[1]);
          bidTotal += amount;
          return { price, amount, total: bidTotal };
        });

        let askTotal = 0;
        asks = data.result[pairKey].asks.slice(0, limit).map((ask: string[]) => {
          const price = parseFloat(ask[0]);
          const amount = parseFloat(ask[1]);
          askTotal += amount;
          return { price, amount, total: askTotal };
        });

        if (bids.length > 0 && asks.length > 0) {
          spread = asks[0].price - bids[0].price;
        }

        const bidDepth = bids.reduce((sum, b) => sum + b.price * b.amount, 0);
        const askDepth = asks.reduce((sum, a) => sum + a.price * a.amount, 0);
        totalDepth = bidDepth + askDepth;
      }
    } else {
      // Coinbase
      const cbPair = pair.replace('USDT', '-USD').replace('BTC', 'BTC').replace('ETH', 'ETH').replace('SOL', 'SOL').replace('XRP', 'XRP');
      const formattedPair = cbPair.includes('-') ? cbPair : `${cbPair.slice(0, 3)}-USD`;
      
      const response = await fetch(
        `https://api.exchange.coinbase.com/products/${formattedPair}/book?level=2`
      );
      
      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      
      let bidTotal = 0;
      bids = data.bids.slice(0, limit).map((bid: string[]) => {
        const price = parseFloat(bid[0]);
        const amount = parseFloat(bid[1]);
        bidTotal += amount;
        return { price, amount, total: bidTotal };
      });

      let askTotal = 0;
      asks = data.asks.slice(0, limit).map((ask: string[]) => {
        const price = parseFloat(ask[0]);
        const amount = parseFloat(ask[1]);
        askTotal += amount;
        return { price, amount, total: askTotal };
      });

      if (bids.length > 0 && asks.length > 0) {
        spread = asks[0].price - bids[0].price;
      }

      const bidDepth = bids.reduce((sum, b) => sum + b.price * b.amount, 0);
      const askDepth = asks.reduce((sum, a) => sum + a.price * a.amount, 0);
      totalDepth = bidDepth + askDepth;
    }

    const bidDepth = bids.reduce((sum, b) => sum + b.price * b.amount, 0);
    const askDepth = asks.reduce((sum, a) => sum + a.price * a.amount, 0);
    const imbalance = totalDepth > 0 ? ((bidDepth - askDepth) / totalDepth) * 100 : 0;

    return new Response(JSON.stringify({
      bids,
      asks,
      spread,
      totalDepth,
      imbalance,
      exchange,
      pair,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Orderbook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      bids: [],
      asks: [],
      spread: 0,
      totalDepth: 0,
      imbalance: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
