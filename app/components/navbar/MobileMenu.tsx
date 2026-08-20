'use client'

import { X } from "lucide-react"
import Link from "next/link"

type MobileMenuProps = {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({isOpen, onClose}: MobileMenuProps) {

    return (
        <>
            <div 
                id="mobileMenu" 
                className={`fixed inset-0 bg-charcoal z-[200] flex flex-col justify-center items-center gap-6 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                <button 
                    id="mobileClose" 
                    onClick={onClose}
                    className={`absolute top-5 right-6 bg-transparent border-none text-cream text-3xl leading-none`}>
                        <X className="w-8 h-8 text-cream" />                        
                    </button>
                    {/* Category links anchor to home page sections */}
                    <Link href="/#new-collection" onClick={onClose} className="font-bebas text-4xl sm:text-5xl tracking-widest text-cream hover:text-accent transition-colors duration-200">New Collection</Link>
                    <Link href="/#men" onClick={onClose} className="font-bebas text-4xl sm:text-5xl tracking-widest text-cream hover:text-accent transition-colors duration-200">Men</Link>
                    <Link href="/#women" onClick={onClose} className="font-bebas text-4xl sm:text-5xl tracking-widest text-cream hover:text-accent transition-colors duration-200">Women</Link>
                    <Link href="/#accessories" onClick={onClose} className="font-bebas text-4xl sm:text-5xl tracking-widest text-cream hover:text-accent transition-colors duration-200">Accessories</Link>
                    <Link href="/#about" onClick={onClose} className="font-bebas text-4xl sm:text-5xl tracking-widest text-cream hover:text-accent transition-colors duration-200">About</Link>
                    <Link href="/#contact" onClick={onClose} className="font-bebas text-4xl sm:text-5xl tracking-widest text-cream hover:text-accent transition-colors duration-200">Contact</Link>
                    <Link href="/login" onClick={onClose} className="font-bebas text-4xl sm:text-5xl tracking-widest text-accent hover:text-cream transition-colors duration-200">Sign In</Link>
            </div>        
        </>
    )
}