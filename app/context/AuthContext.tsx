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
//   const { user, token, login, logout } = useAuth();

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, User } from "@/app/lib/auth";

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

  // Call this to log out — it clears the token and user from state and localStorage
  logout: () => void;
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
  // If the token is expired or invalid, clear it.
  useEffect(() => {
    async function loadUserFromStorage() {
      const savedToken = localStorage.getItem("auth_token");

      if (!savedToken) {
        // No token saved — user is not logged in
        setLoading(false);
        return;
      }

      try {
        // Token exists — verify it by calling GET /me
        const response = await getCurrentUser(savedToken);
        setToken(savedToken);
        setUser(response.user);
      } catch {
        // Token is invalid or expired — clean it up
        localStorage.removeItem("auth_token");
      } finally {
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

  // Called when the user clicks "Sign Out".
  // Removes the token from localStorage and clears state.
  function logout() {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// Use this hook in any component to read auth state.
// Example: const { user, logout } = useAuth();
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }

  return context;
}
