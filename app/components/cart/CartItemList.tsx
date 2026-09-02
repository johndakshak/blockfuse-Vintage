import Image from "next/image";
import Link from "next/link";
import { type CartItem, fmt } from "./cartTypes";

type Props = {
  items: CartItem[];
  onChangeQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
};

export default function CartItemList({ items, onChangeQty, onRemove, onClear }: Props) {
  return (
    <div className="bg-white border border-charcoal/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/10">
        <span className="font-cormorant text-[1.05rem] font-semibold text-charcoal">Cart Items</span>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="font-barlow text-[0.7rem] tracking-[0.12em] uppercase text-warmgray hover:text-rust transition-colors bg-transparent border-none cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Items or empty state */}
      {items.length === 0 ? (
        <div className="py-16 px-6 text-center">
          <svg className="opacity-[0.18] mx-auto mb-5" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <h3 className="font-cormorant text-[1.5rem] font-semibold text-charcoal mb-2">Your cart is empty</h3>
          <p className="text-[0.82rem] text-muted mb-6">Looks like you haven&apos;t added any vintage pieces yet.</p>
          <Link
            href="/"
            className="inline-block bg-charcoal text-cream font-barlow font-semibold text-[0.75rem] tracking-[0.2em] uppercase px-8 py-3.5 rounded-xl no-underline transition-all duration-200 hover:bg-[#2c2c2a] hover:-translate-y-0.5"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        items.map((item, i) => (
          <div
            key={item.id}
            className="flex gap-5 px-6 py-5 border-b border-charcoal/[0.05] last:border-0 hover:bg-[#faf9f6] transition-colors"
            style={{ animation: `fadeUp 0.35s ease ${i * 0.05}s both` }}
          >
            {/* Product image — real Cloudinary URL from backend; fallback for missing */}
            <div className="w-[90px] h-[110px] rounded-xl bg-parchment border border-charcoal/10 flex-shrink-0 overflow-hidden relative">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="90px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[0.55rem] tracking-[0.1em] uppercase text-warmgray">Photo</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-[0.92rem] text-charcoal mb-0.5">{item.name}</div>
                  <div className="text-[0.73rem] text-muted">{item.meta}</div>
                  <div className="text-[0.75rem] text-warmgray mt-1">{fmt(item.price)} each</div>
                </div>
                <div className="font-cormorant text-[1.2rem] font-semibold text-charcoal whitespace-nowrap">
                  {fmt(item.price * item.qty)}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                {/* Qty control */}
                <div className="flex items-center border border-charcoal/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => onChangeQty(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-cream transition-colors bg-transparent border-none cursor-pointer text-lg"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-[0.85rem] font-medium border-x border-charcoal/10 leading-8">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => onChangeQty(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-cream transition-colors bg-transparent border-none cursor-pointer text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemove(item.id)}
                  className="flex items-center gap-1.5 font-barlow text-[0.7rem] tracking-[0.1em] uppercase text-warmgray hover:text-rust transition-colors bg-transparent border-none cursor-pointer"
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Continue shopping */}
      <div className="px-6 py-4 border-t border-charcoal/10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.12em] uppercase text-muted hover:text-charcoal transition-colors no-underline"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
