import { http, createConfig } from 'wagmi'
import { base, mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Wallet-only auth — injected connector for MetaMask, Rabby, etc.
export const config = createConfig({
  chains: [base, mainnet, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [base.id]: http(import.meta.env.VITE_RPC_URL || 'https://mainnet.base.org'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
