// PrivyLayer — the ONLY module that statically imports @privy-io/react-auth.
// It is loaded dynamically (see AuthProvider) so the heavy web3/wallet stack
// (viem, walletconnect, solana, coinbase-wallet, privy) is NOT in the initial
// bundle. It mounts PrivyProvider and bridges Privy's auth state up into our own
// AuthContext via the onState callback. It renders NO app children — the app
// tree lives outside PrivyProvider and consumes auth only through useAuth().
import { useEffect } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";

export interface PrivyBridgeState {
  ready: boolean;
  authenticated: boolean;
  user: any;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

function Bridge({ onState }: { onState: (s: PrivyBridgeState) => void }) {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  useEffect(() => {
    onState({
      ready,
      authenticated,
      user,
      login,
      logout,
      getAccessToken: getAccessToken as () => Promise<string | null>,
    });
  }, [ready, authenticated, user, login, logout, getAccessToken, onState]);
  return null;
}

export default function PrivyLayer({ onState }: { onState: (s: PrivyBridgeState) => void }) {
  const appId = (import.meta.env.VITE_PRIVY_APP_ID as string) || "cmpuydouj00l80bl1mp98d6lk";
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email"],
        appearance: { theme: "dark", accentColor: "#676FFF" },
      }}
    >
      <Bridge onState={onState} />
    </PrivyProvider>
  );
}
