'use client'

// app/orders/page.tsx
//
// Order history page — displays all orders for the authenticated user.
//
// Data flow:
//   OrdersPage mounts
//     ↓
//   useEffect → getOrders(token)
//     ↓
//   GET /order
//     ↓
//   Backend
//     ↓
//   setOrders()
//     ↓
//   Order list renders real data

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getOrders, type Order } from "@/app/lib/checkout";
import { fmt } from "@/app/components/cart/cartTypes";

// Badge colour for each order status — mirrors the admin panel conventions
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    // Wait for auth context to finish initialising
    if (authLoading) return;

    // Not logged in — redirect to login (same pattern as /cart and /checkout)
    if (!token) {
      router.push("/login");
      return;
    }

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getOrders(token);
        // Sort most-recent first by createdAt
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Could not load your orders."
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

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
            <sub className="block font-barlow font-light text-[0.5rem] tracking-[0.25em] uppercase text-warmgray leading-none" style={{ verticalAlign: "baseline" }}>
              Vintage
            </sub>
          </div>
        </Link>
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
          Cart
        </Link>
      </nav>

      {/* Page */}
      <div className="pt-[80px] min-h-screen bg-cream">
        <div className="max-w-[800px] mx-auto px-6 py-10">

          {/* Breadcrumb + header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.12em] uppercase text-warmgray mb-3">
              <Link href="/" className="hover:text-charcoal transition-colors no-underline" style={{ color: "inherit" }}>
                Home
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-charcoal">Order History</span>
            </div>
            <h1 className="font-cormorant text-[2rem] font-semibold text-charcoal">Order History</h1>
            {!loading && !error && (
              <p className="text-[0.82rem] text-muted mt-1">
                {orders.length === 0
                  ? "No orders yet"
                  : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>

          {/* ── Loading state ── */}
          {(authLoading || loading) && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin" width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={1.5} />
                  <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} strokeWidth={1.5} />
                </svg>
                <span className="font-barlow text-[0.78rem] tracking-[0.12em] uppercase text-warmgray">
                  Loading your orders…
                </span>
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {!authLoading && !loading && error && (
            <div
              className="border rounded-xl px-5 py-4 text-sm font-barlow"
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

          {/* ── Empty state ── */}
          {!authLoading && !loading && !error && orders.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#edeae3] flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#9a9690" strokeWidth={1.5}>
                  <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h2 className="font-cormorant text-[1.5rem] font-semibold text-charcoal mb-2">
                No orders yet
              </h2>
              <p className="text-[0.82rem] text-muted mb-6">
                When you place an order it will appear here.
              </p>
              <Link
                href="/products"
                className="inline-block bg-charcoal text-cream font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-8 py-3.5 rounded-xl no-underline transition-all duration-200 hover:bg-[#2c2c2a] hover:-translate-y-0.5"
              >
                Browse Products
              </Link>
            </div>
          )}

          {/* ── Orders list ── */}
          {!authLoading && !loading && !error && orders.length > 0 && (
            <div className="flex flex-col gap-5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-charcoal/[0.07] bg-[#faf9f6]">
                    <div className="flex items-center gap-4">
                      <span
                        className="font-barlow font-semibold text-[0.8rem] tracking-[0.08em]"
                        style={{ color: "#a8893e" }}
                      >
                        #BV-{order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-5 text-[0.75rem] text-muted font-barlow">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-semibold text-charcoal">
                        {fmt(order.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="divide-y divide-charcoal/[0.05]">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                        {/* Product image */}
                        {item.product?.imageUrl ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#edeae3] flex-shrink-0 relative">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product?.name ?? "Product"}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-[#edeae3] flex-shrink-0 flex items-center justify-center">
                            <span className="text-[0.55rem] tracking-[0.1em] uppercase text-warmgray">
                              IMG
                            </span>
                          </div>
                        )}

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.85rem] text-charcoal font-barlow truncate">
                            {item.product?.name ?? `Product #${item.productId}`}
                          </p>
                          <p className="text-[0.75rem] text-muted mt-0.5">
                            Qty {item.quantity} · {fmt(item.price)} each
                          </p>
                        </div>

                        {/* Line total */}
                        <p className="font-cormorant text-[1rem] font-semibold text-charcoal flex-shrink-0">
                          {fmt(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-charcoal/[0.07] bg-[#faf9f6]">
                    <span className="text-[0.72rem] text-muted font-barlow">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[0.72rem] font-barlow font-semibold text-charcoal">
                      Total: {fmt(order.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
