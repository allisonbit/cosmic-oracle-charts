import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { SignInModal } from "@/components/auth/SignInModal";

// ── Auth — simple email/password via Supabase Auth ───────────────────────────
// Replaces the previous Privy wallet flow. The exported context shape is kept
// compatible with the old hook so consumer components keep working:
//   login() now opens the email/password modal (was: Privy wallet modal).
//   privyReady is kept as a name for compatibility; it simply means "session
//   state is known" (no lazy loading is needed for email/password auth).

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
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  /** Public-friendly: always true once session state is known. */
  ready: boolean;
  /** Legacy name (Privy era) — true once the session state is known. */
  privyReady: boolean;
  authenticated: boolean;
  email: string | null;
  /** Opens the email/password sign-in modal. */
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Legacy no-op (Privy era) — kept so existing call sites keep compiling. */
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

function deriveProfile(id: string, email: string | null): UserProfile {
  const name = email ? email.split("@")[0] : `User-${id.slice(-4)}`;
  return {
    id,
    display_name: name,
    avatar_url: null,
    email,
    watchlist: [],
    preferences: {},
    is_premium: true,
    email_notifications: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionKnown, setSessionKnown] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProfile = useCallback(async (uid: string, email: string | null) => {
    // Try the profiles table first; fall back to a derived profile so the UI
    // still works before/without a row (e.g. fresh project, pending triggers).
    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, email, watchlist, preferences, is_premium, email_notifications")
        .eq("id", uid)
        .maybeSingle();
      if (data) {
        setProfile({
          id: uid,
          display_name: data.display_name ?? (email ? email.split("@")[0] : null),
          avatar_url: data.avatar_url ?? null,
          email: data.email ?? email,
          watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
          preferences: (data.preferences as Record<string, unknown>) ?? {},
          is_premium: data.is_premium ?? true,
          email_notifications: data.email_notifications ?? false,
        });
        return;
      }
    } catch {
      /* table missing — derived profile below */
    }
    setProfile(deriveProfile(uid, email));
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setSessionKnown(true);
      })
      .catch(() => setSessionKnown(true));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionKnown(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user?.id ?? null;
  const uemail = session?.user?.email ?? null;

  useEffect(() => {
    if (uid) {
      fetchProfile(uid, uemail);
    } else {
      setProfile(null);
    }
  }, [uid, uemail, fetchProfile]);

  // Fire a one-time Welcome email on first sign-in (non-blocking, idempotent).
  useEffect(() => {
    if (!uid || !uemail) return;
    const key = `welcome-${uid}`;
    if (localStorage.getItem(key) === "1") return;
    supabase.functions
      .invoke("send-transactional-email", {
        body: {
          templateName: "welcome",
          recipientEmail: uemail,
          idempotencyKey: `welcome-${uid}`,
          templateData: { name: (profile?.display_name || uemail.split("@")[0]) ?? undefined },
        },
      })
      .then(() => localStorage.setItem(key, "1"))
      .catch(() => {
        // Non-blocking; localStorage won't be set, so it retries on next mount.
      });
  }, [uid, uemail, profile?.display_name]);

  const login = useCallback(() => setModalOpen(true), []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const value: AuthContextType = {
    user: uid ? { id: uid } : null,
    session,
    profile,
    loading: !sessionKnown,
    ready: sessionKnown,
    privyReady: sessionKnown,
    authenticated: !!uid,
    email: uemail,
    login,
    logout: signOut,
    getAccessToken,
    signOut,
    refreshProfile: async () => { if (uid) await fetchProfile(uid, uemail); },
    ensurePrivy: noop,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInModal open={modalOpen} onOpenChange={setModalOpen} />
    </AuthContext.Provider>
  );
}
