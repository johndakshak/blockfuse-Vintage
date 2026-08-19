'use client'

import { useState } from "react";
import Sidebar, { type SectionId } from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import DashboardSection from "../components/admin/sections/DashboardSection";
import ProductsSection from "../components/admin/sections/ProductsSection";
import OrdersSection from "../components/admin/sections/OrdersSection";
import CustomersSection from "../components/admin/sections/CustomersSection";
import SettingsSection from "../components/admin/sections/SettingsSection";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
