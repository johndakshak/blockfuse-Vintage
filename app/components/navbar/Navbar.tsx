'use client'

// app/components/navbar/Navbar.tsx
//
// Main storefront navigation bar.
//
// Changes in this task:
//   Fix 1 — Cart badge: shows total cart item quantity from AuthContext.cartCount.
//            Fetched via getCartItems (through AuthContext.refreshCartCount).
//            No direct fetch() here — all cart I/O goes through app/lib/cart.ts.
//   Fix 7 — Avatar / profile dropdown: replaces the plain "Hi, Name" + Sign Out
//            buttons with an initials avatar that opens a dropdown menu containing
//            Profile/Settings, Orders, and Sign Out. Uses real user from AuthContext.

import { useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

// ── Derive initials from a full name ──────────────────────────────────────────
// "John Dakshak Longrin" → "JL" (first + last word initials, max 2 chars)
function getInitials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { user, logout, cartCount } = useAuth();
    const router = useRouter();

    // Ref used to close the dropdown when clicking outside
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close profile dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        if (isProfileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isProfileOpen]);

    // Close profile dropdown on Escape
    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setIsProfileOpen(false);
        }
        if (isProfileOpen) {
            document.addEventListener("keydown", handleEsc);
        }
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isProfileOpen]);

    function handleLogout() {
        setIsProfileOpen(false);
        logout();
        router.push("/");
    }

    const initials = user ? getInitials(user.name) : null;

    // Show badge only when count > 0
    const showBadge = typeof cartCount === "number" && cartCount > 0;

    return (
        <>
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <nav id="navbar"
                className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 ${ isScrolled ? "py-1" : "py-2" } z-[100] bg-cream/90 backdrop-blur-xl border-b border-charcoal/[.06] transition-all duration-300`}>

                <Link href="/" className="flex items-center no-underline">
                    <Image
                        src="/images/logo_accent-removebg-preview.png"
                        alt="Blockfuse Vintage"
                        width={10}
                        height={10}
                        className="h-10 w-auto object-contain"
                        style={{ height: "auto" }}
                    />
                    <span className="font-bebas text-[1.7rem] tracking-[0.12em] text-charcoal hidden">Blockfuse</span>
                </Link>

                <div className="hidden md:flex gap-10">
                    <Link href="/#new-collection" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">New Collection</Link>
                    <Link href="/#men" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">Men</Link>
                    <Link href="/#women" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">Women</Link>
                    <Link href="/#about" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">About</Link>
                    <Link href="/#contact" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">Contact</Link>
                </div>

                {/* Search bar (desktop) */}
                <div className="hidden md:flex items-center relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-44 lg:w-56 pl-3 pr-9 py-[0.45rem] text-[0.72rem] tracking-wider2 bg-transparent border border-charcoal/20 text-charcoal placeholder-warmgray outline-none focus:border-charcoal/60 focus:w-64 transition-all duration-300 font-barlow"
                    />
                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-warmgray hover:text-charcoal transition-colors duration-200">
                        <svg className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-4 md:gap-5">
                    {/* Search icon: mobile only */}
                    <svg className="flex md:hidden w-[18px] h-[18px] stroke-charcoal fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>

                    {/* Auth area — desktop only */}
                    {user ? (
                        /* ── Avatar + profile dropdown ── */
                        <div className="hidden md:block relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen((v) => !v)}
                                aria-label="Profile menu"
                                aria-expanded={isProfileOpen}
                                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 group"
                            >
                                {/* Initials avatar */}
                                <span
                                    className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[0.65rem] font-semibold font-barlow tracking-[0.05em] border border-accent/40 transition-all duration-200 group-hover:border-accent"
                                    style={{ background: "rgba(200,169,110,0.12)", color: "#a8893e" }}
                                    aria-hidden="true"
                                >
                                    {initials}
                                </span>
                                {/* Name label */}
                                <span className="text-[0.68rem] tracking-[0.18em] uppercase text-charcoal font-barlow group-hover:text-accent-dark transition-colors">
                                    {user.name.split(" ")[0]}
                                </span>
                                {/* Chevron */}
                                <svg
                                    width="10" height="10" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={2.2}
                                    className={`text-warmgray transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {/* Dropdown */}
                            {isProfileOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-[180px] bg-white border border-charcoal/[0.09] rounded-xl shadow-[0_8px_32px_rgba(26,26,24,0.12)] z-[300] overflow-hidden"
                                    style={{ animation: "navDropIn 0.18s cubic-bezier(.16,1,.3,1) both" }}
                                >
                                    {/* User info header */}
                                    <div className="px-4 py-3 border-b border-charcoal/[0.07]">
                                        <p className="text-[0.75rem] font-medium text-charcoal font-barlow truncate">{user.name}</p>
                                        <p className="text-[0.65rem] text-muted font-barlow truncate">{user.email}</p>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1">
                                        {/* Profile/Settings — links to admin panel for admins,
                                            omitted for regular customers (no storefront account page exists yet) */}
                                        {user.role === "ADMIN" && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[0.75rem] text-charcoal font-barlow no-underline hover:bg-[#f4f2ee] transition-colors"
                                            >
                                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                                </svg>
                                                Admin Panel
                                            </Link>
                                        )}
                                        <Link
                                            href="/orders"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-[0.75rem] text-charcoal font-barlow no-underline hover:bg-[#f4f2ee] transition-colors"
                                        >
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                                            </svg>
                                            Orders
                                        </Link>
                                    </div>

                                    {/* Sign out */}
                                    <div className="border-t border-charcoal/[0.07] py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.75rem] text-rust font-barlow hover:bg-[rgba(176,92,58,0.06)] transition-colors cursor-pointer bg-transparent border-none text-left"
                                        >
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="hidden md:inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.18em] uppercase text-charcoal border border-charcoal/30 px-4 py-2 no-underline hover:bg-charcoal hover:text-cream transition-all duration-200"
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Cart icon with badge */}
                    <Link href="/cart" aria-label={`View cart${showBadge ? `, ${cartCount} items` : ""}`} className="no-underline relative">
                        <svg className="w-[18px] h-[18px] stroke-charcoal fill-none" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {showBadge && (
                            <span
                                className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-accent flex items-center justify-center text-charcoal font-barlow font-semibold"
                                style={{ fontSize: "0.55rem", lineHeight: 1, padding: "0 3px" }}
                            >
                                {cartCount! > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Hamburger — mobile only */}
                    <button
                        id="hamburger"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden flex flex-col gap-[5px] bg-transparent border-none p-0"
                    >
                        <Menu className="w-[22px] h-[22px] text-charcoal" />
                    </button>
                </div>
            </nav>

            <style>{`
                @keyframes navDropIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
            `}</style>
        </>
    );
}
