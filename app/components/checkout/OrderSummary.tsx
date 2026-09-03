// app/components/checkout/OrderSummary.tsx
//
// Displays the order summary on the right side of the Checkout page.
//
// Previously this component had a hardcoded CART_ITEMS array.
// It now receives real cart data through props from the Checkout page,
// which fetches it via getCartItems() on mount.

import Image from "next/image";
import Link from "next/link";
import { type CartItem, fmt } from "@/app/components/cart/cartTypes";

type Props = {
  // The user's real cart items (fetched from GET /cartItems)
  items: CartItem[];
  // The server-calculated subtotal from GET /cartItems (totalPrice field)
  cartTotal: number;
  // The shipping cost selected on the Checkout page
  shipCost: number;
};

export default function OrderSummary({ items, cartTotal, shipCost }: Props) {
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const grandTotal = cartTotal + shipCost;

  return (
    <div className="sticky top-20">
      {/* Summary card */}
      <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/10">
          <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">Order Summary</span>
          <Link
            href="/cart"
            className="text-[0.68rem] tracking-[0.1em] uppercase transition-opacity hover:opacity-70"
            style={{ color: "#a8893e" }}
          >
            Edit Cart
          </Link>
        </div>

        {/* Items */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <p className="text-[0.82rem] text-warmgray text-center py-4">
              Your cart is empty.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                {/* Product image — real Cloudinary URL from backend; fallback for missing */}
                <div className="relative w-[52px] h-[62px] rounded-lg bg-parchment border border-charcoal/10 flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="52px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[0.5rem] text-warmgray uppercase tracking-wider text-center leading-tight">
                        Photo
                      </span>
                    </div>
                  )}
                  <span className="absolute -top-1.5 -right-1.5 bg-charcoal text-cream text-[0.55rem] font-bold w-4 h-4 rounded-full flex items-center justify-center z-10">
                    {item.qty}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.82rem] text-charcoal leading-snug">{item.name}</div>
                  <div className="text-[0.7rem] text-muted mt-0.5">{item.meta}</div>
                </div>
                <div className="font-cormorant text-[1rem] font-semibold text-charcoal whitespace-nowrap ml-auto">
                  {fmt(item.price * item.qty)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="px-5 py-4 border-t border-charcoal/10 flex flex-col gap-2">
          <div className="flex justify-between text-[0.82rem] text-muted">
            <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
            <span>{fmt(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-[0.82rem] text-muted">
            <span>Shipping</span>
            <span>{shipCost === 0 ? "Free" : fmt(shipCost)}</span>
          </div>
          <div className="flex justify-between font-cormorant text-[1.2rem] font-semibold text-charcoal pt-2 border-t border-charcoal/10 mt-1">
            <span>Total</span>
            <span>{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-3 bg-white border border-charcoal/10 rounded-2xl px-5 py-4 flex flex-col gap-3">
        {[
          { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, text: "Secure & encrypted payment" },
          { icon: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>, text: "Free returns within 14 days" },
          { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.21 2 2 0 012.11-.02h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-.64a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0121 15.73v.19z" />, text: "24/7 customer support" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3 text-[0.78rem] text-muted">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#c8a96e" strokeWidth={1.8}>
              {icon}
            </svg>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
