'use client'

// app/payment/callback/page.tsx
//
// Payment return page — shown when Paystack redirects the customer back after
// attempting payment.
//
// ── How this page is reached ──────────────────────────────────────────────────
//
//   1. Checkout page calls POST /payment/:orderId
//   2. Backend returns Paystack's authorization_url
//   3. Checkout page does window.location.href = authorization_url
//   4. Customer completes (or abandons) payment on Paystack's hosted page
//   5. Paystack redirects the customer to the configured callback URL:
//        <APP_ORIGIN>/payment/callback?trxref=<REF>&reference=<REF>
//   6. This page loads
//
// ── What this page does ───────────────────────────────────────────────────────
//
//   • Authenticates the user (same guard as /cart, /checkout, /orders)
//   • Reads the Paystack query parameters for display purposes only
//   • Calls GET /order (via getOrders) to fetch the user's actual order list
//   • Finds the most recent order — the one just placed in this session
//   • Reflects the REAL order status the backend has assigned:
//       PENDING    → payment is still being confirmed by the webhook
//       PROCESSING → backend confirmed payment and is preparing the order
//       SHIPPED    → order has shipped
//       DELIVERED  → order has been delivered
//       CANCELLED  → order was cancelled (payment failed or was abandoned)
//
// ── What this page does NOT do ───────────────────────────────────────────────
//
//   • It does NOT call a frontend payment-verification endpoint — none exists.
//   • It does NOT claim "payment successful" merely because the customer returned.
//   • It does NOT expose the Paystack reference in prominent UI.
//   • It does NOT invent a delivery date, shipping address, or payment method.
//   • It does NOT use the Paystack reference to deduce the order — it uses
//     the authenticated user's real order list from the backend.
//
// ── Why PENDING does not mean failure ────────────────────────────────────────
//
//   Paystack's server-to-server webhook (POST /webhook/paystack) runs
//   asynchronously. By the time the customer's browser lands on this page,
//   the webhook may not have fired yet. Therefore a PENDING order on return
//   is normal and expected — the customer should be told to wait and check
//   /orders rather than panic or retry.
//
// ── Architecture ─────────────────────────────────────────────────────────────
//
//   PaymentCallbackPage
//     ↓
//   getOrders(token)          ← app/lib/checkout.ts (reused, not duplicated)
//     ↓
//   GET /order
//     ↓
//   Backend
//     ↓
//   Real order status
//     ↓
//   Result UI

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getOrders, type Order } from "@/app/lib/checkout";
import { AuthError } from "@/app/lib/auth";
import { fmt } from "@/app/components/cart/cartTypes";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Status interpretation ─────────────────────────────────────────────────────
//
// Maps the backend order status to what we show the customer on return from
// Paystack.  We deliberately do not say "Payment Successful" for PENDING —
// the webhook hasn't confirmed yet.

type ResultKind = "pending" | "confirmed" | "cancelled" | "unknown";

function resolveResultKind(status: Order["status"]): ResultKind {
  switch (status) {
    case "PROCESSING":
    case "SHIPPED":
    case "DELIVERED":
      return "confirmed";
    case "CANCELLED":
      return "cancelled";
    case "PENDING":
      return "pending";
    default:
      return "unknown";
  }
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg className="animate-spin" width="32" height="32" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={1.5} />
        <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} strokeWidth={1.5} />
      </svg>
      <span className="font-barlow text-[0.78rem] tracking-[0.12em] uppercase text-warmgray">
        {label}
      </span>
    </div>
  );
}

// ── Result card content ────────────────────────────────────────────────────────

type ResultConfig = {
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  icon: React.ReactNode;
  heading: string;
  subheading: string;
  bodyText: string;
};

function getResultConfig(kind: ResultKind): ResultConfig {
  switch (kind) {
    case "confirmed":
      return {
        iconColor: "#4a9068",
        iconBg: "rgba(74,144,104,0.10)",
        iconBorder: "rgba(74,144,104,0.30)",
        icon: (
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#4a9068" strokeWidth={2.2}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
        heading: "Order Confirmed",
        subheading: "Payment received",
        bodyText:
          "Your payment has been confirmed and your order is being prepared. You will be redirected to your order history shortly.",
      };

    case "pending":
      return {
        iconColor: "#a8893e",
        iconBg: "rgba(200,169,110,0.12)",
        iconBorder: "rgba(200,169,110,0.30)",
        icon: (
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#a8893e" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        heading: "Confirming Payment",
        subheading: "Please wait a moment",
        bodyText:
          "We have received your order and are waiting for payment confirmation. This usually takes a few seconds. Check your order history for the latest status.",
      };

    case "cancelled":
      return {
        iconColor: "#b05c3a",
        iconBg: "rgba(176,92,58,0.08)",
        iconBorder: "rgba(176,92,58,0.25)",
        icon: (
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#b05c3a" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
        heading: "Payment Not Completed",
        subheading: "Your order was not processed",
        bodyText:
          "It looks like the payment was not completed. No charge has been made. You can return to your cart and try again.",
      };

    default:
      return {
        iconColor: "#9a9690",
        iconBg: "rgba(154,150,144,0.10)",
        iconBorder: "rgba(154,150,144,0.25)",
        icon: (
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9a9690" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
        heading: "Checking Your Order",
        subheading: "One moment…",
        bodyText:
          "We could not determine your order status at this time. Please check your order history for the latest information.",
      };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PaymentCallbackPage() {
  const { token, loading: authLoading, clearAuth } = useAuth();
  const router = useRouter();

  // ── Component state ────────────────────────────────────────────────────────
  //
  // Note: Paystack appends ?trxref=...&reference=... to this URL on return, but
  // we intentionally do not use those values.  Payment verification is handled
  // server-side by the POST /webhook/paystack endpoint.  Displaying or acting on
  // the Paystack reference in the frontend could mislead the user into thinking
  // a payment was verified when it has not been.
  //
  // Instead we call GET /order and reflect the actual backend order status.
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [order, setOrder]       = useState<Order | null>(null);

  // ── Fetch the user's most recent order once auth is ready ──────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push("/login");
      return;
    }

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getOrders(token);

        // Sort newest first — same sort as /orders page — and take the top entry.
        // The most recent order is the one the customer just placed.
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrder(sorted[0] ?? null);
      } catch (err: unknown) {
        if (err instanceof AuthError) {
          // Token expired — clear session and redirect to login
          clearAuth();
          router.push("/login");
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your order details. Please check your order history."
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  // ── Derived display state ──────────────────────────────────────────────────
  const kind: ResultKind = order ? resolveResultKind(order.status) : "unknown";
  const config = getResultConfig(kind);

  // ── Auto-redirect to /orders for confirmed payments ────────────────────────
  // When the order is confirmed (PROCESSING / SHIPPED / DELIVERED), redirect
  // the customer to /orders after a short delay so they can see the result card
  // briefly before being taken to their order history.
  // A ref prevents the timeout from being set more than once.
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (kind === "confirmed" && !redirectTimerRef.current) {
      redirectTimerRef.current = setTimeout(() => {
        router.push("/orders");
      }, 3000); // 3-second delay so the customer sees the confirmation
    }
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [kind, router]);

  // ── Render ─────────────────────────────────────────────────────────────────
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
        <div className="flex items-center gap-1.5 text-[0.7rem] tracking-[0.1em] uppercase text-warmgray">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secure Checkout
        </div>
      </nav>

      {/* Page body */}
      <div className="pt-[63px] min-h-screen bg-cream flex items-center justify-center px-6 py-16">

        {/* ── Auth / orders loading ── */}
        {(authLoading || loading) && (
          <Spinner label="Checking your order…" />
        )}

        {/* ── API error (non-auth) ── */}
        {!authLoading && !loading && error && (
          <div className="max-w-[480px] w-full text-center">
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/orders"
                className="inline-block bg-charcoal text-cream font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-7 py-3.5 rounded-xl no-underline transition-all duration-200 hover:bg-[#2c2c2a] hover:-translate-y-0.5"
              >
                View Orders
              </Link>
              <Link
                href="/products"
                className="inline-block border border-charcoal/20 text-charcoal font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-7 py-3.5 rounded-xl no-underline transition-all duration-200 hover:border-charcoal/40 hover:-translate-y-0.5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* ── Result card ── */}
        {!authLoading && !loading && !error && (
          <div
            className="bg-white border border-charcoal/10 rounded-2xl p-10 max-w-[480px] w-full text-center shadow-[0_20px_60px_rgba(26,26,24,0.07)]"
            style={{ animation: "callbackPopIn 0.45s cubic-bezier(.16,1,.3,1) both" }}
          >
            {/* Status icon */}
            <div
              className="w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center mx-auto mb-6"
              style={{
                background: config.iconBg,
                borderColor: config.iconBorder,
              }}
            >
              {config.icon}
            </div>

            {/* Heading */}
            <h1 className="font-cormorant text-[1.9rem] font-semibold text-charcoal mb-1">
              {config.heading}
            </h1>
            <p
              className="font-bebas text-[0.9rem] tracking-[0.2em] mb-4"
              style={{ color: config.iconColor }}
            >
              {config.subheading}
            </p>

            {/* Body text */}
            <p className="text-[0.82rem] text-muted leading-[1.75] mb-6">
              {config.bodyText}
            </p>

            {/* Order details (if we have a real order) */}
            {order && (
              <div className="bg-cream rounded-xl px-5 py-4 mb-6 text-left flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[0.8rem]">
                  <span className="text-muted font-barlow">Order</span>
                  <span className="font-barlow font-semibold" style={{ color: "#a8893e" }}>
                    #BV-{order.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[0.8rem]">
                  <span className="text-muted font-barlow">Date</span>
                  <span className="text-charcoal font-barlow">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center text-[0.8rem]">
                  <span className="text-muted font-barlow">Items</span>
                  <span className="text-charcoal font-barlow">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[0.8rem] pt-2 border-t border-charcoal/[0.07]">
                  <span className="text-muted font-barlow">Total</span>
                  <span className="font-cormorant text-[1rem] font-semibold text-charcoal">
                    {fmt(order.totalPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* PENDING-specific note */}
            {order && kind === "pending" && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-6 text-left"
                style={{
                  background: "rgba(200,169,110,0.08)",
                  border: "1px solid rgba(200,169,110,0.25)",
                }}
              >
                <svg
                  className="flex-shrink-0 mt-0.5"
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#a8893e"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[0.76rem] leading-relaxed" style={{ color: "#a8893e" }}>
                  Payments typically confirm within a few minutes. If you completed
                  the payment, your order status will update automatically — no
                  action is needed.
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/orders"
                className="flex-1 inline-block bg-charcoal text-cream font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-5 py-3.5 rounded-xl no-underline text-center transition-all duration-200 hover:bg-[#2c2c2a] hover:-translate-y-0.5"
              >
                View Orders
              </Link>
              <Link
                href="/products"
                className="flex-1 inline-block border border-charcoal/20 text-charcoal font-barlow font-semibold text-[0.72rem] tracking-[0.2em] uppercase px-5 py-3.5 rounded-xl no-underline text-center transition-all duration-200 hover:border-charcoal/40 hover:-translate-y-0.5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes callbackPopIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  );
}
