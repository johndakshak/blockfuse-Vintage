'use client'

// app/components/admin/sections/OrdersSection.tsx
//
// Admin Orders management section.
// Replaces the previous hardcoded mock data with real backend API calls.
//
// Data flow:
//   OrdersSection mounts
//     ↓
//   useEffect → getAdminOrders(token)
//     ↓
//   GET /orders  (admin only)
//     ↓
//   setOrders()
//     ↓
//   Real orders table renders
//
// Status update:
//   Admin selects new status from dropdown
//     ↓
//   updateOrderStatus(orderId, status, token)
//     ↓
//   PATCH /order/status/:id  { status }
//     ↓
//   Backend returns updated Order
//     ↓
//   Update order in local state from backend response

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  getAdminOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/app/lib/checkout";
import { AuthError } from "@/app/lib/auth";
import { fmt } from "@/app/components/cart/cartTypes";
import { Badge } from "./DashboardSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

// Status badge styles keyed by backend uppercase status values
const statusBadge: Record<OrderStatus, string> = {
  PENDING:    "bg-[rgba(154,150,144,0.12)] text-[#7a776f]",
  PROCESSING: "bg-[rgba(200,169,110,0.15)] text-[#a8893e]",
  SHIPPED:    "bg-[rgba(74,130,184,0.10)]  text-[#3a7ab0]",
  DELIVERED:  "bg-[rgba(74,144,104,0.10)]  text-[#3a7a5c]",
  CANCELLED:  "bg-[rgba(176,92,58,0.10)]   text-[#b05c3a]",
};

// Payment display derived from paymentReference field
function paymentLabel(ref: string | null): { label: string; cls: string } {
  return ref
    ? { label: "Paid",    cls: "bg-[rgba(74,144,104,0.1)] text-[#3a7a5c]" }
    : { label: "Pending", cls: "bg-[rgba(200,169,110,0.15)] text-[#a8893e]" };
}

// Valid next status transitions per OpenAPI spec
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED",    "CANCELLED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  [],
  CANCELLED:  [],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function toLabel(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

// ─── StatusCell ───────────────────────────────────────────────────────────────
// Shows the current status badge + a dropdown for allowed transitions.
// Disabled for terminal statuses (DELIVERED, CANCELLED).

type StatusCellProps = {
  order: Order;
  updating: boolean;
  onUpdate: (orderId: number, status: OrderStatus) => void;
};

function StatusCell({ order, updating, onUpdate }: StatusCellProps) {
  const allowed = TRANSITIONS[order.status];
  const isTerminal = allowed.length === 0;

  return (
    <div className="flex items-center gap-2">
      <Badge label={toLabel(order.status)} className={statusBadge[order.status]} />
      {!isTerminal && (
        <select
          disabled={updating}
          value=""
          onChange={(e) => {
            if (e.target.value) onUpdate(order.id, e.target.value as OrderStatus);
          }}
          className="font-barlow text-[0.65rem] text-muted border border-charcoal/[0.09] rounded px-1.5 py-0.5 bg-white outline-none hover:border-accent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Change status"
        >
          <option value="">Update…</option>
          {allowed.map((s) => (
            <option key={s} value={s}>{toLabel(s)}</option>
          ))}
        </select>
      )}
      {updating && (
        <svg className="animate-spin flex-shrink-0" width="12" height="12" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={2} />
        </svg>
      )}
    </div>
  );
}

// ─── OrdersSection ────────────────────────────────────────────────────────────

export default function OrdersSection() {
  const { token, clearAuth } = useAuth();
  const router = useRouter();

  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Track which order ID is currently having its status updated
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState("");

  // Status filter
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");

  // ── Load orders ────────────────────────────────────────────────────────────
  async function loadOrders() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAdminOrders(token);
      // Sort most recent first
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Update order status ────────────────────────────────────────────────────
  async function handleStatusUpdate(orderId: number, status: OrderStatus) {
    if (!token || updatingId !== null) return;
    setUpdatingId(orderId);
    setUpdateError("");
    try {
      const res = await updateOrderStatus(orderId, status, token);
      // Update the specific order in state from the backend response
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? res.data : o))
      );
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setUpdateError(err instanceof Error ? err.message : "Could not update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Filtered orders ────────────────────────────────────────────────────────
  const visible = filterStatus === "ALL"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Orders</h2>
        <button
          onClick={() => void loadOrders()}
          disabled={loading}
          className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Status update error banner */}
      {updateError && (
        <div
          className="border rounded-lg px-4 py-2.5 text-[0.78rem] font-barlow mb-4"
          style={{ background: "rgba(176,92,58,0.08)", borderColor: "rgba(176,92,58,0.25)", color: "#b05c3a" }}
          role="alert"
        >
          {updateError}
        </div>
      )}

      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        {/* Table header + filter */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">
            All Orders
            {!loading && !error && (
              <span className="font-barlow text-[0.72rem] font-normal text-muted ml-2">
                ({visible.length}{filterStatus !== "ALL" ? ` ${toLabel(filterStatus)}` : ""})
              </span>
            )}
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "ALL")}
            className="font-barlow text-[0.72rem] text-muted border border-charcoal/[0.09] rounded-md px-2 py-1 bg-white outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin" width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} strokeWidth={1.5} />
              </svg>
              <span className="font-barlow text-[0.75rem] tracking-[0.12em] uppercase text-warmgray">
                Loading orders…
              </span>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="px-5 py-4">
            <div
              className="border rounded-lg px-4 py-3 text-[0.82rem] font-barlow"
              style={{ background: "rgba(176,92,58,0.08)", borderColor: "rgba(176,92,58,0.25)", color: "#b05c3a" }}
              role="alert"
            >
              {error}
            </div>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && visible.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[0.82rem] text-muted font-barlow">
              {filterStatus === "ALL" ? "No orders yet." : `No ${toLabel(filterStatus)} orders.`}
            </p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && visible.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Order ID", "User", "Items", "Total", "Payment", "Status", "Date"].map((h) => (
                    <th key={h} className={thClass}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => {
                  const pay = paymentLabel(o.paymentReference);
                  const isUpdating = updatingId === o.id;
                  return (
                    <tr key={o.id} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                      {/* Order ID */}
                      <td className={tdClass}>
                        <span className="font-medium" style={{ color: "#a8893e" }}>
                          #BV-{o.id}
                        </span>
                      </td>
                      {/* User */}
                      <td className={`${tdClass} text-muted`}>
                        User #{o.userId}
                      </td>
                      {/* Items count */}
                      <td className={tdClass}>{o.items.length}</td>
                      {/* Total */}
                      <td className={`${tdClass} font-medium`}>{fmt(o.totalPrice)}</td>
                      {/* Payment */}
                      <td className={tdClass}>
                        <Badge label={pay.label} className={pay.cls} />
                      </td>
                      {/* Status + update dropdown */}
                      <td className={tdClass}>
                        <StatusCell
                          order={o}
                          updating={isUpdating}
                          onUpdate={handleStatusUpdate}
                        />
                      </td>
                      {/* Date */}
                      <td className={`${tdClass} text-muted`}>
                        {formatDate(o.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
