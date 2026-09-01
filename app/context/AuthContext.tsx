"use client";

// app/context/AuthContext.tsx
//
// This file creates a simple "auth state" that any component in the app can read.
//
// Why does this exist?
//   The Navbar needs to know if the user is logged in (to show "Sign Out" instead of "Sign In").
//   The login page needs to save the token after a successful login.
//   Without context, you'd have to pass props through every component — that gets messy.
//
// What it stores:
//   - token: the JWT string from the backend (or null if not logged in)
//   - user:  the user object from GET /me (or null if not logged in)
//
// Where the token is saved:
//   localStorage — simple, readable, works for learning this flow.
//   Note: localStorage is accessible to JavaScript on the page. For a production app
//   with strict security requirements you'd use an httpOnly cookie instead.
//   For this project, localStorage is fine and easy to understand.
//
// How to use in a component:
//   import { useAuth } from "@/app/context/AuthContext";
//   const { user, token, login, logout, clearAuth } = useAuth();
//
// ─── 401 / Token expiry handling ──────────────────────────────────────────────
//
// When a protected API call returns HTTP 401, the lib function (cart.ts,
// checkout.ts, etc.) throws an AuthError (see app/lib/auth.ts).
//
// The page/component catches AuthError and calls clearAuth():
//
//   } catch (err) {
//     if (err instanceof AuthError) {
//       clearAuth();
//       router.push("/login");
//     } else {
//       setError(err.message);
//     }
//   }
//
// clearAuth() is identical to logout() in what it does to state and storage,
// but is semantically distinct — it means "the server rejected this session"
// rather than "the user chose to sign out". Both remove the token from
// localStorage and clear user/token state in the context.
//
// GET /me on app load:
//   If the stored token is expired, getCurrentUser() throws AuthError.
//   The loadUserFromStorage catch block removes the token and finishes loading
//   cleanly — the app starts in an unauthenticated state without any redirect.
//   Protected pages then redirect to /login themselves via their own guards.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, User, AuthError } from "@/app/lib/auth";

// ─── Shape of the context value ───────────────────────────────────────────────

type AuthContextValue = {
  // The logged-in user object (null means not logged in)
  user: User | null;

  // The JWT token string (null means not logged in)
  token: string | null;

  // True while we are loading the user from the token on page refresh
  loading: boolean;

  // Call this after a successful login — it saves the token and fetches the user
  login: (token: string) => Promise<void>;

  // Call this when the user deliberately signs out.
  // Removes the token from localStorage and clears state.
  logout: () => void;

  // Call this when the backend rejects the session (401 AuthError).
  // Functionally identical to logout() — removes the token from localStorage
  // and clears user/token state — but exists as a separate function to make
  // the intent clear: the session was invalidated by the server, not by
  // the user's choice.
  clearAuth: () => void;
};

// ─── Create the context ───────────────────────────────────────────────────────

// We start with undefined so we can detect if someone uses useAuth() outside the provider
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider component ───────────────────────────────────────────────────────

// Wrap your app (or layout) in this so all children can access auth state.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true on first load while we check localStorage

  // On first render: check localStorage for an existing token.
  // If one exists, try to fetch the current user from GET /me.
  // If the token is expired or invalid (AuthError or any other error), clear it.
  useEffect(() => {
    async function loadUserFromStorage() {
      const savedToken = localStorage.getItem("auth_token");

      if (!savedToken) {
        // No token saved — user is not logged in
        setLoading(false);
        return;
      }

      try {
        // Token exists — verify it by calling GET /me.
        // getCurrentUser() throws AuthError if the backend returns 401 (expired/invalid).
        // It throws a plain Error if there is a network failure.
        // In both cases we clear the invalid token below.
        const response = await getCurrentUser(savedToken);
        setToken(savedToken);
        setUser(response.user);
      } catch (err) {
        // Token is invalid, expired, or the server is unreachable.
        // Log the specific reason for debugging — AuthError means 401, others
        // mean network/server issues.
        if (err instanceof AuthError) {
          console.info("[AuthContext] Stored token rejected by server (401) — clearing session.");
        } else {
          console.warn("[AuthContext] Could not verify stored token:", err);
        }
        // Either way, remove the stale token so the app starts unauthenticated.
        // Do NOT setToken or setUser — leave them as null (their initial values).
        localStorage.removeItem("auth_token");
      } finally {
        // Always finish loading, regardless of success or failure.
        // This prevents a permanent loading screen.
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, []); // Empty array means this runs once when the component mounts

  // Called after a successful login.
  // Saves the token to localStorage, then fetches the user profile from GET /me.
  async function login(newToken: string) {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);

    // Fetch the user profile so we have name, email, role, etc.
    const response = await getCurrentUser(newToken);
    setUser(response.user);
  }

  // Called when the user deliberately clicks "Sign Out".
  // Removes the token from localStorage and clears state.
  function logout() {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  // Called when the backend rejects a request with HTTP 401.
  // Removes the invalid token from localStorage and clears state, so:
  //   - The Navbar shows "Sign In" instead of the user's name
  //   - Protected pages redirect to /login
  //   - No stale authenticated UI remains visible
  //
  // The calling page is responsible for redirecting to /login after
  // calling clearAuth(), typically with router.push("/login").
  function clearAuth() {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// Use this hook in any component to read auth state.
// Example: const { user, logout, clearAuth } = useAuth();
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }

  return context;
}
