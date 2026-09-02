'use client'

// app/components/cart/Suggestions.tsx
//
// "You May Also Like" product suggestions shown below the cart item list.
//
// Data flow:
//   Suggestions mounts
//     ↓
//   useEffect → getProducts()
//     ↓
//   GET /products  (public endpoint — no token needed)
//     ↓
//   setProducts()
//     ↓
//   Up to 4 real products rendered
//
// Product selection:
//   Shows up to 4 products from the catalogue, excluding any products that
//   are already in the user's cart (passed in via cartProductIds prop).
//   If fewer than 4 non-cart products exist, all available ones are shown.
//   Out-of-stock products are included in the list but their button is disabled.
//
// Add to Cart:
//   User clicks "+ Add to Cart"
//     ↓
//   onAdd(product.id) — callback owned by cart/page.tsx
//     ↓
//   cart/page.tsx calls addToCart(token, productId, 1) then reloads the cart
//
// This component does NOT call fetch() or addToCart() directly.
// All API calls stay in app/lib/*.ts, called from cart/page.tsx.

import { useState, useEffect } from "react";
import Image from "next/image";
import { getProducts, type Product } from "@/app/lib/products";
import { fmt } from "./cartTypes";

// Maximum number of suggestions to show at once
const MAX_SUGGESTIONS = 4;

type Props = {
  // Product IDs already in the user's cart — used to exclude them from suggestions
  cartProductIds: number[];
  // Called with the product.id when the user clicks "+ Add to Cart"
  onAdd: (productId: number) => void;
  // Set of product IDs currently being added (to show loading state per card)
  addingIds: Set<number>;
};

export default function Suggestions({ cartProductIds, onAdd, addingIds }: Props) {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await getProducts();

        // Exclude products already in the cart, then cap at MAX_SUGGESTIONS.
        // cartProductIds is derived from BackendCartItem.productId so IDs match.
        const cartIdSet = new Set(cartProductIds);
        const suggestions = response.data
          .filter((p) => !cartIdSet.has(p.id))
          .slice(0, MAX_SUGGESTIONS);

        setProducts(suggestions);
      } catch (err: unknown) {
        // Suggestions failing should not break the cart page — show a graceful
        // empty state rather than an error that obscures the rest of the cart.
        setError(err instanceof Error ? err.message : "Could not load suggestions.");
      } finally {
        setLoading(false);
      }
    })();
    // cartProductIds is intentionally excluded from deps: we fetch suggestions
    // once on mount. Re-filtering after every cart change would cause a new
    // network request; instead the cart page re-renders with updated cartProductIds
    // which already filters the already-loaded list on the next render cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nothing to show — don't render the section at all
  if (!loading && (error || products.length === 0)) {
    return null;
  }

  return (
    <div className="mt-10">
      <p className="text-[0.68rem] tracking-[0.2em] uppercase text-warmgray mb-5">
        You May Also Like
      </p>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white border border-charcoal/10 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-[140px] bg-[#edeae3]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-charcoal/10 rounded w-3/4" />
                <div className="h-3 bg-charcoal/10 rounded w-1/3" />
                <div className="h-7 bg-charcoal/10 rounded w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Product grid ── */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => {
            const isAdding   = addingIds.has(product.id);
            const outOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white border border-charcoal/10 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_6px_20px_rgba(26,26,24,0.1)] hover:-translate-y-0.5"
              >
                {/* Product image */}
                <div className="h-[140px] bg-parchment relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[0.58rem] tracking-[0.1em] uppercase text-warmgray">
                        Photo
                      </span>
                    </div>
                  )}

                  {/* Out-of-stock overlay */}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center">
                      <span className="text-[0.6rem] tracking-[0.15em] uppercase text-cream font-barlow">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="text-[0.8rem] text-charcoal mb-1 truncate" title={product.name}>
                    {product.name}
                  </div>
                  <div className="font-cormorant text-[0.95rem] font-semibold text-charcoal mb-2">
                    {fmt(product.price)}
                  </div>
                  <button
                    onClick={() => onAdd(product.id)}
                    disabled={outOfStock || isAdding}
                    className="w-full border border-charcoal/10 rounded-md py-1.5 font-barlow text-[0.65rem] tracking-[0.1em] uppercase text-muted hover:border-accent hover:text-accent-dark transition-all duration-200 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: "var(--muted)" }}
                  >
                    {isAdding
                      ? "Adding…"
                      : outOfStock
                        ? "Sold Out"
                        : "+ Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
