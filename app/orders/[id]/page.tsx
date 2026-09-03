'use client'

// app/orders/[id]/page.tsx
//
// Order details page — displays the full details of a single order.
//
// ── How the order is resolved ─────────────────────────────────────────────────
//
//   There is no GET /order/:id endpoint. Instead:
//     1. Call getOrders(token)  →  GET /order  (the authenticated user's orders)
//     2. Find the order whose id matches the dynamic [id] route parameter.
//
//   The URL parameter is used ONLY to select from the already-authenticated
//   user's own order list — it cannot expose another user's data.
//
// ── Architecture ──────────────────────────────────────────────────────────────
//
//   OrderDetailsPage
//     ↓
//   getOrders(token)          ← app/lib/checkout.ts (reused, not duplicated)
//     ↓
//   GET /order
//     ↓
//   Backend (orders for this user only)
//     ↓
//   Find order by id param
//     ↓
//   Render full order details

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getOrders, type Order } from "@/app/lib/checkout";
import { AuthError } from "@/app/lib/auth";
import { fmt } from "@/app/components/cart/cartTypes";

// ── Status badge ──────────────────────────────────────────────────────────────
// Mirrors the styling in app/orders/page.tsx and the admin panel.

const statusStyles: Record<Order["status"], { bg: string; color: string }> = {
  PENDING:    { bg: "rgba(154,150,144,0.12)", color: "#7a776f" },
  PROCESSING: { bg: "rgba(200,169,110,0.15)", color: "#a8893e" },
  SHIPPED:    { bg: "rgba(74,130,184,0.10)",  color: "#3a7ab0" },
  DELIVERED:  { bg: "rgba(74,144,104,0.10)",  color: "#3a7a5c" },
  CANCELLED:  { bg: "rgba(176,92,58,0.10)",   color: "#b05c3a" },
};

function StatusBadge({ status }: { status: Order["status"] }) {
  const s = statusStyles[status] ?? statusStyles.PENDING;
  return (
    <span
      className="inline-flex items-center text-[0.62rem] font-medium tracking-[0.1em] uppercase px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ── Date helper ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Loading spinner ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin" width="32" height="32" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={1.5} />
          <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} strokeWidth={1.5} />
        </svg>
        <span className="font-barlow text-[0.78rem] tracking-[0.12em] uppercase text-warmgray">
          Loading order details…
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderDetailsPage() {
  const { token, loading: authLoading, clearAuth } = useAuth();
  const router = useRouter();
  const params = useParams();

  // The dynamic segment is always a string in Next.js params
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const orderId = idParam ? parseInt(idParam, 10) : NaN;
  // Computed before state so we can use it as the initial loading value below
  const validId = !isNaN(orderId);

  // Start in loading=false when the id is already known to be invalid so we
  // never call setState synchronously inside the effect.
  const [loading, setLoading]   = useState(validId);
  const [error, setError]       = useState("");
  const [order, setOrder]       = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);


  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push("/login");
      return;
    }

    // Invalid param — no API call needed; render will show the not-found state
    if (!validId) return;

    void (async () => {
      setLoading(true);
      setError("");
      setNotFound(false);
      try {
        const response = await getOrders(token);

        // Locate the requested order in the authenticated user's order list.
        // The URL param is only used to select from this user's own data —
        // it cannot expose orders belonging to another user.
        const found = response.data.find((o) => o.id === orderId) ?? null;

        if (found) {
          setOrder(found);
        } else {
          setNotFound(true);
        }
      } catch (err: unknown) {
        if (err instanceof AuthError) {
          clearAuth();
          router.push("/login");
          return;
        }
        setError(
          err instanceof Error ? err.message : "Could not load order details."
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token, orderId, validId]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const itemCount = order?.items.length ?? 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      {/* Slim nav */}
      <nav className="fixed top-[3px] left-0 right-0 h-[60px] bg-cream/95 backdrop-blur-xl border-b border-charcoal/[0.07] flex items-center justify-between px-8 z-[500]">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[34px] h-[34px] rounded-full border-2 border-accent bg-charcoal flex items-center justify-center flex-shrink-0">
            <span className="font-cormorant text-accent text-[0.85rem] font-semibold">BV</span>
          </div>
          <div className="font-bebas text-[1.2rem] tracking-[0.1em] text-charcoal leading-none">
            Blockfuse
            <sub
              className="block font-barlow font-light text-[0.5rem] tracking-[0.25em] uppercase text-warmgray leading-none"
              style={{ verticalAlign: "baseline" }}
            >
              Vintage
            </sub>
          </div>
        </Link>
        <Link
          href="/orders"
          className="flex items-center gap-1.5 text-[0.72rem] tracking-[0.15em] uppercase no-underline font-medium"
          style={{ color: "#a8893e" }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Orders
        </Link>
      </nav>

      {/* Page body */}
      <div className="pt-[80px] min-h-screen bg-cream">
        <div className="max-w-[800px] mx-auto px-6 py-10">

          {/* ── Loading ── */}
          {(authLoading || loading) && <Spinner />}

          {/* ── API error ── */}
          {!authLoading && !loading && error && (
            <div>
              <div
                className="border rounded-xl px-5 py-4 text-sm font-barlow mb-6"
                style={{
                  background: "rgba(176,92,58,0.08)",
                  borderColor: "rgba(176,92,58,0.25)",
                  color: "#b05c3a",
                }}
                role="alert"
              >
                {error}
              </div>
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.1em] uppercase text-muted hover:text-charcoal transition-colors no-underline font-barlow"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back to Order History
              </Link>
            </div>
          )}

          {/* ── Order not found ── */}
          {!authLoading && !loading && !error && (notFound || !validId) && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#edeae3] flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#9a9690" strokeWidth={1.5}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h2 className="font-cormorant text-[1.6rem] font-semibold text-charcoal mb-2">
                Order not found
              </h2>
              <p className="text-[0.82rem] text-muted mb-6">
                We could not find this order in your account.
              </p>
              <Link
                href="/orders"
                className="inline-block bg-charcoal text-cream font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-8 py-3.5 rounded-xl no-underline transition-all duration-200 hover:bg-[#2c2c2a] hover:-translate-y-0.5"
              >
                Back to Order History
              </Link>
            </div>
          )}

          {/* ── Order details ── */}
          {!authLoading && !loading && !error && !notFound && order && (
            <>
              {/* Breadcrumb + header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.12em] uppercase text-warmgray mb-3">
                  <Link href="/" className="hover:text-charcoal transition-colors no-underline" style={{ color: "inherit" }}>
                    Home
                  </Link>
                  <span className="opacity-40">/</span>
                  <Link href="/orders" className="hover:text-charcoal transition-colors no-underline" style={{ color: "inherit" }}>
                    Order History
                  </Link>
                  <span className="opacity-40">/</span>
                  <span className="text-charcoal">#BV-{order.id}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="font-cormorant text-[2rem] font-semibold text-charcoal">
                    Order #BV-{order.id}
                  </h1>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-[0.78rem] text-muted mt-1.5 font-barlow">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              {/* ── Order items card ── */}
              <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden mb-5">
                <div className="px-6 py-4 border-b border-charcoal/[0.07] bg-[#faf9f6]">
                  <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">
                    Items · {itemCount} {itemCount === 1 ? "piece" : "pieces"}
                  </span>
                </div>

                <div className="divide-y divide-charcoal/[0.05]">
                  {order.items.map((item) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-5">
                        {/* Product image */}
                        {item.product?.imageUrl ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#edeae3] flex-shrink-0 relative">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product?.name ?? "Product"}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#edeae3] flex-shrink-0 flex items-center justify-center">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.4}>
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.88rem] text-charcoal font-barlow font-medium leading-snug truncate">
                            {item.product?.name ?? `Product #${item.productId}`}
                          </p>
                          {item.product?.description && (
                            <p className="text-[0.74rem] text-muted mt-0.5 line-clamp-1">
                              {item.product.description}
                            </p>
                          )}
                          <p className="text-[0.74rem] text-muted mt-1 font-barlow">
                            {fmt(item.price)} × {item.quantity}
                          </p>
                        </div>

                        {/* Line total */}
                        <p className="font-cormorant text-[1.05rem] font-semibold text-charcoal flex-shrink-0">
                          {fmt(lineTotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Order summary card ── */}
              <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-charcoal/[0.07] bg-[#faf9f6]">
                  <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">
                    Order Summary
                  </span>
                </div>
                <div className="px-6 py-5 flex flex-col gap-3">
                  {/* Subtotal: sum of item.price × item.quantity */}
                  <div className="flex justify-between items-center text-[0.82rem]">
                    <span className="text-muted font-barlow">
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="text-charcoal font-barlow">
                      {fmt(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-charcoal/[0.06]" />

                  {/* Order total — the authoritative value from the backend */}
                  <div className="flex justify-between items-center">
                    <span className="text-[0.82rem] font-barlow font-semibold text-charcoal">
                      Order Total
                    </span>
                    <span className="font-cormorant text-[1.3rem] font-semibold text-charcoal">
                      {fmt(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/orders"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal text-cream font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-6 py-3.5 rounded-xl no-underline transition-all duration-200 hover:bg-[#2c2c2a] hover:-translate-y-0.5"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Back to Order History
                </Link>
                <Link
                  href="/products"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-charcoal/20 text-charcoal font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-6 py-3.5 rounded-xl no-underline transition-all duration-200 hover:border-charcoal/40 hover:-translate-y-0.5"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
