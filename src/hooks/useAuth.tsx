import { createContext, useContext, useEffect, useState, useCallback, useRef, lazy, Suspense, ReactNode } from "react";
import type { PrivyBridgeState } from "@/auth/PrivyLayer";

// PrivyLayer is loaded lazily so the heavy web3/wallet stack stays out of the
// initial bundle. It only mounts once auth is actually needed (login click,
// protected route, or trade page) — public/SEO pages never download it.
const PrivyLayer = lazy(() => import("@/auth/PrivyLayer"));

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  watchlist: string[];
  preferences: Record<string, unknown>;
  is_premium: boolean;
  email_notifications: boolean;
}

interface AuthContextType {
  user: { id: string } | null;
  session: null;
  profile: UserProfile | null;
  loading: boolean;
  /** Public-friendly: true unless Privy is loading after being requested. */
  ready: boolean;
  /** True only once Privy has actually loaded & initialized (for gating private routes). */
  privyReady: boolean;
  authenticated: boolean;
  email: string | null;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Trigger Privy to load without opening the login modal (private routes). */
  ensurePrivy: () => void;
}

const noop = () => {};
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: false,
  ready: true,
  privyReady: false,
  authenticated: false,
  email: null,
  login: noop,
  logout: async () => {},
  getAccessToken: async () => null,
  signOut: async () => {},
  refreshProfile: async () => {},
  ensurePrivy: noop,
});

export function useAuth() {
  return useContext(AuthContext);
}

const EMPTY_BRIDGE: PrivyBridgeState = {
  ready: false,
  authenticated: false,
  user: null,
  login: noop,
  logout: async () => {},
  getAccessToken: async () => null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [privyRequested, setPrivyRequested] = useState(false);
  const [bridge, setBridge] = useState<PrivyBridgeState>(EMPTY_BRIDGE);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const pendingLoginRef = useRef(false);

  const ensurePrivy = useCallback(() => setPrivyRequested(true), []);

  const login = useCallback(() => {
    pendingLoginRef.current = true;
    setPrivyRequested(true);
  }, []);

  // Once the Privy bridge is ready, fire any pending login request.
  useEffect(() => {
    if (pendingLoginRef.current && bridge.ready) {
      pendingLoginRef.current = false;
      bridge.login();
    }
  }, [bridge]);

  // Derive a lightweight profile from the Privy user.
  useEffect(() => {
    if (bridge.ready && bridge.authenticated && bridge.user) {
      const pu = bridge.user;
      setProfile({
        id: pu.id,
        display_name: pu.email ? pu.email.address.split("@")[0] : `User-${String(pu.id).slice(-4)}`,
        avatar_url: null,
        email: pu.email?.address || null,
        watchlist: [],
        preferences: {},
        is_premium: true,
        email_notifications: false,
      });
    } else if (bridge.ready && !bridge.authenticated) {
      setProfile(null);
    }
  }, [bridge.ready, bridge.authenticated, bridge.user]);

  // Sync the Privy access token to the global scope for Supabase to use.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (bridge.authenticated) {
        try {
          const token = await bridge.getAccessToken();
          if (!cancelled) (globalThis as any).__privyAccessToken = token;
        } catch {
          if (!cancelled) (globalThis as any).__privyAccessToken = null;
        }
      } else {
        (globalThis as any).__privyAccessToken = null;
      }
    })();
    return () => { cancelled = true; };
  }, [bridge]);

  const privyReady = privyRequested && bridge.ready;

  const value: AuthContextType = {
    user: bridge.authenticated && bridge.user ? { id: bridge.user.id } : null,
    session: null,
    profile,
    loading: privyRequested && !bridge.ready,
    ready: !privyRequested || bridge.ready,
    privyReady,
    authenticated: bridge.authenticated,
    email: profile?.email || null,
    login,
    logout: async () => { await bridge.logout(); setProfile(null); },
    getAccessToken: bridge.getAccessToken,
    signOut: async () => { await bridge.logout(); setProfile(null); },
    refreshProfile: async () => {},
    ensurePrivy,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {privyRequested && (
        <Suspense fallback={null}>
          <PrivyLayer onState={setBridge} />
        </Suspense>
      )}
    </AuthContext.Provider>
  );
}
