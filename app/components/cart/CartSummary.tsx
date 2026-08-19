'use client'

import { useState } from "react";
import Link from "next/link";
import { fmt } from "./cartTypes";

const PROMO_CODES: Record<string, { type: "percent" | "shipping"; value: number; label: string }> = {
  VINTAGE10: { type: "percent",  value: 0.1,  label: "10% discount applied!" },
  FREESHIP:  { type: "shipping", value: 2500, label: "Free shipping applied!" },
};

const SHIPPING = 2500;

type Props = {
  subtotal: number;
  hasItems: boolean;
};

export default function CartSummary({ subtotal, hasItems }: Props) {
  const [promoCode, setPromoCode]   = useState("");
  const [promoMsg, setPromoMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [discount, setDiscount]     = useState(0);
  const [freeShip, setFreeShip]     = useState(false);
  const [applied, setApplied]       = useState(false);

  const shipping = hasItems ? (freeShip ? 0 : SHIPPING) : 0;
  const total    = Math.max(0, subtotal + shipping - discount);

  function applyPromo() {
    if (applied) {
      setPromoMsg({ text: "A promo code is already applied.", ok: false });
      return;
    }
    const promo = PROMO_CODES[promoCode.trim().toUpperCase()];
    if (!promo) {
      setPromoMsg({ text: "Invalid promo code. Try VINTAGE10.", ok: false });
      return;
    }
    if (promo.type === "percent") {
      setDiscount(Math.round(subtotal * promo.value));
    } else {
      setFreeShip(true);
      setDiscount(promo.value);
    }
    setApplied(true);
    setPromoMsg({ text: `✓ ${promo.label}`, ok: true });
  }

  return (
    <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden sticky top-20">
      {/* Header */}
      <div className="px-5 py-4 border-b border-charcoal/10">
        <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">Order Summary</span>
      </div>

      {/* Totals */}
      <div className="px-5 py-5 flex flex-col gap-3">
        <div className="flex justify-between text-[0.83rem] text-muted">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[0.83rem] text-muted">
          <span>Shipping</span>
          <span>
            {!hasItems ? "—" : freeShip
              ? <span style={{ color: "#a8893e" }} className="font-medium text-[0.8rem]">Free</span>
              : fmt(SHIPPING)
            }
          </span>
        </div>
        {applied && discount > 0 && (
          <div className="flex justify-between text-[0.83rem]" style={{ color: "#a8893e" }}>
            <span>Discount</span>
            <span>-{fmt(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-cormorant text-[1.3rem] font-semibold text-charcoal pt-3 border-t border-charcoal/10 mt-1">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>

      <div className="h-px bg-charcoal/10" />

      {/* Promo */}
      <div className="px-5 pt-4 pb-5">
        <p className="text-[0.65rem] tracking-[0.15em] uppercase text-warmgray mb-2">Promo Code</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code…"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPromo()}
            disabled={applied}
            className="flex-1 bg-cream border border-charcoal/10 rounded-lg px-3.5 py-2.5 font-barlow text-[0.82rem] text-charcoal placeholder-warmgray outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,169,110,0.12)] transition-all duration-200 disabled:opacity-50"
          />
          <button
            onClick={applyPromo}
            disabled={applied}
            className="bg-charcoal text-cream font-barlow text-[0.7rem] font-medium tracking-[0.1em] uppercase px-4 rounded-lg hover:bg-[#2c2c2a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            Apply
          </button>
        </div>
        {promoMsg && (
          <p
            className="text-[0.72rem] mt-1.5"
            style={{ color: promoMsg.ok ? "#a8893e" : "#b05c3a" }}
          >
            {promoMsg.text}
          </p>
        )}
      </div>

      <div className="h-px bg-charcoal/10" />

      {/* Checkout button */}
      <div className="px-5 pt-4 pb-5">
        <Link
          href={hasItems ? "/checkout" : "#"}
          className={`relative overflow-hidden w-full flex items-center justify-center gap-2 bg-charcoal text-cream font-barlow font-semibold text-[0.78rem] tracking-[0.2em] uppercase py-4 rounded-xl transition-all duration-200 no-underline group ${
            !hasItems ? "opacity-45 pointer-events-none" : "hover:bg-[#2c2c2a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(26,26,24,0.2)]"
          }`}
        >
          <span className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="relative">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
          <span className="relative">Proceed to Checkout</span>
        </Link>
        <div className="flex items-center justify-center gap-1.5 text-[0.68rem] text-warmgray mt-3 tracking-[0.06em]">
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Secure &amp; encrypted checkout
        </div>
      </div>
    </div>
  );
}
