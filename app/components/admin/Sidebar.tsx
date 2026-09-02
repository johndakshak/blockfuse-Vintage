'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export type SectionId = "dashboard" | "products" | "orders" | "customers" | "settings";

type NavItem = {
  id: SectionId;
  label: string;
  pill?: string;
  icon: React.ReactNode;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-none stroke-current" strokeWidth={1.7}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        id: "products",
        label: "Products",
        pill: "48",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-none stroke-current" strokeWidth={1.7}>
            <path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          </svg>
        ),
      },
      {
        id: "orders",
        label: "Orders",
        pill: "12",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-none stroke-current" strokeWidth={1.7}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
        ),
      },
      {
        id: "customers",
        label: "Customers",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-none stroke-current" strokeWidth={1.7}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        icon: (
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-none stroke-current" strokeWidth={1.7}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

type Props = {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ active, onNavigate, isOpen, onClose }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // The admin's initials derived from their real name (e.g. "John Doe" → "JD")
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    : "AD";

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/35 z-[150] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-[3px] left-0 bottom-0 w-[248px] bg-white border-r border-charcoal/[0.09] flex flex-col z-[200] transition-transform duration-[400ms] ease-[cubic-bezier(.16,1,.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-charcoal/[0.09]">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center flex-shrink-0">
              <span className="font-cormorant text-accent text-[1rem] font-semibold">BV</span>
            </div>
            <div>
              <div className="font-bebas text-[1.1rem] tracking-[0.1em] text-charcoal leading-none">Blockfuse</div>
              <div className="text-[0.58rem] tracking-[0.25em] uppercase text-warmgray mt-0.5">Vintage · Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-5 pt-3 pb-1 text-[0.6rem] tracking-[0.22em] uppercase text-warmgray font-medium">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`w-full flex items-center gap-2.5 px-5 py-2.5 mx-0 rounded-lg text-[0.83rem] transition-all duration-200 cursor-pointer border-none text-left ${
                      isActive
                        ? "bg-accent/[0.08] text-[#a8893e] font-medium"
                        : "text-muted hover:bg-[#f4f2ee] hover:text-charcoal"
                    }`}
                    style={{ margin: "0 0.5rem", width: "calc(100% - 1rem)" }}
                  >
                    <span className={isActive ? "text-accent" : ""}>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.pill && (
                      <span className="bg-accent text-charcoal text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full">
                        {item.pill}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer — shows the real logged-in admin user */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-t border-charcoal/[0.09]">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-[0.7rem] font-semibold flex-shrink-0" style={{ color: "#a8893e" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.8rem] font-medium text-charcoal truncate">{user?.name ?? "Admin"}</div>
            <div className="text-[0.62rem] tracking-[0.08em] uppercase text-warmgray truncate">{user?.email ?? ""}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-warmgray hover:text-rust transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
