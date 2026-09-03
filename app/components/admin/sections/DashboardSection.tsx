'use client'

// app/components/admin/sections/DashboardSection.tsx
//
// The main admin dashboard.
//
// The Recent Orders table previously used hardcoded mock data from adminData.ts.
// It now fetches real orders from GET /orders via getAdminOrders().
//
// Data flow — Recent Orders:
//   DashboardSection mounts
//     ↓
//   useEffect → getAdminOrders(token)   ← app/lib/checkout.ts
//     ↓
//   GET /orders  (admin only)
//     ↓
//   setRecentOrders()
//     ↓
//   5 most recent real orders render
//
// All other dashboard widgets (stat cards, revenue chart, categories) remain
// unchanged — they have no backend support yet and are out of scope.
//
// NOTE: GET /orders returns userId (a number), not the customer's name.
// The Customer column therefore shows "User #N". No additional GET /users/:id
// calls are made — that would be N extra requests per page load.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getAdminOrders, type Order, type OrderStatus } from "@/app/lib/checkout";
import { AuthError } from "@/app/lib/auth";
import { fmt } from "@/app/components/cart/cartTypes";


// ─── Shared sub-components ────────────────────────────────────────────────────
// These are exported because OrdersSection, ProductsSection, and
// CustomersSection all import Badge from this file.

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

// ─── Shared table class constants ─────────────────────────────────────────────

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

// ─── Dashboard stat cards (still mocked — no backend analytics endpoint) ──────

const STATS = [
  { label: "Total Revenue", val: "₦4.2M", sub: "+18.4% this month", up: true,  color: "gold",  icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { label: "Total Orders",  val: "284",   sub: "+12 new today",     up: true,  color: "green", icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#4a9068" strokeWidth={1.8}><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { label: "Customers",     val: "1,480", sub: "+34 this week",     up: true,  color: "blue",  icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#4a82b8" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { label: "Products",      val: "48",    sub: "3 low stock",       up: false, color: "rust",  icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#b05c3a" strokeWidth={1.8}><path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
];

const colorMap: Record<string, { bar: string; icon: string }> = {
  gold:  { bar: "from-[#a8893e] to-[#c8a96e]", icon: "bg-[rgba(200,169,110,0.1)]" },
  green: { bar: "from-[#3a8a5c] to-[#4a9068]", icon: "bg-[rgba(74,144,104,0.1)]"  },
  blue:  { bar: "from-[#3a7ab0] to-[#4a82b8]", icon: "bg-[rgba(74,130,184,0.1)]"  },
  rust:  { bar: "from-[#8a3a1e] to-[#b05c3a]", icon: "bg-[rgba(176,92,58,0.1)]"   },
};

// ─── Revenue chart (still mocked — no backend time-series endpoint) ───────────

const CHART_HEIGHTS = [45, 62, 50, 78, 58, 92, 70];
const CHART_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Top categories (still mocked — no backend category breakdown endpoint) ───

const CATEGORIES = [
  { name: "Jackets",      amt: "₦1.2M", pct: 82 },
  { name: "Dresses",      amt: "₦890K", pct: 66 },
  { name: "Accessories",  amt: "₦640K", pct: 48 },
  { name: "Trousers",     amt: "₦420K", pct: 32 },
  { name: "Tops",         amt: "₦290K", pct: 20 },
];

// ─── Recent Orders — real backend status badge colours ────────────────────────
// Keyed by the backend's uppercase OrderStatus values.
// Colours match the conventions used in OrdersSection.tsx.

const recentOrderStatusBadge: Record<OrderStatus, string> = {
  PENDING:    "bg-[rgba(154,150,144,0.12)] text-[#7a776f]",
  PROCESSING: "bg-[rgba(200,169,110,0.15)] text-[#a8893e]",
  SHIPPED:    "bg-[rgba(74,130,184,0.10)]  text-[#3a7ab0]",
  DELIVERED:  "bg-[rgba(74,144,104,0.10)]  text-[#3a7a5c]",
  CANCELLED:  "bg-[rgba(176,92,58,0.10)]   text-[#b05c3a]",
};

// Format an ISO date string to a short readable date: "8 Sep 2026"
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Capitalise only the first letter: "PENDING" → "Pending"
function toLabel(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

// ─── DashboardSection ─────────────────────────────────────────────────────────

type Props = { onViewAllOrders: () => void };

export default function DashboardSection({ onViewAllOrders }: Props) {
  const { token, clearAuth } = useAuth();
  const router = useRouter();

  // ── Recent Orders state ───────────────────────────────────────────────────
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // ── Fetch recent orders on mount ──────────────────────────────────────────
  // Reuses getAdminOrders() from app/lib/checkout.ts — the same function
  // already used by OrdersSection.tsx. No duplicate fetch logic.
  useEffect(() => {
    // token is null while AuthContext is still initialising — wait for it
    if (token === null) return;

    void (async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const res = await getAdminOrders(token);
        // Sort most recent first, then keep only the top 5 for the widget
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentOrders(sorted.slice(0, 5));
      } catch (err: unknown) {
        // 401 — token expired while the admin was on the dashboard
        if (err instanceof AuthError) {
          clearAuth();
          router.push("/login");
          return;
        }
        setOrdersError(
          err instanceof Error ? err.message : "Could not load recent orders."
        );
      } finally {
        setOrdersLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Render ────────────────────────────────────────────────────────────────
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

      {/* ── Stat cards (mocked — no backend analytics endpoint yet) ── */}
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

      {/* ── Revenue chart + Top categories (both mocked) ── */}
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

      {/* ── Recent Orders — real data from GET /orders ── */}
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
        {ordersLoading && (
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
        {!ordersLoading && ordersError && (
          <div className="px-5 py-4">
            <div
              className="border rounded-lg px-4 py-3 text-[0.82rem] font-barlow"
              style={{ background: "rgba(176,92,58,0.08)", borderColor: "rgba(176,92,58,0.25)", color: "#b05c3a" }}
              role="alert"
            >
              {ordersError}
            </div>
          </div>
        )}

        {/* Empty */}
        {!ordersLoading && !ordersError && recentOrders.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[0.82rem] text-muted font-barlow">No orders yet.</p>
          </div>
        )}

        {/* Table */}
        {!ordersLoading && !ordersError && recentOrders.length > 0 && (
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
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                    {/* Order ID */}
                    <td className={tdClass}>
                      <span className="font-medium" style={{ color: "#a8893e" }}>
                        #BV-{o.id}
                      </span>
                    </td>
                    {/* Customer — GET /orders returns userId only, not a name */}
                    <td className={`${tdClass} text-muted`}>User #{o.userId}</td>
                    {/* Amount */}
                    <td className={`${tdClass} font-medium`}>{fmt(o.totalPrice)}</td>
                    {/* Status */}
                    <td className={tdClass}>
                      <Badge
                        label={toLabel(o.status)}
                        className={recentOrderStatusBadge[o.status]}
                      />
                    </td>
                    {/* Date */}
                    <td className={`${tdClass} text-muted`}>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
