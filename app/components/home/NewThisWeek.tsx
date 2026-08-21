'use client'

// app/components/home/NewThisWeek.tsx
//
// Displays the four most recently added products from the backend.
//
// Data flow:
//   NewThisWeek mounts
//     ↓
//   useEffect → getProducts()
//     ↓
//   GET /products
//     ↓
//   Backend
//     ↓
//   setProducts()
//     ↓
//   Product cards render real data
//
// "Quick Add" button:
//   User clicks Quick Add
//     ↓
//   addToCart(token, product.id, 1)
//     ↓
//   POST /cart
//     ↓
//   Backend
//     ↓
//   Brief success/error feedback shown on the card

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProducts, type Product } from "@/app/lib/products";
import { addToCart } from "@/app/lib/cart";
import { useAuth } from "@/app/context/AuthContext";
import { fmt } from "@/app/components/cart/cartTypes";

// One entry per card: tracks whether "Quick Add" is loading or just succeeded
type CardState = {
  loading: boolean;
  added: boolean;
  error: string;
};

const delays = ["reveal-d1", "reveal-d2", "reveal-d3", "reveal-d4"];

export default function NewThisWeek() {
  const { token } = useAuth();
  const router = useRouter();

  // ── State ────────────────────────────────────────────────────────────────
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  // Per-card state: keyed by product.id
  const [cardStates, setCardStates] = useState<Record<number, CardState>>({});

  // ── Load products ────────────────────────────────────────────────────────
  useEffect(() => {
    void (async () => {
      try {
        const response = await getProducts();
        // Show the 4 most recently added products (the API returns them in
        // insertion order — we take the last 4 so this section always shows
        // the newest items).
        const newest = response.data.slice(-4);
        setProducts(newest);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Could not load products."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Quick Add to Cart ────────────────────────────────────────────────────
  async function handleQuickAdd(product: Product) {
    // If the user is not logged in, redirect to login
    if (!token) {
      router.push("/login");
      return;
    }

    // Mark this card as loading
    setCardStates((prev) => ({
      ...prev,
      [product.id]: { loading: true, added: false, error: "" },
    }));

    try {
      await addToCart(token, product.id, 1);
      // Show a brief "Added!" confirmation on the card
      setCardStates((prev) => ({
        ...prev,
        [product.id]: { loading: false, added: true, error: "" },
      }));
      // Reset the card back to normal after 2 seconds
      setTimeout(() => {
        setCardStates((prev) => ({
          ...prev,
          [product.id]: { loading: false, added: false, error: "" },
        }));
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not add to cart.";
      setCardStates((prev) => ({
        ...prev,
        [product.id]: { loading: false, added: false, error: msg },
      }));
      // Clear the error after 3 seconds
      setTimeout(() => {
        setCardStates((prev) => ({
          ...prev,
          [product.id]: { loading: false, added: false, error: "" },
        }));
      }, 3000);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section id="new-collection" className="px-4 sm:px-6 md:px-14 py-16 md:py-20">
      <div className="reveal flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 md:mb-10 pb-4 border-b border-charcoal/10 gap-1">
        <h2 className="font-bebas text-[clamp(2rem,5vw,4rem)] tracking-[0.04em] leading-none">
          New This Week
        </h2>
        <span className="text-[0.65rem] tracking-[0.25em] uppercase text-warmgray">
          01 / Featured
        </span>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-[#edeae3] animate-pulse">
              <div className="aspect-[3/4]" />
              <div className="pt-3 pb-2 px-1 space-y-2">
                <div className="h-3 bg-charcoal/10 rounded w-3/4" />
                <div className="h-3 bg-charcoal/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <p className="text-[0.82rem] text-center py-10" style={{ color: "#b05c3a" }}>
          {error}
        </p>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && products.length === 0 && (
        <p className="text-[0.82rem] text-center text-warmgray py-10">
          No products available yet.
        </p>
      )}

      {/* ── Product grid ── */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {products.map((product, i) => {
              const cs = cardStates[product.id];
              return (
                <div
                  key={product.id}
                  className={`reveal ${delays[i]} relative overflow-hidden bg-[#edeae3] group`}
                >
                  {/* Stock badge */}
                  {product.stock === 0 && (
                    <span className="absolute top-3 left-3 z-10 bg-charcoal/60 text-cream text-[0.6rem] tracking-[0.2em] uppercase px-2 py-1">
                      Sold Out
                    </span>
                  )}
                  {product.stock > 0 && product.stock <= 3 && (
                    <span className="absolute top-3 left-3 z-10 bg-accent text-cream text-[0.6rem] tracking-[0.2em] uppercase px-2 py-1">
                      Only {product.stock} left
                    </span>
                  )}

                  {/* Product image — links to detail page */}
                  <Link href={`/product/${product.id}`} className="block overflow-hidden aspect-[3/4] relative">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </Link>

                  {/* Quick Add overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/25 transition-all duration-300 flex items-end justify-center pb-5 z-10 pointer-events-none">
                    <button
                      onClick={() => handleQuickAdd(product)}
                      disabled={product.stock === 0 || cs?.loading}
                      className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cream text-charcoal border-none px-5 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                    >
                      {cs?.loading
                        ? "Adding…"
                        : cs?.added
                          ? "Added ✓"
                          : cs?.error
                            ? "Failed"
                            : product.stock === 0
                              ? "Sold Out"
                              : "Quick Add"}
                    </button>
                  </div>

                  {/* Name + price — links to detail page */}
                  <Link href={`/product/${product.id}`} className="block pt-3 pb-2 px-1 no-underline">
                    <h4 className="text-[0.82rem] sm:text-[0.85rem] tracking-[0.06em] font-normal mb-1 text-charcoal">
                      {product.name}
                    </h4>
                    <p className="text-[0.78rem] sm:text-[0.8rem] text-warmgray">
                      {fmt(product.price)}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="reveal mt-8 md:mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 text-[0.72rem] tracking-wider3 uppercase text-charcoal bg-transparent px-8 md:px-10 py-[0.9rem] no-underline border border-charcoal transition-all duration-300 hover:bg-charcoal hover:text-cream w-fit"
            >
              View All Products
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
