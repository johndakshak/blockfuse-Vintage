'use client'

// app/product/[id]/page.tsx
//
// Product detail page. Fetches a single product by ID.
//
// Data flow:
//   User navigates to /product/42
//     ↓
//   Next.js passes params.id = "42"
//     ↓
//   useEffect → getProductById("42")
//     ↓
//   GET /product/42
//     ↓
//   Backend
//     ↓
//   setProduct()
//     ↓
//   UI renders product details
//
// "Add to Cart" button:
//   User clicks Add to Cart
//     ↓
//   addToCart(token, product.id, quantity)
//     ↓
//   POST /cart
//     ↓
//   Backend
//     ↓
//   Success/error feedback shown on the page

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProductById, type Product } from "@/app/lib/products";
import { addToCart } from "@/app/lib/cart";
import { useAuth } from "@/app/context/AuthContext";
import { AuthError } from "@/app/lib/auth";
import { fmt } from "@/app/components/cart/cartTypes";

// Next.js passes route params as a prop to page components.
// The folder is named [id] so params.id will be the string from the URL.
type Props = {
  params: { id: string };
};

export default function ProductDetailPage({ params }: Props) {
  const { token, clearAuth } = useAuth();
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────────────────
  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // How many the user wants to add — minimum 1, max = product.stock
  const [quantity, setQuantity] = useState(1);

  // Tracks whether the Add to Cart request is in flight
  const [adding, setAdding]     = useState(false);
  // Brief confirmation shown after a successful add
  const [added, setAdded]       = useState(false);
  // Error message from the add-to-cart request
  const [cartError, setCartError] = useState("");

  // ── Load product ──────────────────────────────────────────────────────────
  useEffect(() => {
    void (async () => {
      try {
        const response = await getProductById(params.id);
        setProduct(response.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Product not found.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  // ── Add to Cart ───────────────────────────────────────────────────────────
  async function handleAddToCart() {
    if (!product) return;

    // Redirect to login if not authenticated
    if (!token) {
      router.push("/login");
      return;
    }

    setAdding(true);
    setCartError("");

    try {
      await addToCart(token, product.id, quantity);
      setAdded(true);
      // Reset the "Added!" state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        clearAuth();
        router.push("/login");
        return;
      }
      setCartError(
        err instanceof Error ? err.message : "Could not add to cart."
      );
    } finally {
      setAdding(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function decreaseQty() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increaseQty() {
    if (!product) return;
    setQuantity((q) => Math.min(product.stock, q + 1));
  }

  // ── Render ────────────────────────────────────────────────────────────────
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

      <div className="pt-[80px] min-h-screen bg-cream">
        <div className="max-w-[1000px] mx-auto px-6 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[0.7rem] tracking-[0.12em] uppercase text-warmgray mb-8">
            <Link href="/" className="hover:text-charcoal transition-colors no-underline" style={{ color: "inherit" }}>Home</Link>
            <span className="opacity-40">/</span>
            <Link href="/products" className="hover:text-charcoal transition-colors no-underline" style={{ color: "inherit" }}>Products</Link>
            <span className="opacity-40">/</span>
            <span className="text-charcoal">{product?.name ?? "…"}</span>
          </div>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
              <div className="aspect-[3/4] bg-[#edeae3] rounded-xl" />
              <div className="space-y-4 pt-4">
                <div className="h-6 bg-charcoal/10 rounded w-2/3" />
                <div className="h-8 bg-charcoal/10 rounded w-1/3" />
                <div className="h-4 bg-charcoal/10 rounded w-full" />
                <div className="h-4 bg-charcoal/10 rounded w-3/4" />
                <div className="h-12 bg-charcoal/10 rounded w-full mt-6" />
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div className="text-center py-20">
              <p
                className="text-[0.9rem] font-barlow mb-4"
                style={{ color: "#b05c3a" }}
              >
                {error}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.12em] uppercase text-muted hover:text-charcoal transition-colors no-underline"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back to Products
              </Link>
            </div>
          )}

          {/* ── Product detail ── */}
          {!loading && !error && product && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

              {/* Left: image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#edeae3]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center">
                    <span className="font-bebas text-cream text-2xl tracking-[0.15em]">Sold Out</span>
                  </div>
                )}
              </div>

              {/* Right: details */}
              <div className="pt-2">
                <h1 className="font-cormorant text-[2rem] font-semibold text-charcoal leading-tight mb-3">
                  {product.name}
                </h1>

                <p className="font-cormorant text-[1.8rem] font-semibold text-charcoal mb-5">
                  {fmt(product.price)}
                </p>

                {/* Description */}
                {product.description && (
                  <p className="text-[0.85rem] text-muted font-barlow font-light leading-relaxed mb-6">
                    {product.description}
                  </p>
                )}

                {/* Stock info */}
                <div className="mb-6">
                  {product.stock === 0 ? (
                    <span
                      className="text-[0.75rem] font-barlow tracking-[0.1em] uppercase"
                      style={{ color: "#b05c3a" }}
                    >
                      Out of stock
                    </span>
                  ) : product.stock <= 5 ? (
                    <span
                      className="text-[0.75rem] font-barlow tracking-[0.1em] uppercase"
                      style={{ color: "#a8893e" }}
                    >
                      Only {product.stock} left in stock
                    </span>
                  ) : (
                    <span
                      className="text-[0.75rem] font-barlow tracking-[0.1em] uppercase"
                      style={{ color: "#4a9068" }}
                    >
                      In stock · {product.stock} available
                    </span>
                  )}
                </div>

                {/* Quantity picker */}
                {product.stock > 0 && (
                  <div className="mb-5">
                    <p className="text-[0.65rem] tracking-[0.18em] uppercase text-warmgray mb-2">
                      Quantity
                    </p>
                    <div className="flex items-center border border-charcoal/15 rounded-lg overflow-hidden w-fit">
                      <button
                        onClick={decreaseQty}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-[#f4f2ee] transition-colors bg-transparent border-none cursor-pointer text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-[0.9rem] font-medium border-x border-charcoal/15 leading-10">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQty}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center text-charcoal hover:bg-[#f4f2ee] transition-colors bg-transparent border-none cursor-pointer text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Cart error */}
                {cartError && (
                  <div
                    className="border rounded-xl px-4 py-3 text-sm mb-4 font-barlow"
                    style={{
                      background: "rgba(176,92,58,0.08)",
                      borderColor: "rgba(176,92,58,0.25)",
                      color: "#b05c3a",
                    }}
                    role="alert"
                  >
                    {cartError}
                  </div>
                )}

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  className="relative overflow-hidden w-full bg-charcoal hover:bg-charcoal/90 text-cream font-barlow font-semibold text-[0.78rem] tracking-[0.22em] uppercase py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <span className="relative">
                    {adding
                      ? "Adding…"
                      : added
                        ? "Added to Cart ✓"
                        : product.stock === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                  </span>
                </button>

                {/* View Cart link — shown after adding */}
                {added && (
                  <div className="mt-3 text-center">
                    <Link
                      href="/cart"
                      className="text-[0.75rem] tracking-[0.1em] uppercase font-barlow"
                      style={{ color: "#a8893e" }}
                    >
                      View Cart →
                    </Link>
                  </div>
                )}

                {/* Back link */}
                <div className="mt-6">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.12em] uppercase text-muted hover:text-charcoal transition-colors no-underline"
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to Products
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
