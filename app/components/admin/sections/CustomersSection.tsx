'use client'

// app/components/admin/sections/CustomersSection.tsx
//
// Admin Customers section.
// Replaces the previous hardcoded mock data with real backend API calls.
//
// Data flow:
//   CustomersSection mounts
//     ↓
//   useEffect → getAdminUsers(token)
//     ↓
//   GET /users  (admin only)
//     ↓
//   setUsers()
//     ↓
//   Real customer table renders
//
// Fields available from the backend (GET /users → User schema):
//   id, name, email, role, createdAt
//
// Fields NOT provided by the backend (present in previous mock, now removed):
//   phone, orders (order count), spent (total spending), status (Active/Inactive/Banned)
//   These cannot be fabricated — they are not returned by GET /users.
//   The role field replaces the status column.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getAdminUsers, type User, AuthError } from "@/app/lib/auth";
import { Badge } from "./DashboardSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";

const roleBadge: Record<User["role"], string> = {
  USER:  "bg-[rgba(154,150,144,0.12)] text-[#7a776f]",
  ADMIN: "bg-[rgba(200,169,110,0.15)] text-[#a8893e]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── CustomersSection ─────────────────────────────────────────────────────────

export default function CustomersSection() {
  const { token, clearAuth } = useAuth();
  const router = useRouter();

  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Client-side search — operates on real backend data
  const [search, setSearch]   = useState("");

  // ── Load users ─────────────────────────────────────────────────────────────
  async function loadUsers() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAdminUsers(token);
      // Sort most recent first
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUsers(sorted);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        // Token expired/invalid — clear session and redirect to login
        clearAuth();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Client-side search filter ──────────────────────────────────────────────
  const visible = search.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Customers</h2>
        <button
          onClick={() => void loadUsers()}
          disabled={loading}
          className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg border border-charcoal/[0.09] text-muted hover:border-accent hover:text-charcoal transition-all cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        {/* Header + search */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09] gap-3 flex-wrap">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">
            All Customers
            {!loading && !error && (
              <span className="font-barlow text-[0.72rem] font-normal text-muted ml-2">
                ({visible.length}{search ? " matching" : ""})
              </span>
            )}
          </span>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-barlow text-[0.72rem] text-charcoal border border-charcoal/[0.09] rounded-md px-3 py-1.5 bg-white outline-none focus:border-accent transition-colors w-52 placeholder-warmgray"
          />
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
                Loading customers…
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
              {search ? "No customers match your search." : "No customers yet."}
            </p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && visible.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Customer", "Email", "Role", "Joined"].map((h) => (
                    <th key={h} className={thClass}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u.id} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                    {/* Name + initials avatar */}
                    <td className={tdClass}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-[0.68rem] font-semibold flex-shrink-0"
                          style={{ color: "#a8893e" }}
                        >
                          {getInitials(u.name)}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className={`${tdClass} text-muted`}>{u.email}</td>
                    {/* Role badge */}
                    <td className={tdClass}>
                      <Badge
                        label={u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                        className={roleBadge[u.role]}
                      />
                    </td>
                    {/* Joined date from createdAt */}
                    <td className={`${tdClass} text-warmgray`}>{formatDate(u.createdAt)}</td>
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
