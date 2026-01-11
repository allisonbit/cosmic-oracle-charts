import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FundingRate {
  asset: string;
  symbol: string;
  binance: number;
  bybit: number;
  okx: number;
  avg: number;
}

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB'];
const SYMBOL_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
  XRP: '✕',
  BNB: '◆'
};

async function fetchBinanceFundingRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex');
    if (!response.ok) throw new Error('Binance API error');
    
    const data = await response.json();
    const rates: Record<string, number> = {};
    
    for (const item of data) {
      const symbol = item.symbol.replace('USDT', '');
      if (SYMBOLS.includes(symbol)) {
        rates[symbol] = parseFloat(item.lastFundingRate);
      }
    }
    
    return rates;
  } catch (error) {
    console.error('Binance funding rates error:', error);
    return {};
  }
}

async function fetchBybitFundingRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.bybit.com/v5/market/tickers?category=linear');
    if (!response.ok) throw new Error('Bybit API error');
    
    const data = await response.json();
    const rates: Record<string, number> = {};
    
    if (data.result && data.result.list) {
      for (const item of data.result.list) {
        const symbol = item.symbol.replace('USDT', '');
        if (SYMBOLS.includes(symbol)) {
          rates[symbol] = parseFloat(item.fundingRate || '0');
        }
      }
    }
    
    return rates;
  } catch (error) {
    console.error('Bybit funding rates error:', error);
    return {};
  }
}

async function fetchOkxFundingRates(): Promise<Record<string, number>> {
  try {
    const rates: Record<string, number> = {};
    
    for (const symbol of SYMBOLS) {
      try {
        const response = await fetch(`https://www.okx.com/api/v5/public/funding-rate?instId=${symbol}-USDT-SWAP`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data[0]) {
            rates[symbol] = parseFloat(data.data[0].fundingRate || '0');
          }
        }
      } catch (e) {
        console.error(`OKX ${symbol} error:`, e);
      }
    }
    
    return rates;
  } catch (error) {
    console.error('OKX funding rates error:', error);
    return {};
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching funding rates from all exchanges...');

    // Fetch from all exchanges in parallel
    const [binanceRates, bybitRates, okxRates] = await Promise.all([
      fetchBinanceFundingRates(),
      fetchBybitFundingRates(),
      fetchOkxFundingRates()
    ]);

    console.log('Binance rates:', binanceRates);
    console.log('Bybit rates:', bybitRates);
    console.log('OKX rates:', okxRates);

    const fundingRates: FundingRate[] = SYMBOLS.map(asset => {
      const binance = binanceRates[asset] || 0;
      const bybit = bybitRates[asset] || 0;
      const okx = okxRates[asset] || 0;
      
      // Calculate average only from non-zero values
      const nonZeroRates = [binance, bybit, okx].filter(r => r !== 0);
      const avg = nonZeroRates.length > 0 
        ? nonZeroRates.reduce((a, b) => a + b, 0) / nonZeroRates.length 
        : 0;

      return {
        asset,
        symbol: SYMBOL_ICONS[asset] || asset[0],
        binance,
        bybit,
        okx,
        avg
      };
    });

    return new Response(JSON.stringify({
      fundingRates,
      timestamp: new Date().toISOString(),
      sources: {
        binance: Object.keys(binanceRates).length > 0,
        bybit: Object.keys(bybitRates).length > 0,
        okx: Object.keys(okxRates).length > 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Funding rates error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      fundingRates: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
