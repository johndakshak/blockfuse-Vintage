'use client'

// app/admin/page.tsx
//
// Admin dashboard. Protected — accessible only to authenticated ADMIN-role users.
//
// Guard logic (runs before any admin UI renders):
//   1. While auth is loading → show spinner (do not redirect prematurely)
//   2. Not authenticated (no token / no user) → redirect to /login
//   3. Authenticated but role !== "ADMIN" → redirect to / (homepage)
//   4. Authenticated and role === "ADMIN" → render admin dashboard
//
// The role comes from the user object populated by GET /me in AuthContext.
// No email hardcoding. No token-only check. No manual JWT decoding.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Sidebar, { type SectionId } from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import DashboardSection from "../components/admin/sections/DashboardSection";
import ProductsSection from "../components/admin/sections/ProductsSection";
import OrdersSection from "../components/admin/sections/OrdersSection";
import CustomersSection from "../components/admin/sections/CustomersSection";
import SettingsSection from "../components/admin/sections/SettingsSection";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Role guard ────────────────────────────────────────────────────────────
  // Wait for AuthContext to finish resolving the token/user before deciding.
  // This prevents a brief flash of the admin UI or a premature redirect.
  useEffect(() => {
    if (authLoading) return; // still loading — do nothing yet

    if (!user) {
      // No authenticated user — send to login
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      // Authenticated but not an admin — send to homepage
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // ── Loading state ─────────────────────────────────────────────────────────
  // Show spinner while:
  //   a) Auth is still initialising, OR
  //   b) Auth is done but user is not admin (redirect is in flight)
  // This ensures the admin UI never renders for non-admin users.
  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#f4f2ee] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin" width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={1.5} />
            <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} strokeWidth={1.5} />
          </svg>
          <span className="font-barlow text-[0.78rem] tracking-[0.12em] uppercase text-warmgray">
            Loading…
          </span>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ───────────────────────────────────────────────────────
  // Only reached when user is authenticated and role === "ADMIN"
  return (
    <>
      {/* Gold accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      <div className="flex min-h-screen pt-[3px] bg-[#f4f2ee]">
        {/* Sidebar */}
        <Sidebar
          active={activeSection}
          onNavigate={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-[248px] transition-[margin] duration-[400ms]">
          <Topbar active={activeSection} onMenuOpen={() => setSidebarOpen(true)} />

          <main className="flex-1 p-7">
            {activeSection === "dashboard" && (
              <DashboardSection onViewAllOrders={() => setActiveSection("orders")} />
            )}
            {activeSection === "products"  && <ProductsSection />}
            {activeSection === "orders"    && <OrdersSection />}
            {activeSection === "customers" && <CustomersSection />}
            {activeSection === "settings"  && <SettingsSection />}
          </main>
        </div>
      </div>
    </>
  );
}
