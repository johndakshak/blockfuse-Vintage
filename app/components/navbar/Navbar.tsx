'use client'

import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {

        const handleScroll= () => {
            setIsScrolled(window.scrollY > 60);
        }

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll)

    }, []);

    return (
        <>
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />        
            <nav id="navbar" 
                className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 ${ isScrolled ? "py-1" : "py-2" } z-[100] bg-cream/90 backdrop-blur-xl border-b border-charcoal/[.06] transition-all duration-300`}>
                <Link href="/" className="flex items-center no-underline">
                <Image src="/images/logo_accent-removebg-preview.png" alt="Blockfuse Vintage" width={10} height={10}
                className="h-10 w-auto object-contain" style={{ height: "auto" }}
                />
                <span className="font-bebas text-[1.7rem] tracking-[0.12em] text-charcoal hidden">Blockfuse</span>
                </Link>

                <div className="hidden md:flex gap-10">
                {/* These sections don't have dedicated pages yet — anchored to home sections */}
                <Link href="/#new-collection" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">New Collection</Link>
                <Link href="/#men" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">Men</Link>
                <Link href="/#women" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">Women</Link>
                <Link href="/#about" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">About</Link>
                <Link href="/#contact" className="nav-link text-[0.75rem] tracking-wider2 uppercase text-charcoal no-underline">Contact</Link>
                </div>

                {/* <!-- Search bar (desktop) --> */}
                <div className="hidden md:flex items-center relative">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-44 lg:w-56 pl-3 pr-9 py-[0.45rem] text-[0.72rem] tracking-wider2 bg-transparent border border-charcoal/20 text-charcoal placeholder-warmgray outline-none focus:border-charcoal/60 focus:w-64 transition-all duration-300 font-barlow"
                />
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-warmgray hover:text-charcoal transition-colors duration-200">
                    <svg className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </button>
                </div>

                <div className="flex items-center gap-4 md:gap-5">
                {/* <!-- Search icon: mobile only --> */}
                <svg className="flex md:hidden w-[18px] h-[18px] stroke-charcoal fill-none" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>

                {/* <!-- Sign In button --> */}
                <Link href="/login" className="hidden md:inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.18em] uppercase text-charcoal border border-charcoal/30 px-4 py-2 no-underline hover:bg-charcoal hover:text-cream transition-all duration-200">
                    Sign In
                </Link>

                {/* <!-- Cart icon --> */}
                <Link href="/cart" aria-label="View cart" className="no-underline">
                  <svg className="w-[18px] h-[18px] stroke-charcoal fill-none" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </Link>

                <button id="hamburger" 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden flex flex-col gap-[5px] bg-transparent border-none p-0">
                    <Menu className="w-[22px] h-[22px] text-charcoal" />                        
                </button>
                </div>
            </nav>        
        </>
    )
}