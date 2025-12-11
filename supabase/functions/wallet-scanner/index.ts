import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  pumpPotential: "high" | "medium" | "low";
  riskLevel: "low" | "medium" | "high" | "extreme";
  recommendation: "hold" | "accumulate" | "take_profit" | "exit";
  insight: string;
  contractAddress: string;
}

// Network configurations for Alchemy
const ALCHEMY_NETWORKS: Record<string, string> = {
  ethereum: 'eth-mainnet',
  polygon: 'polygon-mainnet',
  arbitrum: 'arb-mainnet',
  optimism: 'opt-mainnet',
  base: 'base-mainnet',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scanning wallet: ${address}`);

    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY_1') || Deno.env.get('ALCHEMY_API_KEY_2');
    
    if (!alchemyApiKey) {
      throw new Error('Alchemy API key not configured');
    }

    // Detect if it's a Solana address
    const isSolana = address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/) && !address.startsWith('0x');
    
    let holdings: TokenHolding[] = [];
    let nativeBalance = 0;
    let nativePrice = 0;
    let nativeChange24h = 0;

    if (isSolana) {
      // For Solana, we'll use a different approach
      // Note: Alchemy supports Solana but with different endpoints
      const solanaUrl = `https://solana-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
      
      // Get SOL balance
      const balanceResponse = await fetch(solanaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
      });
      
      const balanceData = await balanceResponse.json();
      nativeBalance = (balanceData.result?.value || 0) / 1e9; // Convert lamports to SOL
      
      // Get SOL price from CoinGecko
      const priceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true'
      );
      const priceData = await priceResponse.json();
      nativePrice = priceData.solana?.usd || 0;
      nativeChange24h = priceData.solana?.usd_24h_change || 0;

      if (nativeBalance > 0) {
        holdings.push({
          symbol: 'SOL',
          name: 'Solana',
          balance: nativeBalance,
          value: nativeBalance * nativePrice,
          price: nativePrice,
          change24h: nativeChange24h,
          pumpPotential: nativeChange24h > 5 ? 'high' : nativeChange24h > 0 ? 'medium' : 'low',
          riskLevel: 'medium',
          recommendation: nativeChange24h > 10 ? 'take_profit' : nativeChange24h > 0 ? 'hold' : 'accumulate',
          insight: `SOL is ${nativeChange24h >= 0 ? 'up' : 'down'} ${Math.abs(nativeChange24h).toFixed(2)}% in 24h. ${nativeChange24h > 5 ? 'Strong momentum, consider taking partial profits.' : nativeChange24h < -5 ? 'Dip opportunity for accumulation.' : 'Stable performance, hold position.'}`,
          contractAddress: 'native'
        });
      }

      // Get SPL token balances
      const tokenResponse = await fetch(solanaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            address,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
          ]
        })
      });

      const tokenData = await tokenResponse.json();
      const tokenAccounts = tokenData.result?.value || [];

      console.log(`Found ${tokenAccounts.length} SPL token accounts`);

      // Process SPL tokens (limit to first 20 with balance)
      const tokensWithBalance = tokenAccounts
        .filter((acc: any) => {
          const amount = acc.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
          return amount > 0;
        })
        .slice(0, 20);

      for (const acc of tokensWithBalance) {
        const info = acc.account?.data?.parsed?.info;
        const mint = info?.mint;
        const amount = info?.tokenAmount?.uiAmount || 0;

        if (amount > 0 && mint) {
          holdings.push({
            symbol: mint.slice(0, 6).toUpperCase(),
            name: `SPL Token`,
            balance: amount,
            value: 0, // Would need additional API call for price
            price: 0,
            change24h: 0,
            pumpPotential: 'medium',
            riskLevel: 'high',
            recommendation: 'hold',
            insight: 'SPL token detected. Research this token before making decisions.',
            contractAddress: mint
          });
        }
      }

    } else {
      // EVM address - scan across multiple networks
      const networksToScan = ['ethereum', 'polygon', 'arbitrum', 'base'];
      
      // Get ETH price first
      const priceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,arbitrum,usd-coin&vs_currencies=usd&include_24hr_change=true'
      );
      const priceData = await priceResponse.json();
      
      for (const network of networksToScan) {
        const alchemyNetwork = ALCHEMY_NETWORKS[network];
        const alchemyUrl = `https://${alchemyNetwork}.g.alchemy.com/v2/${alchemyApiKey}`;

        try {
          // Get native balance
          const balanceResponse = await fetch(alchemyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_getBalance',
              params: [address, 'latest']
            })
          });

          const balanceData = await balanceResponse.json();
          const nativeBalanceWei = parseInt(balanceData.result || '0', 16);
          const nativeBalanceEth = nativeBalanceWei / 1e18;

          if (nativeBalanceEth > 0.0001) {
            const nativeSymbol = network === 'polygon' ? 'MATIC' : network === 'arbitrum' ? 'ETH' : 'ETH';
            const nativeName = network === 'polygon' ? 'Polygon' : network === 'arbitrum' ? 'Ethereum (Arbitrum)' : network === 'base' ? 'Ethereum (Base)' : 'Ethereum';
            const priceKey = network === 'polygon' ? 'matic-network' : 'ethereum';
            const nPrice = priceData[priceKey]?.usd || 0;
            const nChange = priceData[priceKey]?.usd_24h_change || 0;

            // Check if we already have this native token
            const existingIndex = holdings.findIndex(h => h.symbol === nativeSymbol && h.contractAddress === 'native');
            if (existingIndex === -1) {
              holdings.push({
                symbol: nativeSymbol,
                name: nativeName,
                balance: nativeBalanceEth,
                value: nativeBalanceEth * nPrice,
                price: nPrice,
                change24h: nChange,
                pumpPotential: nChange > 5 ? 'high' : nChange > 0 ? 'medium' : 'low',
                riskLevel: 'low',
                recommendation: nChange > 10 ? 'take_profit' : nChange > 0 ? 'hold' : 'accumulate',
                insight: `${nativeName} on ${network}. ${nChange >= 0 ? 'Positive' : 'Negative'} momentum with ${Math.abs(nChange).toFixed(2)}% 24h change.`,
                contractAddress: 'native'
              });
            }
          }

          // Get ERC20 token balances
          const tokenResponse = await fetch(alchemyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'alchemy_getTokenBalances',
              params: [address]
            })
          });

          const tokenData = await tokenResponse.json();
          const tokenBalances: TokenBalance[] = tokenData.result?.tokenBalances || [];

          console.log(`Found ${tokenBalances.length} tokens on ${network}`);

          // Filter tokens with non-zero balance and get metadata
          const nonZeroTokens = tokenBalances
            .filter((t: TokenBalance) => t.tokenBalance && t.tokenBalance !== '0x0' && t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000')
            .slice(0, 15); // Limit per network

          for (const token of nonZeroTokens) {
            try {
              // Get token metadata
              const metadataResponse = await fetch(alchemyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: 1,
                  method: 'alchemy_getTokenMetadata',
                  params: [token.contractAddress]
                })
              });

              const metadataData = await metadataResponse.json();
              const metadata: TokenMetadata = metadataData.result;

              if (metadata && metadata.symbol) {
                const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.decimals || 18);

                if (balance > 0) {
                  // Try to get price from Alchemy
                  let tokenPrice = 0;
                  let tokenChange = 0;

                  try {
                    const priceUrl = `https://api.g.alchemy.com/prices/v1/${alchemyApiKey}/tokens/by-address`;
                    const priceResp = await fetch(priceUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        addresses: [{
                          network: alchemyNetwork,
                          address: token.contractAddress
                        }]
                      })
                    });
                    const priceResult = await priceResp.json();
                    const priceInfo = priceResult.data?.[0]?.prices?.[0];
                    if (priceInfo) {
                      tokenPrice = parseFloat(priceInfo.value) || 0;
                      tokenChange = parseFloat(priceInfo.lastDayChange) * 100 || 0;
                    }
                  } catch (e) {
                    console.log(`Could not get price for ${metadata.symbol}`);
                  }

                  const tokenValue = balance * tokenPrice;

                  // Skip dust (less than $1 value unless we couldn't get price)
                  if (tokenValue < 1 && tokenPrice > 0) continue;

                  // Determine pump potential and risk based on metrics
                  let pumpPotential: "high" | "medium" | "low" = 'medium';
                  let riskLevel: "low" | "medium" | "high" | "extreme" = 'medium';
                  let recommendation: "hold" | "accumulate" | "take_profit" | "exit" = 'hold';

                  // Stablecoins
                  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
                  if (stablecoins.includes(metadata.symbol.toUpperCase())) {
                    pumpPotential = 'low';
                    riskLevel = 'low';
                    recommendation = 'hold';
                  } else {
                    // Risk based on change
                    if (Math.abs(tokenChange) > 20) riskLevel = 'high';
                    if (Math.abs(tokenChange) > 50) riskLevel = 'extreme';

                    // Pump potential based on positive momentum
                    if (tokenChange > 10) pumpPotential = 'high';
                    else if (tokenChange < -5) pumpPotential = 'low';

                    // Recommendation based on change
                    if (tokenChange > 20) recommendation = 'take_profit';
                    else if (tokenChange < -10) recommendation = 'accumulate';
                  }

                  holdings.push({
                    symbol: metadata.symbol,
                    name: metadata.name || metadata.symbol,
                    balance,
                    value: tokenValue,
                    price: tokenPrice,
                    change24h: tokenChange,
                    pumpPotential,
                    riskLevel,
                    recommendation,
                    insight: generateTokenInsight(metadata.symbol, tokenChange, riskLevel, pumpPotential),
                    contractAddress: token.contractAddress
                  });
                }
              }
            } catch (tokenError) {
              console.error(`Error processing token ${token.contractAddress}:`, tokenError);
            }
          }
        } catch (networkError) {
          console.error(`Error scanning ${network}:`, networkError);
        }
      }
    }

    // Sort by value descending
    holdings.sort((a, b) => b.value - a.value);

    // Calculate portfolio metrics
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    
    // Risk score based on holdings risk levels
    const riskWeights = { low: 20, medium: 50, high: 75, extreme: 100 };
    const avgRisk = holdings.length > 0
      ? holdings.reduce((sum, h) => sum + (riskWeights[h.riskLevel] * h.value), 0) / Math.max(totalValue, 1)
      : 50;
    const riskScore = Math.round(avgRisk);

    // Diversification score based on number of holdings and distribution
    const numHoldings = holdings.length;
    const topHoldingPct = totalValue > 0 ? (holdings[0]?.value || 0) / totalValue * 100 : 0;
    const diversificationScore = Math.min(100, Math.round(
      (numHoldings * 10) + (100 - topHoldingPct)
    ));

    // Top picks - holdings with high pump potential and not extreme risk
    const topPicks = holdings
      .filter(h => h.pumpPotential === 'high' && h.riskLevel !== 'extreme')
      .slice(0, 3)
      .map(h => h.symbol);

    // Warnings
    const warnings: string[] = [];
    if (topHoldingPct > 50) warnings.push(`High concentration: ${holdings[0]?.symbol} is ${topHoldingPct.toFixed(0)}% of portfolio`);
    if (holdings.filter(h => h.riskLevel === 'extreme').length > 0) warnings.push('Contains extreme risk assets');
    if (holdings.filter(h => h.riskLevel === 'high' || h.riskLevel === 'extreme').length > numHoldings / 2) warnings.push('Portfolio is heavily weighted toward high-risk assets');
    if (numHoldings < 3) warnings.push('Low diversification - consider adding more positions');

    // Generate overall insight
    const overallInsight = generateOverallInsight(holdings, totalValue, riskScore, diversificationScore);

    const result = {
      address,
      totalValue,
      holdings: holdings.slice(0, 50), // Limit to 50 holdings
      riskScore,
      diversificationScore,
      overallInsight,
      topPicks: topPicks.length > 0 ? topPicks : holdings.slice(0, 2).map(h => h.symbol),
      warnings
    };

    console.log(`Wallet scan complete. Total value: $${totalValue.toFixed(2)}, Holdings: ${holdings.length}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Wallet scanner error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scan wallet';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateTokenInsight(symbol: string, change24h: number, riskLevel: string, pumpPotential: string): string {
  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
  
  if (stablecoins.includes(symbol.toUpperCase())) {
    return 'Stablecoin holding. Good for reducing portfolio volatility and having dry powder for opportunities.';
  }

  const direction = change24h >= 0 ? 'up' : 'down';
  const absChange = Math.abs(change24h).toFixed(1);

  let insight = `${symbol} is ${direction} ${absChange}% in 24h. `;

  if (pumpPotential === 'high' && riskLevel !== 'extreme') {
    insight += 'Strong momentum detected - potential for further upside.';
  } else if (riskLevel === 'extreme') {
    insight += 'Extreme volatility - consider reducing position size.';
  } else if (pumpPotential === 'low' && change24h < -10) {
    insight += 'Showing weakness - monitor closely for support levels.';
  } else if (change24h > 15) {
    insight += 'Overbought conditions - consider taking partial profits.';
  } else if (change24h < -15) {
    insight += 'Oversold conditions - could be accumulation opportunity.';
  } else {
    insight += 'Stable performance. Hold and monitor market conditions.';
  }

  return insight;
}

function generateOverallInsight(holdings: TokenHolding[], totalValue: number, riskScore: number, diversificationScore: number): string {
  if (holdings.length === 0) {
    return 'No significant holdings detected in this wallet. Consider whether the wallet has activity on other chains not scanned.';
  }

  let insight = '';

  if (totalValue > 100000) {
    insight += 'Large portfolio detected. ';
  } else if (totalValue > 10000) {
    insight += 'Mid-size portfolio. ';
  } else if (totalValue > 1000) {
    insight += 'Growing portfolio. ';
  } else {
    insight += 'Small portfolio. ';
  }

  if (riskScore > 70) {
    insight += 'High overall risk exposure - heavy weighting toward volatile assets. Consider rebalancing with some stable positions. ';
  } else if (riskScore > 50) {
    insight += 'Moderate risk profile with a mix of stable and speculative assets. ';
  } else {
    insight += 'Conservative risk profile. Good foundation but may miss some upside opportunities. ';
  }

  if (diversificationScore > 70) {
    insight += 'Well diversified across multiple tokens.';
  } else if (diversificationScore > 40) {
    insight += 'Moderate diversification - consider spreading across more positions.';
  } else {
    insight += 'Concentrated portfolio - high exposure to single assets increases risk.';
  }

  return insight;
}
