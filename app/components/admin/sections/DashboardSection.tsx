'use client'

// app/components/admin/sections/DashboardSection.tsx
//
// Admin Dashboard — all metrics now use real backend data where available.
//
// ── What changed in this task ──────────────────────────────────────────────
// Previously: stat cards, revenue chart, and categories were all hardcoded mock data.
// Now:
//   Total Orders    → real count from GET /orders
//   Total Customers → real count of role=USER accounts from GET /users
//   Total Products  → real count from GET /products
//   Revenue         → sum of totalPrice for orders where paymentReference !== null
//                     (non-null paymentReference means Paystack confirmed payment)
//   Revenue chart   → real 7-day daily revenue from paid orders
//   Top Categories  → "Unavailable" — Product schema has no category field
//   Dashboard date  → real current date via new Date()
//
// ── Data flows ──────────────────────────────────────────────────────────────
//
//   Stat cards + Revenue chart:
//     DashboardSection mounts
//       ↓
//     useEffect → getAdminOrders(token)     ← app/lib/checkout.ts
//     useEffect → getAdminUsers(token)      ← app/lib/auth.ts
//     useEffect → getProducts()             ← app/lib/products.ts  (no token — public)
//       ↓
//     GET /orders, GET /users, GET /products  (three independent requests)
//       ↓
//     Derive metrics client-side from real response data
//
//   Recent Orders (unchanged from previous task):
//     DashboardSection mounts
//       ↓
//     useEffect → getAdminOrders(token)     ← app/lib/checkout.ts
//       ↓
//     GET /orders
//       ↓
//     5 most recent real orders render
//
// ── Why products uses no token ──────────────────────────────────────────────
// GET /products is a public endpoint (per OpenAPI spec). getProducts() in
// products.ts does not accept a token. Admin role is already enforced by the
// admin page guard before DashboardSection mounts.
//
// ── Revenue calculation ──────────────────────────────────────────────────────
// The Order schema has paymentReference (nullable string).
// The backend sets this to a Paystack reference string when the webhook
// receives a charge.success event. A non-null value means payment was confirmed.
// Revenue = sum of totalPrice for orders with paymentReference !== null.
// Orders with null paymentReference are PENDING/unpaid and excluded.
//
// ── Why Top Categories is unavailable ───────────────────────────────────────
// The Product schema (confirmed from OpenAPI) has no category field:
//   id, name, description, price, imageUrl, stock, createdBy, createdAt, updatedAt
// Fabricating category groupings from product names would be misleading.
// The widget is preserved in the layout but shows an honest unavailable state.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getAdminOrders, type Order, type OrderStatus } from "@/app/lib/checkout";
import { getAdminUsers, type User, AuthError } from "@/app/lib/auth";
import { getProducts } from "@/app/lib/products";
import { fmt } from "@/app/components/cart/cartTypes";


// ─── Shared sub-components ────────────────────────────────────────────────────
// Exported — OrdersSection, ProductsSection, and CustomersSection import Badge.

export function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center text-[0.62rem] font-medium tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

export function EditBtn() {
  return (
    <button className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-accent transition-all text-muted hover:text-charcoal">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  );
}

export function DelBtn() {
  return (
    <button className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-rust transition-all text-muted hover:text-rust">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      </svg>
    </button>
  );
}

export function ViewBtn() {
  return (
    <button className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-accent transition-all text-muted hover:text-charcoal">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}

// ─── Table class constants ────────────────────────────────────────────────────

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

// ─── Colour map for stat cards (layout only — not data) ───────────────────────

const colorMap: Record<string, { bar: string; icon: string }> = {
  gold:  { bar: "from-[#a8893e] to-[#c8a96e]", icon: "bg-[rgba(200,169,110,0.1)]" },
  green: { bar: "from-[#3a8a5c] to-[#4a9068]", icon: "bg-[rgba(74,144,104,0.1)]"  },
  blue:  { bar: "from-[#3a7ab0] to-[#4a82b8]", icon: "bg-[rgba(74,130,184,0.1)]"  },
  rust:  { bar: "from-[#8a3a1e] to-[#b05c3a]", icon: "bg-[rgba(176,92,58,0.1)]"   },
};

// ─── Stat card icon SVGs (visual only — not data) ─────────────────────────────

const STAT_ICONS = {
  revenue:   <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  orders:    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#4a9068" strokeWidth={1.8}><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  customers: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#4a82b8" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  products:  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#b05c3a" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
};

// ─── Revenue chart helpers ────────────────────────────────────────────────────

// Returns an array of the last N calendar days as "YYYY-MM-DD" strings,
// from oldest to newest. Used to build the 7-day revenue chart.
function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10)); // "YYYY-MM-DD"
  }
  return days;
}

// Short day label: "Mon", "Tue", etc. from a "YYYY-MM-DD" string.
function dayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short" });
}

// ─── Recent Orders badge colours ─────────────────────────────────────────────

const recentOrderStatusBadge: Record<OrderStatus, string> = {
  PENDING:    "bg-[rgba(154,150,144,0.12)] text-[#7a776f]",
  PROCESSING: "bg-[rgba(200,169,110,0.15)] text-[#a8893e]",
  SHIPPED:    "bg-[rgba(74,130,184,0.10)]  text-[#3a7ab0]",
  DELIVERED:  "bg-[rgba(74,144,104,0.10)]  text-[#3a7a5c]",
  CANCELLED:  "bg-[rgba(176,92,58,0.10)]   text-[#b05c3a]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function toLabel(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

// ─── Metric loading/error state type ─────────────────────────────────────────
// Used to track independent loading/error state for each API call so that
// a failure in one endpoint doesn't blank unrelated widgets.

type MetricState<T> = {
  loading: boolean;
  error: string;
  data: T | null;
};

// ─── Stat card loading skeleton ──────────────────────────────────────────────
// Declared at module level (not inside DashboardSection) so React does not
// treat it as a new component type on every render.
function StatSkeleton() {
  return <div className="h-[2rem] bg-charcoal/[0.08] rounded animate-pulse w-2/3" />;
}

// ─── DashboardSection ─────────────────────────────────────────────────────────

type Props = { onViewAllOrders: () => void };

export default function DashboardSection({ onViewAllOrders }: Props) {
  const { token, clearAuth } = useAuth();
  const router = useRouter();

  // ── Independent metric states ─────────────────────────────────────────────
  // Each API call has its own loading/error/data state so failures are isolated.

  // All orders — used for: Total Orders count, Revenue, Revenue chart, Recent Orders
  const [ordersState, setOrdersState] = useState<MetricState<Order[]>>({
    loading: true, error: "", data: null,
  });

  // All users — used for: Total Customers (role === "USER" only)
  const [usersState, setUsersState] = useState<MetricState<User[]>>({
    loading: true, error: "", data: null,
  });

  // All products — used for: Total Products count
  const [productsState, setProductsState] = useState<MetricState<number>>({
    loading: true, error: "", data: null,
  });

  // ── Fetch all metrics on mount ────────────────────────────────────────────
  // Three independent requests fire in parallel. Each updates its own state
  // slice — a failure in one does not block the others from rendering.
  useEffect(() => {
    // Wait for AuthContext to finish loading before making authenticated requests
    if (token === null) return;

    // ── Orders (GET /orders) ─────────────────────────────────────────────────
    void (async () => {
      try {
        const res = await getAdminOrders(token);
        setOrdersState({ loading: false, error: "", data: res.data });
      } catch (err: unknown) {
        if (err instanceof AuthError) {
          clearAuth();
          router.push("/login");
          return;
        }
        setOrdersState({
          loading: false,
          error: err instanceof Error ? err.message : "Could not load orders.",
          data: null,
        });
      }
    })();

    // ── Users (GET /users) ────────────────────────────────────────────────────
    void (async () => {
      try {
        const res = await getAdminUsers(token);
        setUsersState({ loading: false, error: "", data: res.data });
      } catch (err: unknown) {
        if (err instanceof AuthError) {
          // Already handled by the orders fetch above if both get 401.
          // Redirect only if we haven't already.
          clearAuth();
          router.push("/login");
          return;
        }
        setUsersState({
          loading: false,
          error: err instanceof Error ? err.message : "Could not load users.",
          data: null,
        });
      }
    })();

    // ── Products (GET /products) ──────────────────────────────────────────────
    // Public endpoint — no token needed.
    void (async () => {
      try {
        const res = await getProducts();
        setProductsState({ loading: false, error: "", data: res.data.length });
      } catch (err: unknown) {
        setProductsState({
          loading: false,
          error: err instanceof Error ? err.message : "Could not load products.",
          data: null,
        });
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Derived metrics ───────────────────────────────────────────────────────
  // Calculated once from the fetched data — no hardcoded values.

  const allOrders = ordersState.data ?? [];

  // Total Orders: count of all orders in the system
  const totalOrders = allOrders.length;

  // Revenue: sum of totalPrice for PAID orders only.
  // paymentReference is set by the Paystack webhook on charge.success.
  // null = not yet paid / pending. Non-null = payment confirmed.
  const paidOrders = allOrders.filter((o) => o.paymentReference !== null);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Total Customers: users with role === "USER" only (excludes admins)
  const allUsers = usersState.data ?? [];
  const totalCustomers = allUsers.filter((u) => u.role === "USER").length;

  // Total Products: direct count from GET /products response
  const totalProducts = productsState.data ?? 0;

  // Revenue chart: daily revenue from paid orders over the last 7 calendar days.
  // Each bar = sum of totalPrice for paid orders whose createdAt falls on that day.
  const last7Days = lastNDays(7);
  const chartData = last7Days.map((day) => {
    const dayRevenue = paidOrders
      .filter((o) => o.createdAt.slice(0, 10) === day)
      .reduce((sum, o) => sum + o.totalPrice, 0);
    return { day, label: dayLabel(day), revenue: dayRevenue };
  });
  // Normalise bar heights to a 0–100% scale relative to the max day.
  // If all days are zero (no paid orders), show flat baseline bars.
  const maxDayRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const chartBars = chartData.map((d) => ({
    ...d,
    heightPct: Math.max(4, Math.round((d.revenue / maxDayRevenue) * 100)),
    // minimum 4% so bars are always visible even when revenue is 0
  }));

  // ── Dashboard date — real current date ───────────────────────────────────
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Dashboard</h2>
          {/* Real current date — no longer hardcoded */}
          <p className="text-[0.75rem] text-muted mt-0.5">{todayLabel}</p>
        </div>
        <button className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent">
          Download Report
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

        {/* Revenue */}
        {(() => {
          const c = colorMap["gold"];
          return (
            <div className="bg-white border border-charcoal/[0.09] rounded-xl p-5 relative overflow-hidden hover:shadow-[0_4px_20px_rgba(26,26,24,0.07)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-gradient-to-r ${c.bar}`} />
              <div className={`absolute top-4 right-4 w-9 h-9 rounded-[9px] flex items-center justify-center ${c.icon}`}>
                {STAT_ICONS.revenue}
              </div>
              <p className="text-[0.67rem] tracking-[0.18em] uppercase text-warmgray mb-2">Total Revenue</p>
              {ordersState.loading ? (
                <StatSkeleton />
              ) : ordersState.error ? (
                <p className="font-barlow text-[0.75rem] text-muted">Unavailable</p>
              ) : (
                <>
                  <p className="font-cormorant text-[1.9rem] font-semibold text-charcoal leading-none mb-1">
                    {fmt(totalRevenue)}
                  </p>
                  <p className="text-[0.73rem] text-muted">
                    {paidOrders.length} paid order{paidOrders.length !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </div>
          );
        })()}

        {/* Total Orders */}
        {(() => {
          const c = colorMap["green"];
          return (
            <div className="bg-white border border-charcoal/[0.09] rounded-xl p-5 relative overflow-hidden hover:shadow-[0_4px_20px_rgba(26,26,24,0.07)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-gradient-to-r ${c.bar}`} />
              <div className={`absolute top-4 right-4 w-9 h-9 rounded-[9px] flex items-center justify-center ${c.icon}`}>
                {STAT_ICONS.orders}
              </div>
              <p className="text-[0.67rem] tracking-[0.18em] uppercase text-warmgray mb-2">Total Orders</p>
              {ordersState.loading ? (
                <StatSkeleton />
              ) : ordersState.error ? (
                <p className="font-barlow text-[0.75rem] text-muted">Unavailable</p>
              ) : (
                <>
                  <p className="font-cormorant text-[1.9rem] font-semibold text-charcoal leading-none mb-1">
                    {totalOrders.toLocaleString("en-NG")}
                  </p>
                  <p className="text-[0.73rem] text-muted">
                    all time
                  </p>
                </>
              )}
            </div>
          );
        })()}

        {/* Total Customers */}
        {(() => {
          const c = colorMap["blue"];
          return (
            <div className="bg-white border border-charcoal/[0.09] rounded-xl p-5 relative overflow-hidden hover:shadow-[0_4px_20px_rgba(26,26,24,0.07)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-gradient-to-r ${c.bar}`} />
              <div className={`absolute top-4 right-4 w-9 h-9 rounded-[9px] flex items-center justify-center ${c.icon}`}>
                {STAT_ICONS.customers}
              </div>
              <p className="text-[0.67rem] tracking-[0.18em] uppercase text-warmgray mb-2">Customers</p>
              {usersState.loading ? (
                <StatSkeleton />
              ) : usersState.error ? (
                <p className="font-barlow text-[0.75rem] text-muted">Unavailable</p>
              ) : (
                <>
                  <p className="font-cormorant text-[1.9rem] font-semibold text-charcoal leading-none mb-1">
                    {totalCustomers.toLocaleString("en-NG")}
                  </p>
                  <p className="text-[0.73rem] text-muted">
                    registered users
                  </p>
                </>
              )}
            </div>
          );
        })()}

        {/* Total Products */}
        {(() => {
          const c = colorMap["rust"];
          return (
            <div className="bg-white border border-charcoal/[0.09] rounded-xl p-5 relative overflow-hidden hover:shadow-[0_4px_20px_rgba(26,26,24,0.07)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-gradient-to-r ${c.bar}`} />
              <div className={`absolute top-4 right-4 w-9 h-9 rounded-[9px] flex items-center justify-center ${c.icon}`}>
                {STAT_ICONS.products}
              </div>
              <p className="text-[0.67rem] tracking-[0.18em] uppercase text-warmgray mb-2">Products</p>
              {productsState.loading ? (
                <StatSkeleton />
              ) : productsState.error ? (
                <p className="font-barlow text-[0.75rem] text-muted">Unavailable</p>
              ) : (
                <>
                  <p className="font-cormorant text-[1.9rem] font-semibold text-charcoal leading-none mb-1">
                    {totalProducts.toLocaleString("en-NG")}
                  </p>
                  <p className="text-[0.73rem] text-muted">
                    in catalogue
                  </p>
                </>
              )}
            </div>
          );
        })()}

      </div>

      {/* ── Revenue Overview chart + Top Categories ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-4">

        {/* Revenue Overview — real 7-day chart from paid orders */}
        <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
            <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Revenue Overview</span>
            <span className="font-barlow text-[0.72rem] text-muted">Last 7 days</span>
          </div>

          {/* Loading */}
          {ordersState.loading && (
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-end gap-1.5 h-[140px] pb-2">
                {[1,2,3,4,5,6,7].map((i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-charcoal/[0.08] animate-pulse"
                    style={{ height: "40%" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {!ordersState.loading && ordersState.error && (
            <div className="px-5 py-8 text-center">
              <p className="font-barlow text-[0.78rem] text-muted">Revenue data unavailable</p>
            </div>
          )}

          {/* Real chart */}
          {!ordersState.loading && !ordersState.error && (
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-end gap-1.5 h-[140px] pb-2 border-b border-charcoal/[0.09]">
                {chartBars.map((bar) => (
                  <div
                    key={bar.day}
                    className="flex-1 rounded-t bg-gradient-to-b from-accent to-[#a8893e] opacity-70 hover:opacity-100 hover:scale-y-[1.03] transition-all duration-200 cursor-pointer origin-bottom"
                    style={{ height: `${bar.heightPct}%` }}
                    title={`${bar.label}: ${fmt(bar.revenue)}`}
                  />
                ))}
              </div>
              <div className="flex gap-1.5 pt-1.5">
                {chartBars.map((bar) => (
                  <span key={bar.day} className="flex-1 text-center text-[0.62rem] text-warmgray tracking-[0.06em]">
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Categories — unavailable (Product schema has no category field) */}
        <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal/[0.09]">
            <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Top Categories</span>
          </div>
          <div className="px-5 py-8 flex flex-col items-center justify-center gap-2 text-center">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.4}>
              <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" />
            </svg>
            <p className="font-barlow text-[0.78rem] text-muted leading-relaxed">
              Category data unavailable
            </p>
            <p className="font-barlow text-[0.68rem] text-warmgray leading-relaxed">
              Products have no category field in the backend
            </p>
          </div>
        </div>

      </div>

      {/* ── Recent Orders — real data from GET /orders (unchanged) ── */}
      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">Recent Orders</span>
          <button
            onClick={onViewAllOrders}
            className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-3 py-1.5 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent"
          >
            View All
          </button>
        </div>

        {/* Loading */}
        {ordersState.loading && (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} strokeWidth={1.5} />
              </svg>
              <span className="font-barlow text-[0.72rem] tracking-[0.12em] uppercase text-warmgray">
                Loading orders…
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {!ordersState.loading && ordersState.error && (
          <div className="px-5 py-4">
            <div
              className="border rounded-lg px-4 py-3 text-[0.82rem] font-barlow"
              style={{ background: "rgba(176,92,58,0.08)", borderColor: "rgba(176,92,58,0.25)", color: "#b05c3a" }}
              role="alert"
            >
              {ordersState.error}
            </div>
          </div>
        )}

        {/* Empty */}
        {!ordersState.loading && !ordersState.error && allOrders.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[0.82rem] text-muted font-barlow">No orders yet.</p>
          </div>
        )}

        {/* Table — most recent 5 orders */}
        {!ordersState.loading && !ordersState.error && allOrders.length > 0 && (() => {
          const recent = [...allOrders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

          // Build userId → User lookup from the already-fetched users list.
          // usersState.data may be null if GET /users failed — fall back to
          // "User #N" in that case so the orders table still renders correctly.
          const userMap = new Map(
            (usersState.data ?? []).map((u) => [u.id, u])
          );

          return (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => {
                    const customer = userMap.get(o.userId);
                    const customerName = customer ? customer.name : `User #${o.userId}`;
                    return (
                      <tr key={o.id} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                        <td className={tdClass}>
                          <span className="font-medium" style={{ color: "#a8893e" }}>#BV-{o.id}</span>
                        </td>
                        <td className={`${tdClass} text-muted`}>{customerName}</td>
                        <td className={`${tdClass} font-medium`}>{fmt(o.totalPrice)}</td>
                        <td className={tdClass}>
                          <Badge label={toLabel(o.status)} className={recentOrderStatusBadge[o.status]} />
                        </td>
                        <td className={`${tdClass} text-muted`}>{formatDate(o.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
