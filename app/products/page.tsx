'use client'

// app/products/page.tsx
//
// Full product catalogue page — lists every product from GET /products.
//
// Data flow:
//   ProductsPage mounts
//     ↓
//   useEffect → getProducts()
//     ↓
//   GET /products
//     ↓
//   Backend
//     ↓
//   setProducts()
//     ↓
//   Product grid renders real data
//
// Each card links to /product/[id] for full details.
// "Add to Cart" calls addToCart() → POST /cart.

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProducts, type Product } from "@/app/lib/products";
import { addToCart } from "@/app/lib/cart";
import { useAuth } from "@/app/context/AuthContext";
import { fmt } from "@/app/components/cart/cartTypes";

type CardState = {
  loading: boolean;
  added: boolean;
  error: string;
};

export default function ProductsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [cardStates, setCardStates] = useState<Record<number, CardState>>({});

  // Load all products on mount
  useEffect(() => {
    void (async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Could not load products."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Add a product to the cart
  async function handleAddToCart(product: Product) {
    if (!token) {
      router.push("/login");
      return;
    }

    setCardStates((prev) => ({
      ...prev,
      [product.id]: { loading: true, added: false, error: "" },
    }));

    try {
      await addToCart(token, product.id, 1);
      setCardStates((prev) => ({
        ...prev,
        [product.id]: { loading: false, added: true, error: "" },
      }));
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
      setTimeout(() => {
        setCardStates((prev) => ({
          ...prev,
          [product.id]: { loading: false, added: false, error: "" },
        }));
      }, 3000);
    }
  }

  return (
    <>
      {/* Accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      {/* Slim nav */}
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
          Cart
        </Link>
      </nav>

      {/* Page */}
      <div className="pt-[80px] min-h-screen bg-cream">
        <div className="max-w-[1100px] mx-auto px-6 py-10">

          {/* Breadcrumb + header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.12em] uppercase text-warmgray mb-3">
              <Link href="/" className="hover:text-charcoal transition-colors no-underline" style={{ color: "inherit" }}>
                Home
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-charcoal">All Products</span>
            </div>
            <h1 className="font-cormorant text-[2rem] font-semibold text-charcoal">All Products</h1>
            <p className="text-[0.82rem] text-muted mt-1">
              {loading
                ? "Loading…"
                : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-[#edeae3] animate-pulse rounded-lg overflow-hidden">
                  <div className="aspect-[3/4]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-charcoal/10 rounded w-3/4" />
                    <div className="h-3 bg-charcoal/10 rounded w-1/3" />
                    <div className="h-8 bg-charcoal/10 rounded w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div
              className="border rounded-xl px-5 py-4 text-sm font-barlow"
              style={{
                background: "rgba(176,92,58,0.08)",
                borderColor: "rgba(176,92,58,0.25)",
                color: "#b05c3a",
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && products.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[0.82rem] text-warmgray mb-4">
                No products in the catalogue yet.
              </p>
              <Link
                href="/"
                className="inline-block text-[0.72rem] tracking-[0.15em] uppercase text-accent hover:underline"
              >
                Back to home
              </Link>
            </div>
          )}

          {/* ── Product grid ── */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => {
                const cs = cardStates[product.id];
                return (
                  <div
                    key={product.id}
                    className="relative overflow-hidden bg-[#edeae3] group rounded-lg"
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

                    {/* Image */}
                    <Link href={`/product/${product.id}`} className="block overflow-hidden aspect-[3/4] relative">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </Link>

                    {/* Info + Add to Cart */}
                    <div className="p-3">
                      <Link href={`/product/${product.id}`} className="block no-underline mb-2">
                        <h4 className="text-[0.82rem] sm:text-[0.85rem] tracking-[0.06em] font-normal mb-1 text-charcoal line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="font-cormorant text-[1rem] font-semibold text-charcoal">
                          {fmt(product.price)}
                        </p>
                      </Link>

                      {/* Per-card error */}
                      {cs?.error && (
                        <p className="text-[0.68rem] mb-1.5 font-barlow" style={{ color: "#b05c3a" }}>
                          {cs.error}
                        </p>
                      )}

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0 || cs?.loading}
                        className="w-full border border-charcoal/15 rounded-lg py-2 font-barlow text-[0.68rem] tracking-[0.12em] uppercase text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-200 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cs?.loading
                          ? "Adding…"
                          : cs?.added
                            ? "Added ✓"
                            : product.stock === 0
                              ? "Sold Out"
                              : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
