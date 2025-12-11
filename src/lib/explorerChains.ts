// Comprehensive chain configuration for Token Explorer

export interface ExplorerChain {
  id: string;
  name: string;
  symbol: string;
  category: 'evm' | 'non-evm' | 'layer2' | 'appchain';
  icon: string;
  color: string;
  explorer: string;
  coingeckoId?: string;
  tokenStandard: string;
}

// EVM Chains
export const EVM_CHAINS: ExplorerChain[] = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', category: 'evm', icon: '⟠', color: '220 60% 55%', explorer: 'https://etherscan.io', coingeckoId: 'ethereum', tokenStandard: 'ERC-20' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', category: 'evm', icon: '⬡', color: '280 80% 55%', explorer: 'https://polygonscan.com', coingeckoId: 'matic-network', tokenStandard: 'ERC-20' },
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB', category: 'evm', icon: '◆', color: '38 100% 50%', explorer: 'https://bscscan.com', coingeckoId: 'binancecoin', tokenStandard: 'BEP-20' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', category: 'evm', icon: '⬢', color: '210 90% 55%', explorer: 'https://arbiscan.io', coingeckoId: 'arbitrum', tokenStandard: 'ERC-20' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP', category: 'evm', icon: '🔴', color: '0 80% 55%', explorer: 'https://optimistic.etherscan.io', coingeckoId: 'optimism', tokenStandard: 'ERC-20' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', category: 'evm', icon: '▲', color: '0 84% 60%', explorer: 'https://snowtrace.io', coingeckoId: 'avalanche-2', tokenStandard: 'ERC-20' },
  { id: 'fantom', name: 'Fantom', symbol: 'FTM', category: 'evm', icon: '👻', color: '220 100% 50%', explorer: 'https://ftmscan.com', coingeckoId: 'fantom', tokenStandard: 'ERC-20' },
  { id: 'cronos', name: 'Cronos', symbol: 'CRO', category: 'evm', icon: '🔵', color: '220 60% 45%', explorer: 'https://cronoscan.com', coingeckoId: 'crypto-com-chain', tokenStandard: 'CRC-20' },
  { id: 'base', name: 'Base', symbol: 'BASE', category: 'evm', icon: '◉', color: '220 90% 55%', explorer: 'https://basescan.org', coingeckoId: 'base', tokenStandard: 'ERC-20' },
  { id: 'linea', name: 'Linea', symbol: 'LINEA', category: 'evm', icon: '━', color: '0 0% 10%', explorer: 'https://lineascan.build', tokenStandard: 'ERC-20' },
  { id: 'scroll', name: 'Scroll', symbol: 'SCROLL', category: 'evm', icon: '📜', color: '30 80% 55%', explorer: 'https://scrollscan.com', tokenStandard: 'ERC-20' },
  { id: 'zksync', name: 'zkSync Era', symbol: 'ZK', category: 'evm', icon: '⚡', color: '260 80% 55%', explorer: 'https://explorer.zksync.io', tokenStandard: 'ERC-20' },
  { id: 'mantle', name: 'Mantle', symbol: 'MNT', category: 'evm', icon: '🟢', color: '120 60% 45%', explorer: 'https://explorer.mantle.xyz', tokenStandard: 'ERC-20' },
  { id: 'gnosis', name: 'Gnosis', symbol: 'GNO', category: 'evm', icon: '🦉', color: '160 60% 40%', explorer: 'https://gnosisscan.io', coingeckoId: 'gnosis', tokenStandard: 'ERC-20' },
  { id: 'celo', name: 'Celo', symbol: 'CELO', category: 'evm', icon: '🌿', color: '150 70% 50%', explorer: 'https://celoscan.io', coingeckoId: 'celo', tokenStandard: 'ERC-20' },
];

// Non-EVM Chains
export const NON_EVM_CHAINS: ExplorerChain[] = [
  { id: 'solana', name: 'Solana', symbol: 'SOL', category: 'non-evm', icon: '◎', color: '270 80% 60%', explorer: 'https://solscan.io', coingeckoId: 'solana', tokenStandard: 'SPL' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', category: 'non-evm', icon: '₿', color: '38 95% 55%', explorer: 'https://mempool.space', coingeckoId: 'bitcoin', tokenStandard: 'BRC-20' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', category: 'non-evm', icon: '◈', color: '220 70% 50%', explorer: 'https://cardanoscan.io', coingeckoId: 'cardano', tokenStandard: 'Native' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', category: 'non-evm', icon: '⚛', color: '280 50% 55%', explorer: 'https://mintscan.io/cosmos', coingeckoId: 'cosmos', tokenStandard: 'CW-20' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', category: 'non-evm', icon: '●', color: '330 85% 55%', explorer: 'https://polkadot.subscan.io', coingeckoId: 'polkadot', tokenStandard: 'Native' },
  { id: 'ton', name: 'TON', symbol: 'TON', category: 'non-evm', icon: '💎', color: '200 90% 50%', explorer: 'https://tonscan.org', coingeckoId: 'the-open-network', tokenStandard: 'Jetton' },
  { id: 'sui', name: 'Sui', symbol: 'SUI', category: 'non-evm', icon: '💧', color: '200 80% 55%', explorer: 'https://suiscan.xyz', coingeckoId: 'sui', tokenStandard: 'Coin' },
  { id: 'aptos', name: 'Aptos', symbol: 'APT', category: 'non-evm', icon: '🔷', color: '180 70% 50%', explorer: 'https://aptoscan.com', coingeckoId: 'aptos', tokenStandard: 'Coin' },
  { id: 'near', name: 'NEAR', symbol: 'NEAR', category: 'non-evm', icon: '◯', color: '0 0% 15%', explorer: 'https://nearblocks.io', coingeckoId: 'near', tokenStandard: 'NEP-141' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO', category: 'non-evm', icon: '▰', color: '0 0% 20%', explorer: 'https://algoexplorer.io', coingeckoId: 'algorand', tokenStandard: 'ASA' },
  { id: 'tron', name: 'Tron', symbol: 'TRX', category: 'non-evm', icon: '♦', color: '0 85% 55%', explorer: 'https://tronscan.org', coingeckoId: 'tron', tokenStandard: 'TRC-20' },
];

// Layer 2 & Rollups
export const L2_CHAINS: ExplorerChain[] = [
  { id: 'starknet', name: 'Starknet', symbol: 'STRK', category: 'layer2', icon: '⭐', color: '0 0% 15%', explorer: 'https://starkscan.co', coingeckoId: 'starknet', tokenStandard: 'ERC-20' },
  { id: 'zksync-lite', name: 'zkSync Lite', symbol: 'ZK', category: 'layer2', icon: '⚡', color: '260 80% 55%', explorer: 'https://zkscan.io', tokenStandard: 'zkSync' },
  { id: 'immutable', name: 'Immutable X', symbol: 'IMX', category: 'layer2', icon: '🛡', color: '200 70% 55%', explorer: 'https://immutascan.io', coingeckoId: 'immutable-x', tokenStandard: 'ERC-20' },
  { id: 'loopring', name: 'Loopring', symbol: 'LRC', category: 'layer2', icon: '🔄', color: '220 80% 55%', explorer: 'https://explorer.loopring.io', coingeckoId: 'loopring', tokenStandard: 'Loopring' },
  { id: 'boba', name: 'Boba', symbol: 'BOBA', category: 'layer2', icon: '🧋', color: '150 60% 50%', explorer: 'https://bobascan.com', coingeckoId: 'boba-network', tokenStandard: 'ERC-20' },
  { id: 'metis', name: 'Metis', symbol: 'METIS', category: 'layer2', icon: '🌐', color: '180 70% 45%', explorer: 'https://andromeda-explorer.metis.io', coingeckoId: 'metis-token', tokenStandard: 'ERC-20' },
];

// App Chains
export const APP_CHAINS: ExplorerChain[] = [
  { id: 'dydx', name: 'dYdX', symbol: 'DYDX', category: 'appchain', icon: '📈', color: '260 70% 55%', explorer: 'https://dydx.exchange', coingeckoId: 'dydx-chain', tokenStandard: 'Native' },
  { id: 'ronin', name: 'Ronin', symbol: 'RON', category: 'appchain', icon: '⚔', color: '220 80% 50%', explorer: 'https://explorer.roninchain.com', coingeckoId: 'ronin', tokenStandard: 'ERC-20' },
];

// All chains combined
export const ALL_CHAINS: ExplorerChain[] = [
  ...EVM_CHAINS,
  ...NON_EVM_CHAINS,
  ...L2_CHAINS,
  ...APP_CHAINS,
];

export const getChainCategories = () => ({
  evm: { name: 'EVM Chains', chains: EVM_CHAINS },
  'non-evm': { name: 'Non-EVM', chains: NON_EVM_CHAINS },
  layer2: { name: 'Layer 2/Rollups', chains: L2_CHAINS },
  appchain: { name: 'App Chains', chains: APP_CHAINS },
});

export const getChainById = (id: string): ExplorerChain | undefined => {
  return ALL_CHAINS.find(c => c.id === id);
};

export const detectChainFromAddress = (address: string): string | null => {
  // EVM addresses start with 0x and are 42 chars
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return 'ethereum'; // Default to Ethereum for EVM
  }
  // Solana addresses are base58, 32-44 chars
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return 'solana';
  }
  // Bitcoin addresses
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(address)) {
    return 'bitcoin';
  }
  // Cosmos addresses
  if (/^cosmos[a-z0-9]{39}$/.test(address)) {
    return 'cosmos';
  }
  return null;
};

export const detectInputType = (input: string): 'contract' | 'symbol' | 'name' | 'ens' => {
  const trimmed = input.trim();
  
  // ENS domains
  if (trimmed.endsWith('.eth') || trimmed.endsWith('.crypto')) {
    return 'ens';
  }
  
  // Contract addresses (various formats)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return 'contract';
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return 'contract'; // Solana
  }
  
  // Short uppercase = likely symbol
  if (/^[A-Z0-9]{2,10}$/.test(trimmed)) {
    return 'symbol';
  }
  
  return 'name';
};
