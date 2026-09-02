'use client'

// app/cart/page.tsx
//
// The Cart page. Displays the user's cart items fetched from the backend.
//
// Data flow:
//   CartPage (useEffect on mount)
//     ↓
//   getCartItems()  ─────────────────── cart.ts
//     ↓
//   fetch("GET /cartItems")
//     ↓
//   Backend
//     ↓
//   setCartItems() / setTotalPrice()
//     ↓
//   CartItemList + CartSummary render real data
//
// All four cart operations call the backend immediately and then
// reload the full cart from the server to stay in sync.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartItemList from "../components/cart/CartItemList";
import CartSummary from "../components/cart/CartSummary";
import Suggestions from "../components/cart/Suggestions";
import { type CartItem, toDisplayItem } from "../components/cart/cartTypes";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "@/app/lib/cart";
import { useAuth } from "@/app/context/AuthContext";
import { AuthError } from "@/app/lib/auth";

export default function CartPage() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  // We read the JWT token from the global AuthContext.
  // The token is required for every cart API call.
  const { token, loading: authLoading, clearAuth } = useAuth();
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems]   = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading]       = useState(true);   // true while fetching cart
  const [error, setError]           = useState("");     // shown when a fetch fails

  // Tracks which suggestion product IDs have an in-flight POST /cart request
  const [addingIds, setAddingIds]   = useState<Set<number>>(new Set());

  // ── Derived values ────────────────────────────────────────────────────────
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // ── Load cart from backend ─────────────────────────────────────────────────
  // loadCart() fetches the current cart from GET /cartItems and updates state.
  // It is called on mount and after every mutation (add, update, remove).
  // Keeping a single reload function means the UI is always in sync with
  // the backend — no partial state updates to track.
  async function loadCart(authToken: string) {
    setLoading(true);
    setError("");
    try {
      const response = await getCartItems(authToken);
      // Map backend CartItems to the flat display shape
      setCartItems(response.data.map(toDisplayItem));
      setTotalPrice(response.totalPrice);
    } catch (err: unknown) {
      // 401 — token expired mid-session while loading the cart.
      // Clear the session and redirect to login, the same way every other
      // protected page handles AuthError (checkout, orders, admin sections).
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }

  // On mount: wait for auth to finish loading, then either redirect to
  // /login (unauthenticated) or load the cart.
  useEffect(() => {
    // Auth context is still initialising — wait
    if (authLoading) return;

    // Not logged in — redirect to login
    if (!token) {
      router.push("/login");
      return;
    }

    // Logged in — load the cart.
    // We define an async function inside the effect and call it with void
    // to avoid the react-hooks/set-state-in-effect lint rule.
    void (async () => {
      await loadCart(token);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  // ── Change quantity (+1 or -1) ─────────────────────────────────────────────
  // delta is +1 (increment) or -1 (decrement).
  // The backend minimum is 1, so we don't allow going below 1.
  async function changeQty(cartItemId: number, delta: number) {
    if (!token) return;

    // Find the current quantity so we can calculate the new one
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty < 1) return; // do nothing — already at minimum

    setError("");
    try {
      await updateCartItem(token, cartItemId, newQty);
      // Reload the full cart from the backend to keep everything in sync
      await loadCart(token);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not update quantity.");
    }
  }

  // ── Remove a single item ───────────────────────────────────────────────────
  async function removeItem(cartItemId: number) {
    if (!token) return;
    setError("");
    try {
      await removeCartItem(token, cartItemId);
      await loadCart(token);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not remove item.");
    }
  }

  // ── Clear all items ────────────────────────────────────────────────────────
  // Removes every item one by one by calling DELETE /cart/:id for each.
  // The backend has no "clear cart" endpoint, so we loop.
  async function clearCart() {
    if (!token) return;
    if (!confirm("Remove all items from your cart?")) return;
    setError("");
    try {
      // Delete all items in parallel
      await Promise.all(cartItems.map((item) => removeCartItem(token, item.id)));
      await loadCart(token);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not clear cart.");
    }
  }

  // ── Add a suggested product to cart ───────────────────────────────────────
  // Called by the Suggestions component with the real product ID.
  // Calls addToCart(token, productId, 1) then reloads the full cart so the
  // cart count and item list stay in sync with the backend.
  async function addSuggestion(productId: number) {
    if (!token) {
      router.push("/login");
      return;
    }

    // Mark this product as in-flight so the Suggestions card shows "Adding…"
    setAddingIds((prev) => new Set(prev).add(productId));
    setError("");

    try {
      await addToCart(token, productId, 1);
      // Reload the cart to reflect the newly added item
      await loadCart(token);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not add item to cart.");
    } finally {
      // Always clear the loading state for this product
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      {/* Nav */}
      <nav className="fixed top-[3px] left-0 right-0 h-[60px] bg-cream/95 backdrop-blur-xl border-b border-charcoal/[0.07] flex items-center justify-between px-8 z-[500]">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[34px] h-[34px] rounded-full border-2 border-accent bg-charcoal flex items-center justify-center flex-shrink-0">
            <span className="font-cormorant text-accent text-[0.85rem] font-semibold">BV</span>
          </div>
          <div className="font-bebas text-[1.2rem] tracking-[0.1em] text-charcoal leading-none">
            Blockfuse
            <sub className="block font-barlow font-light text-[0.5rem] tracking-[0.25em] uppercase text-warmgray leading-none" style={{ verticalAlign: "baseline" }}>
              Vintage
            </sub>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "New Collection", href: "/#new-collection" },
            { label: "Men",            href: "/#men" },
            { label: "Women",          href: "/#women" },
            { label: "Accessories",    href: "/#accessories" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[0.72rem] tracking-[0.15em] uppercase text-muted hover:text-charcoal transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Cart indicator — shows live item count */}
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-[0.72rem] tracking-[0.15em] uppercase no-underline font-medium"
          style={{ color: "#a8893e" }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Cart ({itemCount})
        </Link>
      </nav>

      {/* Page */}
      <div className="pt-[80px] min-h-screen bg-cream">
        <div className="max-w-[1100px] mx-auto px-6 py-10">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.12em] uppercase text-warmgray mb-3">
              <Link href="/" className="hover:text-accent-dark transition-colors no-underline" style={{ color: "inherit" }}>Home</Link>
              <span className="opacity-40">/</span>
              <span className="text-charcoal">Cart</span>
            </div>
            <h1 className="font-cormorant text-[2rem] font-semibold text-charcoal">Your Cart</h1>
            <p className="text-[0.82rem] text-muted mt-1">
              {loading
                ? "Loading your cart…"
                : itemCount > 0
                  ? `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`
                  : "Your cart is empty"}
            </p>
          </div>

          {/* ── Loading state ── */}
          {(authLoading || loading) && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3 text-muted">
                {/* Spinning ring */}
                <svg
                  className="animate-spin"
                  width="32" height="32" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="#c8a96e"
                  />
                  <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} />
                </svg>
                <span className="font-barlow text-[0.78rem] tracking-[0.12em] uppercase text-warmgray">
                  Loading your cart…
                </span>
              </div>
            </div>
          )}

          {/* ── Error banner (only shown after loading is done) ── */}
          {!loading && !authLoading && error && (
            <div
              className="border rounded-xl px-4 py-3 text-sm mb-6 font-barlow"
              style={{
                background: "rgba(176,92,58,0.08)",
                borderColor: "rgba(176,92,58,0.25)",
                color: "#b05c3a",
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* ── Cart content (only shown when not loading) ── */}
          {!authLoading && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

              {/* Left: items + suggestions */}
              <div>
                <CartItemList
                  items={cartItems}
                  onChangeQty={changeQty}
                  onRemove={removeItem}
                  onClear={clearCart}
                />
                <Suggestions
                  cartProductIds={cartItems.map((item) => item.productId)}
                  onAdd={addSuggestion}
                  addingIds={addingIds}
                />
              </div>

              {/* Right: summary — passes the server totalPrice as the subtotal */}
              <CartSummary subtotal={totalPrice} hasItems={cartItems.length > 0} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
