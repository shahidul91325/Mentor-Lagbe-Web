"use client";

/**
 * Authentication provider for the whole app.
 *
 * - sign-up / sign-in / sign-out go through the BetterAuth client
 *   (session cookie handled by the library)
 * - right after a successful auth we call `POST /api/auth/token` to mint
 *   our own JWT, which is stored locally and attached to API requests
 * - the user object always comes from server-side session data,
 *   so the role can never be spoofed on the client
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AUTH_TOKEN_KEY, getApiUrl } from "@/lib/api";
import type { Role, User } from "@/types";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "student" | "tutor">;
}

export interface SignInInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  /** Signed-in user (from the server session), or null. */
  user: User | null;
  /** Our JWT used on protected API calls, or null. */
  token: string | null;
  /** True until the initial session lookup finishes. */
  isLoading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  plan?: string;
  phone?: string;
  bio?: string;
  createdAt?: string | Date;
}

/** Maps a BetterAuth session user onto our shared `User` type. */
function normalizeUser(raw: BetterAuthUser | undefined | null): User | null {
  if (!raw) return null;
  return {
    _id: raw.id,
    name: raw.name,
    email: raw.email,
    image: raw.image ?? undefined,
    // Role/plan only exist because the server stores them — never from input.
    role: (raw.role === "tutor" || raw.role === "admin" ? raw.role : "student"),
    plan: raw.plan === "pro" ? "pro" : "free",
    phone: raw.phone ?? "",
    bio: raw.bio ?? "",
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

/** Asks the backend to mint a JWT for the current session cookie. */
async function mintToken(): Promise<string> {
  const response = await fetch(getApiUrl("/api/auth/token"), {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not create an access token. Please sign in again.");
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Could not create an access token. Please sign in again.");
  }

  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  } catch {
    // Storage may be unavailable (private mode) — token still works in memory.
  }
  return data.token;
}

function clearToken() {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [token, setToken] = useState<string | null>(null);

  const sessionUser = normalizeUser(
    session?.user as BetterAuthUser | undefined,
  );

  // Keep the JWT in sync with the session (async so no cascading render):
  // - signed in + no token yet (first load / reload) → reuse or mint one
  // - signed out → drop the token
  useEffect(() => {
    if (isPending) return;
    let cancelled = false;

    void (async () => {
      if (!sessionUser) {
        clearToken();
        if (!cancelled) setToken(null);
        return;
      }

      const stored = (() => {
        try {
          return window.localStorage.getItem(AUTH_TOKEN_KEY);
        } catch {
          return null;
        }
      })();

      if (stored) {
        if (!cancelled) setToken(stored);
        return;
      }

      try {
        const minted = await mintToken();
        if (!cancelled) setToken(minted);
      } catch {
        if (!cancelled) setToken(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPending, sessionUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = useCallback(async (input: SignUpInput) => {
    const { error } = await authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
    });

    if (error) {
      throw new Error(error.message || "Sign up failed. Please try again.");
    }

    const minted = await mintToken();
    setToken(minted);
  }, []);

  const signIn = useCallback(async (input: SignInInput) => {
    const { error } = await authClient.signIn.email({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message || "Sign in failed. Please try again.");
    }

    const minted = await mintToken();
    setToken(minted);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await authClient.signOut();
    if (error) {
      throw new Error(error.message || "Sign out failed. Please try again.");
    }
    clearToken();
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: sessionUser,
      token,
      isLoading: isPending,
      signUp,
      signIn,
      signOut,
    }),
    [sessionUser, token, isPending, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Returns the auth context. Must be used inside `<AuthProvider>`. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
