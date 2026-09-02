'use client'

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    : "AD";
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

        {/* Notification bell */}
        <div className="relative w-[34px] h-[34px] rounded-lg border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-accent transition-colors">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#7a776f" strokeWidth={1.8}>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-rust rounded-full border-[1.5px] border-white" />
        </div>

        {/* Avatar — shows real user initials */}
        <div className="w-[34px] h-[34px] rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-[0.7rem] font-semibold cursor-pointer" style={{ color: "#a8893e" }}>
          {initials}
        </div>
      </div>
    </div>
  );
}
