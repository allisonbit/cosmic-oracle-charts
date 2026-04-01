import { http, createConfig } from 'wagmi'
import { base, mainnet, sepolia } from 'wagmi/chains'

// Minimal config — no connectors that can throw during init.
// Connectors are added lazily when user actually wants to connect a wallet.
export const config = createConfig({
  chains: [base, mainnet, sepolia],
  connectors: [],
  transports: {
    [base.id]: http(import.meta.env.VITE_RPC_URL || 'https://mainnet.base.org'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
