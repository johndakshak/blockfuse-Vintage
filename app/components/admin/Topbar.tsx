'use client'

// app/components/admin/Topbar.tsx
//
// Admin panel top bar.
//
// Fix 5 — Notifications: The bell icon previously showed a hardcoded red dot
// implying unread notifications. The backend has no notification endpoint.
// The bell now opens a small popover that honestly states there are no
// notifications, rather than displaying a fake unread count.
//
// Fix 7 — Avatar: already uses real user initials from AuthContext (unchanged).

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import type { SectionId } from "./Sidebar";

const TITLES: Record<SectionId, string> = {
  dashboard: "Dashboard",
  products:  "Products",
  orders:    "Orders",
  customers: "Customers",
  settings:  "Settings",
};

type Props = {
  active: SectionId;
  onMenuOpen: () => void;
};

export default function Topbar({ active, onMenuOpen }: Props) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    : "AD";

  // Close the notification popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    if (notifOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [notifOpen]);

  return (
    <div className="bg-white border-b border-charcoal/[0.07] h-14 px-7 flex items-center justify-between sticky top-[3px] z-[100]">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden flex flex-col gap-1 bg-transparent border-none cursor-pointer p-1"
          aria-label="Open menu"
        >
          <span className="block w-[18px] h-[1.5px] bg-charcoal rounded" />
          <span className="block w-[18px] h-[1.5px] bg-charcoal rounded" />
          <span className="block w-[18px] h-[1.5px] bg-charcoal rounded" />
        </button>
        <span className="font-cormorant text-[1.25rem] font-semibold text-charcoal">
          {TITLES[active]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 bg-[#f4f2ee] border border-charcoal/[0.09] rounded-lg px-3 py-2">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#9a9690" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search…"
            className="bg-transparent border-none outline-none font-barlow text-[0.8rem] text-charcoal placeholder-warmgray w-40"
          />
        </div>

        {/* ── Notification bell — no backend support ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative w-[34px] h-[34px] rounded-lg border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-accent transition-colors"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#7a776f" strokeWidth={1.8}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {/* Red dot intentionally removed — no real notifications from backend */}
          </button>

          {/* No-notifications popover */}
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-charcoal/[0.09] rounded-xl shadow-[0_8px_32px_rgba(26,26,24,0.12)] z-[300] overflow-hidden"
              style={{ animation: "topbarDropIn 0.16s cubic-bezier(.16,1,.3,1) both" }}
            >
              <div className="px-4 py-3 border-b border-charcoal/[0.07]">
                <p className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-charcoal font-barlow">
                  Notifications
                </p>
              </div>
              <div className="px-4 py-6 text-center flex flex-col items-center gap-2">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.5}>
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <p className="font-barlow text-[0.75rem] text-muted">
                  No notifications
                </p>
                <p className="font-barlow text-[0.65rem] text-warmgray leading-relaxed">
                  Notifications require a backend endpoint not yet implemented.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Avatar — shows real user initials (unchanged) */}
        <div
          className="w-[34px] h-[34px] rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-[0.7rem] font-semibold cursor-pointer"
          style={{ color: "#a8893e" }}
          title={user?.name ?? "Admin"}
        >
          {initials}
        </div>
      </div>

      <style>{`
        @keyframes topbarDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
