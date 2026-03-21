import { http, createConfig } from 'wagmi'
import { base, mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'dummy_project_id'

export const config = createConfig({
  chains: [base, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    ...(projectId !== 'dummy_project_id' ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [base.id]: http(import.meta.env.VITE_RPC_URL || 'https://mainnet.base.org'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
