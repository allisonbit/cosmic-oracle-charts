import fs from 'fs';
const BASE = 'https://oraclebull.com';
const urls = [];
function add(path, freq, pri) { urls.push({path, freq, pri}); }

// Static routes
[
  ['/', 'daily', 1.0], ['/dashboard', 'hourly', 0.9], ['/predictions', 'daily', 0.9],
  ['/sentiment', 'hourly', 0.9], ['/crypto-strength-meter', 'hourly', 0.8],
  ['/scanner', 'daily', 0.8], ['/explorer', 'daily', 0.8], ['/accuracy', 'daily', 0.7],
  ['/news', 'hourly', 0.8], ['/insights', 'daily', 0.8], ['/airdrops', 'daily', 0.8],
  ['/polymarket', 'hourly', 0.7], ['/tools', 'monthly', 0.8],
  ['/tools/profit-calculator', 'monthly', 0.7], ['/tools/dca-calculator', 'monthly', 0.7],
  ['/tools/impermanent-loss-calculator', 'monthly', 0.7],
  ['/tools/position-size-calculator', 'monthly', 0.7],
  ['/compare', 'daily', 0.8], ['/factory', 'hourly', 0.8], ['/crypto-factory', 'hourly', 0.8],
  ['/factory/events', 'hourly', 0.7], ['/factory/onchain', 'hourly', 0.7],
  ['/factory/narratives', 'daily', 0.7], ['/factory/news', 'hourly', 0.7],
  ['/learn', 'weekly', 0.7], ['/how-to-buy', 'weekly', 0.8],
  ['/liquidations/bitcoin-heatmap', 'hourly', 0.8], ['/market-recap', 'daily', 0.7],
  ['/reports', 'daily', 0.7], ['/welcome', 'monthly', 0.5], ['/launch', 'monthly', 0.5],
  ['/how-to-read-predictions', 'weekly', 0.7], ['/tutorial/interactive', 'weekly', 0.7],
  ['/api-docs', 'monthly', 0.6], ['/m', 'hourly', 0.8],
  ['/about', 'monthly', 0.5], ['/contact', 'monthly', 0.5],
  ['/privacy-policy', 'yearly', 0.3], ['/terms', 'yearly', 0.3],
  ['/cookie-policy', 'yearly', 0.3], ['/risk-disclaimer', 'yearly', 0.3],
  ['/editorial-policy', 'yearly', 0.3]
].forEach(s => add(s[0], s[1], s[2]));

// Airdrops
['linea','monad','berachain','scroll','hyperliquid','zksync','megaeth','base'].forEach(a =>
  add('/airdrops/'+a, 'daily', 0.7));

// Chains
['ethereum','solana','bnb','avalanche','polygon','arbitrum','base','optimism','sui','ton'].forEach(c =>
  add('/chain/'+c, 'hourly', 0.8));

// Top cryptos for price prediction pages (CoinGecko IDs)
const topCryptos = [
  'bitcoin','ethereum','solana','binancecoin','ripple','cardano','dogecoin','polkadot',
  'chainlink','avalanche-2','matic-network','shiba-inu','litecoin','uniswap','cosmos',
  'near','arbitrum','optimism','aptos','sui','pepe','floki','bonk','toncoin','tron',
  'stellar','monero','okb','hedera','filecoin','vechain','internet-computer',
  'render-token','fetch-ai','injective-protocol','kaspa','theta-token','aave',
  'maker','lido-dao','the-graph','ens','immutable-x','gala','worldcoin-wld',
  'sei-network','celestia','jupiter-exchange-solana','jito-governance-token',
  'pyth-network','wormhole','ondo-finance','ethena','pendle','eigenlayer',
  'starknet','zksync','mantle','mantra-dao','bittensor','akash-network',
  'arweave','helium','iota','eos','neo','zilliqa','algorand','elrond-erd-2',
  'quant-network','fantom','decentraland','the-sandbox','axie-infinity',
  'enjincoin','flow-token','mina-protocol','oasis-network','celo','harmony',
  'kava','thorchain','1inch','sushi','compound-governance-token','yearn-finance',
  'curve-dao-token','balancer','synthetix-network-token','rocket-pool',
  'frax-share','convex-finance','ribbon-finance','gmx','dydx',
  'pancakeswap-token','raydium','orca','marinade-staked-sol','trump','melania',
  'brett','popcat','wen-4','cat-in-a-dogs-world','solayer','grass',
  'ai16z','virtual-protocol','griffain','dogwifcoin'
];

// Price predictions: base + daily + weekly + monthly
topCryptos.forEach(c => {
  add('/price-prediction/'+c, 'daily', 0.8);
  add('/price-prediction/'+c+'/daily', 'daily', 0.8);
  add('/price-prediction/'+c+'/weekly', 'weekly', 0.7);
  add('/price-prediction/'+c+'/monthly', 'monthly', 0.7);
});

// Year predictions for top 30 coins
const top30 = topCryptos.slice(0, 30);
const years = [2026, 2027, 2028, 2030];
top30.forEach(c => {
  years.forEach(y => add('/price-prediction/'+c+'/'+y, 'monthly', 0.7));
});

// Today and Accuracy per-coin pages (top 50)
topCryptos.slice(0, 50).forEach(c => {
  add('/today/'+c, 'daily', 0.6);
  add('/accuracy/'+c, 'daily', 0.6);
});

// How-to-buy for top 50
topCryptos.slice(0, 50).forEach(c => add('/how-to-buy/'+c, 'monthly', 0.6));

// Market SEO pages
[
  'best-crypto-to-buy-today','top-crypto-gainers-today','crypto-market-prediction-today',
  'which-crypto-will-go-up-today','crypto-losers-today','is-crypto-going-up-today',
  'best-crypto-to-buy-this-week','crypto-prediction-this-week','crypto-to-watch-this-week',
  'top-crypto-gainers-this-week','next-crypto-to-explode','safest-crypto-to-invest',
  'cheap-crypto-to-buy-now','undervalued-crypto-to-buy','crypto-with-most-potential',
  'best-altcoins-to-buy','top-meme-coins','best-defi-tokens','top-ai-crypto-tokens',
  'best-crypto-under-1-dollar','best-long-term-crypto','crypto-to-buy-before-bull-run',
  'best-staking-crypto','highest-apy-crypto','best-layer-2-crypto','best-gaming-crypto',
  'best-metaverse-crypto','best-privacy-coins','best-crypto-for-passive-income',
  'trending-crypto-today','crypto-bull-run-prediction','will-crypto-crash-today',
  'crypto-market-outlook','best-crypto-to-buy-2026','best-crypto-to-buy-2027',
  'crypto-with-highest-potential-2027','bitcoin-prediction-today','ethereum-prediction-today',
  'solana-prediction-today','xrp-prediction-today','will-bitcoin-reach-100k',
  'will-ethereum-reach-10k','best-crypto-for-beginners','most-undervalued-crypto',
  'crypto-to-hold-long-term','best-crypto-presale','top-100-crypto',
  'which-crypto-to-buy-right-now','best-crypto-exchange','crypto-market-cap-today',
  'bitcoin-vs-ethereum','will-solana-go-up','will-xrp-go-up','will-cardano-go-up'
].forEach(s => add('/market/'+s, 'daily', 0.7));

// Markets per-coin (top 40)
topCryptos.slice(0, 40).forEach(c => add('/markets/'+c, 'daily', 0.7));

// Learn/educational
[
  'what-is-crypto-market-sentiment','how-ai-is-used-in-crypto-market-analysis',
  'bitcoin-market-cycles-explained','risk-management-in-volatile-crypto-markets',
  'how-to-analyze-altcoins-using-market-data','technical-analysis-vs-sentiment-analysis',
  'on-chain-data-explained-for-beginners','how-market-psychology-affects-crypto-prices',
  'how-whales-influence-market-trends','understanding-liquidity-in-crypto-markets',
  'what-is-the-forex-market-and-how-does-it-work','forex-market-structure-explained',
  'currency-sentiment-analysis-explained','forex-vs-crypto-key-market-differences',
  'macroeconomic-factors-that-move-forex-markets','how-ai-forecasting-models-work-in-finance',
  'limitations-of-ai-market-predictions','indicators-vs-ai-models-whats-the-difference',
  'data-sources-used-in-market-intelligence-platforms','how-to-read-market-analytics-dashboards'
].forEach(s => add('/learn/'+s, 'weekly', 0.7));

// Compare pages (curated pairs)
[
  'bitcoin-vs-ethereum','ethereum-vs-solana','bitcoin-vs-solana','cardano-vs-solana',
  'dogecoin-vs-shiba-inu','xrp-vs-stellar','polygon-vs-arbitrum','near-vs-aptos',
  'pepe-vs-shiba-inu','render-vs-fetch-ai','bitcoin-vs-cardano','bitcoin-vs-dogecoin',
  'ethereum-vs-cardano','solana-vs-arbitrum','bitcoin-vs-litecoin','ethereum-vs-polygon',
  'solana-vs-avalanche','chainlink-vs-the-graph','cosmos-vs-polkadot','uniswap-vs-sushiswap',
  'optimism-vs-arbitrum','sui-vs-aptos','bonk-vs-floki','bitcoin-vs-xrp','ethereum-vs-bnb'
].forEach(p => add('/compare/'+p, 'daily', 0.6));

// Question pages: 50 coins x 15 patterns = 750
const qCoins = [
  'bitcoin','ethereum','solana','ripple','cardano','dogecoin','shiba-inu','pepe',
  'chainlink','polkadot','avalanche','toncoin','sui','aptos','near','arbitrum',
  'optimism','bonk','floki','kaspa','render-token','fetch-ai','litecoin','uniswap',
  'cosmos','stellar','monero','hedera','aave','bittensor','pendle','starknet',
  'trump','tron','bnb','polygon','celestia','ondo','injective','worldcoin',
  'sei','vechain','filecoin','maker','the-graph','immutable-x','gala','jupiter',
  'internet-computer','theta'
];
const qPatterns = [
  'will-{coin}-go-up-today','{coin}-price-prediction-today','is-{coin}-bullish-today',
  'should-i-buy-{coin}-today','{coin}-forecast-today','{coin}-price-prediction-this-week',
  '{coin}-weekly-forecast','is-{coin}-a-good-investment-this-month','{coin}-monthly-forecast',
  '{coin}-price-prediction-2026','{coin}-price-prediction-2027',
  'is-{coin}-a-good-investment','{coin}-buy-or-sell',
  '{coin}-technical-analysis','{coin}-whale-activity'
];
qCoins.forEach(coin => {
  qPatterns.forEach(p => {
    add('/q/'+p.replace(/{coin}/g, coin), 'daily', 0.6);
  });
});

// Predict pages (programmatic SEO): coin/target/year
const predictData = {
  bitcoin: [100000,150000,200000,500000,1000000],
  ethereum: [5000,10000,15000,25000,50000],
  solana: [250,500,1000,2000,5000],
  xrp: [1,5,10,25,100],
  bnb: [500,1000,2000,5000,10000],
  cardano: [1,2,5,10,25],
  dogecoin: [0.5,1,5,10,25],
  avalanche: [50,100,250,500,1000],
  polygon: [1,5,10,25,50],
  polkadot: [10,25,50,100,250],
  chainlink: [25,50,100,250,500],
  litecoin: [100,250,500,1000,2500],
  uniswap: [10,25,50,100,250],
  near: [10,25,50,100,250],
  sui: [5,10,25,50,100],
  aptos: [10,25,50,100,250],
  arbitrum: [2,5,10,25,50],
  optimism: [2,5,10,25,50],
  pepe: [0.00001,0.00005,0.0001,0.0005,0.001],
  'shiba-inu': [0.0001,0.0005,0.001,0.005,0.01],
  dogwifhat: [1,5,10,25,50],
  render: [5,10,25,50,100],
  injective: [25,50,100,250,500],
  kaspa: [0.5,1,5,10,25],
  aave: [250,500,1000,2500,5000],
  bittensor: [500,1000,2500,5000,10000],
  hedera: [0.25,0.5,1,5,10],
  celestia: [10,25,50,100,250],
  toncoin: [5,10,25,50,100],
  floki: [0.0001,0.0005,0.001,0.005,0.01]
};
Object.entries(predictData).forEach(([coin, targets]) => {
  targets.forEach(t => {
    years.forEach(y => {
      add('/predict/'+coin+'/'+t+'/'+y, 'daily', 0.6);
    });
  });
});

// VS pages (programmatic SEO): C(20,2) = 190
const vsCoins = [
  'bitcoin','ethereum','solana','xrp','bnb','cardano','dogecoin','avalanche',
  'polygon','polkadot','chainlink','litecoin','uniswap','near','sui','aptos',
  'arbitrum','optimism','pepe','shiba-inu'
];
for (let i=0; i<vsCoins.length; i++) {
  for (let j=i+1; j<vsCoins.length; j++) {
    add('/vs/'+vsCoins[i]+'/'+vsCoins[j], 'daily', 0.5);
  }
}

// Convert pages: 20 coins x 3 fiats = 60
const convCoins = [
  'bitcoin','ethereum','solana','xrp','bnb','cardano','dogecoin','avalanche',
  'polygon','polkadot','chainlink','litecoin','uniswap','near','sui','aptos',
  'arbitrum','optimism','pepe','shiba-inu'
];
['usd','eur','gbp'].forEach(f => {
  convCoins.forEach(c => add('/convert/'+c+'/'+f, 'daily', 0.5));
});

// Build XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
urls.forEach(u => {
  xml += '  <url><loc>'+BASE+u.path+'</loc><changefreq>'+u.freq+'</changefreq><priority>'+u.pri.toFixed(1)+'</priority></url>\n';
});
xml += '</urlset>\n';

fs.writeFileSync('public/sitemap.xml', xml);
console.log('Total URLs: ' + urls.length);
