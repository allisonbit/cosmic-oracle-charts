import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  asset: string;
  chain: string;
  datetime: string;
  impact: 'low' | 'medium' | 'high';
  type: 'launch' | 'upgrade' | 'fork' | 'unlock' | 'governance' | 'regulatory';
  logo?: string;
}

export interface OnChainActivity {
  id: string;
  type: 'whale_movement' | 'exchange_flow' | 'bridge_activity' | 'large_transfer';
  asset: string;
  chain: string;
  amount: number;
  amountUSD: number;
  direction: 'inflow' | 'outflow';
  from: string;
  to: string;
  timestamp: string;
  txHash: string;
}

export interface NarrativeItem {
  id: string;
  narrative: string;
  description: string;
  momentum: number;
  chains: string[];
  topAssets: string[];
  sentiment: 'bullish' | 'neutral' | 'bearish';
  weeklyChange: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  impactScore: number;
  relatedAssets: string[];
}

export interface CryptoFactoryData {
  events: MarketEvent[];
  onChainActivity: OnChainActivity[];
  narratives: NarrativeItem[];
  news: NewsItem[];
  timestamp: number;
}

const generateMockEvents = (): MarketEvent[] => {
  const events: MarketEvent[] = [
    {
      id: '1',
      title: 'Ethereum Pectra Upgrade',
      description: 'Major protocol upgrade bringing EIP-7702 account abstraction improvements',
      asset: 'ETH',
      chain: 'Ethereum',
      datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
      impact: 'high',
      type: 'upgrade',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      id: '2',
      title: 'ARB Token Unlock',
      description: '1.1B ARB tokens unlocking from investor vesting schedule',
      asset: 'ARB',
      chain: 'Arbitrum',
      datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
      impact: 'high',
      type: 'unlock',
      logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    },
    {
      id: '3',
      title: 'Uniswap V4 Launch',
      description: 'New version with hooks and singleton pool architecture',
      asset: 'UNI',
      chain: 'Ethereum',
      datetime: new Date(Date.now() + 86400000 * 14).toISOString(),
      impact: 'high',
      type: 'launch',
      logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    },
    {
      id: '4',
      title: 'Solana Firedancer Update',
      description: 'Jump Crypto validator client reaching mainnet beta',
      asset: 'SOL',
      chain: 'Solana',
      datetime: new Date(Date.now() + 86400000 * 10).toISOString(),
      impact: 'medium',
      type: 'upgrade',
      logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    },
    {
      id: '5',
      title: 'Chainlink CCIP Expansion',
      description: 'Cross-chain messaging expanding to 5 new networks',
      asset: 'LINK',
      chain: 'Multi-chain',
      datetime: new Date(Date.now() + 86400000 * 5).toISOString(),
      impact: 'medium',
      type: 'upgrade',
      logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    },
    {
      id: '6',
      title: 'Base Onchain Summer',
      description: 'Major ecosystem event with new protocol launches',
      asset: 'BASE',
      chain: 'Base',
      datetime: new Date(Date.now() + 86400000 * 2).toISOString(),
      impact: 'medium',
      type: 'launch',
      logo: 'https://cryptologos.cc/logos/base-base-logo.png',
    },
    {
      id: '7',
      title: 'MakerDAO Endgame Vote',
      description: 'Governance vote on SubDAO structure implementation',
      asset: 'MKR',
      chain: 'Ethereum',
      datetime: new Date(Date.now() + 86400000 * 4).toISOString(),
      impact: 'medium',
      type: 'governance',
      logo: 'https://cryptologos.cc/logos/maker-mkr-logo.png',
    },
    {
      id: '8',
      title: 'SEC ETF Decision',
      description: 'Deadline for multiple spot ETH ETF applications',
      asset: 'ETH',
      chain: 'Regulatory',
      datetime: new Date(Date.now() + 86400000 * 21).toISOString(),
      impact: 'high',
      type: 'regulatory',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
  ];
  return events.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
};

const generateMockOnChainActivity = (): OnChainActivity[] => {
  return [
    {
      id: '1',
      type: 'whale_movement',
      asset: 'BTC',
      chain: 'Bitcoin',
      amount: 2500,
      amountUSD: 242500000,
      direction: 'outflow',
      from: 'Binance',
      to: 'Unknown Wallet',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      txHash: '0x1234...5678',
    },
    {
      id: '2',
      type: 'exchange_flow',
      asset: 'ETH',
      chain: 'Ethereum',
      amount: 45000,
      amountUSD: 171000000,
      direction: 'inflow',
      from: 'Multiple Wallets',
      to: 'Coinbase',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      txHash: '0xabcd...efgh',
    },
    {
      id: '3',
      type: 'bridge_activity',
      asset: 'USDC',
      chain: 'Arbitrum',
      amount: 50000000,
      amountUSD: 50000000,
      direction: 'inflow',
      from: 'Ethereum Bridge',
      to: 'Arbitrum',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      txHash: '0xdef0...1234',
    },
    {
      id: '4',
      type: 'large_transfer',
      asset: 'SOL',
      chain: 'Solana',
      amount: 500000,
      amountUSD: 85000000,
      direction: 'outflow',
      from: 'FTX Estate',
      to: 'Kraken',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      txHash: '0x5678...9abc',
    },
    {
      id: '5',
      type: 'whale_movement',
      asset: 'LINK',
      chain: 'Ethereum',
      amount: 2000000,
      amountUSD: 28000000,
      direction: 'outflow',
      from: 'Binance',
      to: 'Cold Wallet',
      timestamp: new Date(Date.now() - 9000000).toISOString(),
      txHash: '0xghij...klmn',
    },
  ];
};

const generateMockNarratives = (): NarrativeItem[] => {
  return [
    {
      id: '1',
      narrative: 'AI & DePIN',
      description: 'Decentralized AI compute and physical infrastructure networks',
      momentum: 87,
      chains: ['Solana', 'Base', 'Ethereum'],
      topAssets: ['RNDR', 'TAO', 'FET', 'NEAR'],
      sentiment: 'bullish',
      weeklyChange: 24.5,
    },
    {
      id: '2',
      narrative: 'Real World Assets (RWA)',
      description: 'Tokenization of traditional financial assets',
      momentum: 78,
      chains: ['Ethereum', 'Polygon', 'Avalanche'],
      topAssets: ['ONDO', 'MKR', 'AAVE', 'COMP'],
      sentiment: 'bullish',
      weeklyChange: 15.2,
    },
    {
      id: '3',
      narrative: 'Layer 2 Scaling',
      description: 'Ethereum rollup ecosystem expansion',
      momentum: 72,
      chains: ['Arbitrum', 'Optimism', 'Base', 'zkSync'],
      topAssets: ['ARB', 'OP', 'STRK', 'MANTA'],
      sentiment: 'bullish',
      weeklyChange: 8.7,
    },
    {
      id: '4',
      narrative: 'Meme Coins',
      description: 'Community-driven tokens and culture coins',
      momentum: 65,
      chains: ['Solana', 'Base', 'Ethereum'],
      topAssets: ['DOGE', 'SHIB', 'PEPE', 'WIF'],
      sentiment: 'neutral',
      weeklyChange: -3.2,
    },
    {
      id: '5',
      narrative: 'Restaking',
      description: 'ETH restaking and liquid restaking tokens',
      momentum: 82,
      chains: ['Ethereum'],
      topAssets: ['EIGEN', 'ETHFI', 'REZ', 'PUFFER'],
      sentiment: 'bullish',
      weeklyChange: 18.9,
    },
    {
      id: '6',
      narrative: 'Gaming & Metaverse',
      description: 'Blockchain gaming and virtual worlds',
      momentum: 45,
      chains: ['Immutable', 'Polygon', 'Ronin'],
      topAssets: ['IMX', 'GALA', 'AXS', 'SAND'],
      sentiment: 'bearish',
      weeklyChange: -12.4,
    },
  ];
};

const generateMockNews = (): NewsItem[] => {
  return [
    {
      id: '1',
      title: 'BlackRock Bitcoin ETF Hits $50B AUM Milestone',
      summary: 'IBIT becomes the fastest-growing ETF in history, signaling unprecedented institutional demand for Bitcoin exposure.',
      source: 'Bloomberg',
      url: '#',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      sentiment: 'bullish',
      impactScore: 92,
      relatedAssets: ['BTC'],
    },
    {
      id: '2',
      title: 'Solana DEX Volume Surpasses Ethereum for Third Consecutive Week',
      summary: 'Raydium and Jupiter drive record trading activity on Solana, capturing over 55% of total DEX volume.',
      source: 'The Block',
      url: '#',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      sentiment: 'bullish',
      impactScore: 78,
      relatedAssets: ['SOL', 'RAY', 'JUP'],
    },
    {
      id: '3',
      title: 'European Crypto Regulations Take Effect',
      summary: 'MiCA framework now fully operational, creating clearer compliance path for EU crypto businesses.',
      source: 'CoinDesk',
      url: '#',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      sentiment: 'neutral',
      impactScore: 65,
      relatedAssets: [],
    },
    {
      id: '4',
      title: 'Major DEX Exploit Results in $12M Loss',
      summary: 'Smart contract vulnerability exploited on emerging L2 protocol, funds partially recovered.',
      source: 'Rekt News',
      url: '#',
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      sentiment: 'bearish',
      impactScore: 55,
      relatedAssets: [],
    },
    {
      id: '5',
      title: 'Coinbase Launches Institutional Staking Service',
      summary: 'New enterprise solution offers up to 5% yields on major proof-of-stake assets.',
      source: 'Decrypt',
      url: '#',
      publishedAt: new Date(Date.now() - 28800000).toISOString(),
      sentiment: 'bullish',
      impactScore: 70,
      relatedAssets: ['ETH', 'SOL', 'ATOM'],
    },
  ];
};

export function useCryptoFactory(filters?: {
  chain?: string;
  asset?: string;
  impact?: string;
  narrative?: string;
}) {
  return useQuery<CryptoFactoryData>({
    queryKey: ['crypto-factory', filters],
    queryFn: async () => {
      // In production, this would call a Supabase edge function
      // For now, generate structured mock data
      let events = generateMockEvents();
      let onChainActivity = generateMockOnChainActivity();
      let narratives = generateMockNarratives();
      let news = generateMockNews();

      // Apply filters
      if (filters?.chain) {
        events = events.filter(e => e.chain.toLowerCase().includes(filters.chain!.toLowerCase()));
        onChainActivity = onChainActivity.filter(a => a.chain.toLowerCase().includes(filters.chain!.toLowerCase()));
        narratives = narratives.filter(n => n.chains.some(c => c.toLowerCase().includes(filters.chain!.toLowerCase())));
      }

      if (filters?.asset) {
        events = events.filter(e => e.asset.toLowerCase().includes(filters.asset!.toLowerCase()));
        onChainActivity = onChainActivity.filter(a => a.asset.toLowerCase().includes(filters.asset!.toLowerCase()));
        news = news.filter(n => n.relatedAssets.some(a => a.toLowerCase().includes(filters.asset!.toLowerCase())));
      }

      if (filters?.impact) {
        events = events.filter(e => e.impact === filters.impact);
      }

      if (filters?.narrative) {
        narratives = narratives.filter(n => n.narrative.toLowerCase().includes(filters.narrative!.toLowerCase()));
      }

      return {
        events,
        onChainActivity,
        narratives,
        news,
        timestamp: Date.now(),
      };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });
}
