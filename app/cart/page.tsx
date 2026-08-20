'use client'

import { useState } from "react";
import Link from "next/link";
import CartItemList from "../components/cart/CartItemList";
import CartSummary from "../components/cart/CartSummary";
import Suggestions from "../components/cart/Suggestions";
import { type CartItem } from "../components/cart/cartTypes";

const INITIAL_CART: CartItem[] = [
  { id: 1, name: "1970s Suede Jacket",  meta: "Size M · Tan",     price: 38000, qty: 1 },
  { id: 2, name: "Floral Wrap Dress",   meta: "Size S · Ivory",   price: 22500, qty: 2 },
  { id: 3, name: "Corduroy Cap",        meta: "One Size · Brown",  price: 7000,  qty: 1 },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    if (!confirm("Remove all items from your cart?")) return;
    setCart([]);
  }

  function addSuggestion(name: string, price: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing) {
        return prev.map((i) => i.name === name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: Date.now(), name, meta: "One Size", price, qty: 1 }];
    });
  }

  return (
    <>
      {/* Accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      {/* Nav */}
      <nav className="fixed top-[3px] left-0 right-0 h-[60px] bg-cream/95 backdrop-blur-xl border-b border-charcoal/[0.07] flex items-center justify-between px-8 z-[500]">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[34px] h-[34px] rounded-full border-2 border-accent bg-charcoal flex items-center justify-center flex-shrink-0">
            <span className="font-cormorant text-accent text-[0.85rem] font-semibold">BV</span>
          </div>
          <div className="font-bebas text-[1.2rem] tracking-[0.1em] text-charcoal leading-none">
            Blockfuse
            <sub className="block font-barlow font-light text-[0.5rem] tracking-[0.25em] uppercase text-warmgray leading-none" style={{ verticalAlign: "baseline" }}>
              Vintage
            </sub>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "New Collection", href: "/#new-collection" },
            { label: "Men",            href: "/#men" },
            { label: "Women",          href: "/#women" },
            { label: "Accessories",    href: "/#accessories" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[0.72rem] tracking-[0.15em] uppercase text-muted hover:text-charcoal transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Cart indicator */}
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-[0.72rem] tracking-[0.15em] uppercase no-underline font-medium"
          style={{ color: "#a8893e" }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Cart ({itemCount})
        </Link>
      </nav>

      {/* Page */}
      <div className="pt-[80px] min-h-screen bg-cream">
        <div className="max-w-[1100px] mx-auto px-6 py-10">

          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.12em] uppercase text-warmgray mb-3">
              <Link href="/" className="hover:text-accent-dark transition-colors no-underline" style={{ color: "inherit" }}>Home</Link>
              <span className="opacity-40">/</span>
              <span className="text-charcoal">Cart</span>
            </div>
            <h1 className="font-cormorant text-[2rem] font-semibold text-charcoal">Your Cart</h1>
            <p className="text-[0.82rem] text-muted mt-1">
              {itemCount > 0
                ? `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`
                : "Your cart is empty"}
            </p>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

            {/* Left: items + suggestions */}
            <div>
              <CartItemList
                items={cart}
                onChangeQty={changeQty}
                onRemove={removeItem}
                onClear={clearCart}
              />
              <Suggestions onAdd={addSuggestion} />
            </div>

            {/* Right: summary */}
            <CartSummary subtotal={subtotal} hasItems={cart.length > 0} />
          </div>
        </div>
      </div>
    </>
  );
}
