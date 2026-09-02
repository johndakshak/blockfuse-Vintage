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
//   localStorage   — when the user checks "Remember Me". The token persists
//                    across browser restarts until it expires or the user logs out.
//   sessionStorage — when "Remember Me" is unchecked. The token lives only for
//                    the current browser tab/session and is gone when the tab closes.
//
//   Note: both storage APIs are accessible to JavaScript on the page. For a
//   production app with strict security requirements you'd use an httpOnly cookie
//   instead. For this project, localStorage/sessionStorage are fine.
//
//   There is always at most one active token (in one location). login() writes to
//   exactly one storage; logout/clearAuth removes from both to prevent stale tokens.
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
// localStorage and sessionStorage and clear user/token state in the context.
//
// GET /me on app load:
//   If the stored token is expired, getCurrentUser() throws AuthError.
//   The loadUserFromStorage catch block removes the token and finishes loading
//   cleanly — the app starts in an unauthenticated state without any redirect.
//   Protected pages then redirect to /login themselves via their own guards.
//
//   If the server is unreachable (network error), getCurrentUser() throws a
//   plain Error. The loadUserFromStorage catch block does NOT remove the token —
//   the user still has a valid session; the outage is transient. The app starts
//   in an unauthenticated UI state for this load, but the token is preserved for
//   when the server becomes available again.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getCurrentUser, User, AuthError } from "@/app/lib/auth";
import { getCartItems } from "@/app/lib/cart";

// ─── Shape of the context value ───────────────────────────────────────────────

type AuthContextValue = {
  // The logged-in user object (null means not logged in)
  user: User | null;

  // The JWT token string (null means not logged in)
  token: string | null;

  // True while we are loading the user from the token on page refresh
  loading: boolean;

  // Call this after a successful login — it saves the token and fetches the user.
  // Pass rememberMe=true to persist the token in localStorage (survives browser restart).
  // Pass rememberMe=false to store in sessionStorage (cleared when the tab/session closes).
  login: (token: string, rememberMe: boolean) => Promise<void>;

  // Call this when the user deliberately signs out.
  // Removes the token from both localStorage and sessionStorage, then clears state.
  logout: () => void;

  // Call this when the backend rejects the session (401 AuthError).
  // Functionally identical to logout() — removes the token from localStorage
  // and sessionStorage and clears user/token state — but exists as a separate
  // function to make the intent clear: the session was invalidated by the server,
  // not by the user's choice.
  clearAuth: () => void;

  // Call this after a successful PATCH /users/update/:id to keep the in-context
  // user object in sync with what the backend now has. Pass only the fields that
  // were actually updated — other fields are preserved from the existing user object.
  updateUser: (fields: Partial<User>) => void;

  // The total quantity of items currently in the authenticated user's cart.
  // Sum of all item.quantity values, NOT the number of distinct cart rows.
  // null  = not yet loaded / user is not logged in.
  // 0     = cart is empty (badge hidden in Navbar).
  cartCount: number | null;

  // Call this to (re-)fetch the cart count from the backend.
  // Pages that mutate the cart (add/update/remove/checkout) should call this
  // after a successful mutation so the Navbar badge stays in sync.
  refreshCartCount: () => Promise<void>;
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
  const [cartCount, setCartCount] = useState<number | null>(null);

  // On first render: check for an existing token.
  // localStorage is checked first (remembered login), then sessionStorage (session-only login).
  // At most one of these will have a token — login() always writes to exactly one location.
  // If the token is rejected by the server (AuthError / 401), remove it from both locations.
  // If there is a network/server failure, preserve the token — it may still be valid.
  useEffect(() => {
    async function loadUserFromStorage() {
      // Prefer localStorage (remembered) over sessionStorage (session-only).
      // A token is only ever written to one of them at a time.
      const savedToken =
        localStorage.getItem("auth_token") ??
        sessionStorage.getItem("auth_token");

      if (!savedToken) {
        // No token saved — user is not logged in
        setLoading(false);
        return;
      }

      try {
        // Token exists — verify it by calling GET /me.
        // getCurrentUser() throws AuthError if the backend returns 401 (expired/invalid).
        // It throws a plain Error if there is a network or server failure.
        const response = await getCurrentUser(savedToken);
        setToken(savedToken);
        setUser(response.user);
      } catch (err) {
        if (err instanceof AuthError) {
          // The server explicitly rejected the token (401) — it is invalid or expired.
          // Remove it from both storage locations so the app starts unauthenticated.
          console.info("[AuthContext] Stored token rejected by server (401) — clearing session.");
          localStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_token");
        } else {
          // Network or server error — the token has NOT been rejected.
          // A transient outage must not log the user out of a valid session.
          // Leave the token in storage; the user can retry or navigate later.
          console.warn("[AuthContext] Could not verify stored token (network/server error):", err);
        }
        // Either way, do not setToken or setUser — leave them as null so the
        // app renders in an unauthenticated state for this load attempt.
      } finally {
        // Always finish loading, regardless of success or failure.
        // This prevents a permanent loading screen.
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, []); // Empty array means this runs once when the component mounts

  // Called after a successful login.
  // rememberMe=true  → saves the token in localStorage  (persists across browser restarts)
  // rememberMe=false → saves the token in sessionStorage (cleared when the tab/session closes)
  // Always writes to exactly one location so there is never a conflict between the two.
  async function login(newToken: string, rememberMe: boolean) {
    if (rememberMe) {
      localStorage.setItem("auth_token", newToken);
    } else {
      sessionStorage.setItem("auth_token", newToken);
    }
    setToken(newToken);

    // Fetch the user profile so we have name, email, role, etc.
    const response = await getCurrentUser(newToken);
    setUser(response.user);
  }

  // ─── Cart count ─────────────────────────────────────────────────────────────
  //
  // Fetches the total cart quantity (sum of all item quantities) for the
  // authenticated user. Used by the Navbar badge.
  //
  // Failures are swallowed silently — a badge fetch error must never break the
  // Navbar or other UI. The count stays null on error (badge hidden).
  //
  // Pages that mutate the cart should call refreshCartCount() after a successful
  // mutation so the badge reflects the new state without a page reload.
  const refreshCartCount = useCallback(async () => {
    // Read storage directly so this function does not need token in its dep array.
    const storedToken =
      localStorage.getItem("auth_token") ??
      sessionStorage.getItem("auth_token");
    if (!storedToken) {
      setCartCount(null);
      return;
    }
    try {
      const res = await getCartItems(storedToken);
      // Sum all item quantities — NOT just the number of distinct cart rows.
      const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch {
      // Network error, AuthError, etc. — silently ignore.
      // Leave cartCount unchanged so the badge shows the last known value.
    }
  }, []); // stable — reads storage directly, no external deps

  // Fetch cart count whenever the user token is set (on login or page reload with
  // stored token). When token becomes null (logout / clearAuth), reset immediately.
  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refreshCartCount();
    } else {
      setCartCount(null);
    }
  }, [token, refreshCartCount]);

  // Removes the token from both storage locations (covers remembered and session-only logins)
  // and clears state.
  function logout() {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    setCartCount(null);
  }

  // Called when the backend rejects a request with HTTP 401.
  // Removes the token from both storage locations and clears state, so:
  //   - The Navbar shows "Sign In" instead of the user's name
  //   - Protected pages redirect to /login
  //   - No stale authenticated UI remains visible
  //
  // The calling page is responsible for redirecting to /login after
  // calling clearAuth(), typically with router.push("/login").
  function clearAuth() {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    setCartCount(null);
  }

  // Called after a successful PATCH /users/update/:id.
  // Merges the updated fields into the existing user object so the rest of the
  // application (Navbar greeting, admin sidebar, etc.) reflects the new values
  // without requiring a full page reload or a second GET /me request.
  function updateUser(fields: Partial<User>) {
    setUser((prev) => (prev ? { ...prev, ...fields } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, clearAuth, updateUser, cartCount, refreshCartCount }}>
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
