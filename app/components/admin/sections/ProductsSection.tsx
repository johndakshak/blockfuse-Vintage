'use client'

// app/components/admin/sections/ProductsSection.tsx
//
// Admin Products management section.
// Replaces the previous hardcoded mock data with real backend API calls.
//
// Data flow:
//   ProductsSection mounts
//     ↓
//   useEffect → getProducts()
//     ↓
//   GET /products
//     ↓
//   setProducts()
//     ↓
//   Real product table renders
//
// CRUD operations:
//   createProduct()  → POST /product  (multipart/form-data)
//   updateProduct()  → PATCH /product/:id  (multipart/form-data)
//   deleteProduct()  → DELETE /product/:id

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "@/app/lib/products";
import { fmt } from "@/app/components/cart/cartTypes";
import { Badge } from "./DashboardSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const thClass = "text-[0.62rem] font-medium tracking-[0.18em] uppercase text-warmgray px-5 py-3 text-left bg-[#f4f2ee] border-b border-charcoal/[0.09]";
const tdClass = "px-5 py-3.5 text-[0.83rem] text-charcoal border-b border-charcoal/[0.04]";
const inputCls = "w-full border border-charcoal/15 rounded-lg px-3 py-2 text-[0.83rem] font-barlow text-charcoal bg-[#faf9f6] outline-none focus:border-accent transition-colors";
const labelCls = "block text-[0.65rem] tracking-[0.15em] uppercase text-warmgray mb-1 font-barlow";

function stockStatusBadge(stock: number): { label: string; className: string } {
  if (stock === 0)  return { label: "Out of Stock", className: "bg-[rgba(154,150,144,0.12)] text-[#7a776f]" };
  if (stock <= 3)   return { label: "Low Stock",    className: "bg-[rgba(176,92,58,0.1)]   text-[#b05c3a]" };
  return               { label: "Active",         className: "bg-[rgba(74,144,104,0.1)]  text-[#3a7a5c]" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Product Form (shared by Add + Edit) ─────────────────────────────────────

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageFile: File | null;
  imagePreview: string;
};

const emptyForm: ProductFormState = {
  name: "", description: "", price: "", stock: "", imageFile: null, imagePreview: "",
};

type ProductFormProps = {
  title: string;
  initial: ProductFormState;
  submitting: boolean;
  error: string;
  onSubmit: (form: ProductFormState) => void;
  onCancel: () => void;
};

function ProductForm({ title, initial, submitting, error, onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(initial);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  }

  return (
    <div className="fixed inset-0 bg-charcoal/40 z-[900] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(26,26,24,0.15)] w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1.1rem] font-semibold text-charcoal">{title}</span>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-[#f4f2ee] flex items-center justify-center text-muted hover:text-charcoal cursor-pointer"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div
              className="border rounded-lg px-3 py-2.5 text-[0.78rem] font-barlow"
              style={{ background: "rgba(176,92,58,0.08)", borderColor: "rgba(176,92,58,0.25)", color: "#b05c3a" }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className={labelCls}>Product Name *</label>
            <input
              type="text" placeholder="e.g. Vintage Denim Jacket"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={2} placeholder="Short product description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Price (₦) *</label>
              <input
                type="number" min="0" placeholder="4500"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Stock *</label>
              <input
                type="number" min="0" placeholder="5"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className={labelCls}>
              Product Image {title.startsWith("Add") ? "*" : "(leave empty to keep current)"}
            </label>
            {/* Preview */}
            {form.imagePreview && (
              <div className="relative w-full h-[140px] rounded-lg overflow-hidden mb-2 bg-[#f4f2ee]">
                <Image src={form.imagePreview} alt="Preview" fill className="object-cover" sizes="480px" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border border-dashed border-charcoal/20 rounded-lg py-3 text-[0.75rem] text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer bg-transparent font-barlow"
            >
              {form.imageFile ? form.imageFile.name : "Click to select image (jpg, png, webp)"}
            </button>
            <input
              ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleImage}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-charcoal/[0.09]">
          <button
            onClick={onCancel}
            className="flex-1 border border-charcoal/15 rounded-lg py-2.5 font-barlow text-[0.75rem] tracking-[0.12em] uppercase text-muted hover:border-charcoal hover:text-charcoal transition-all cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={submitting}
            className="flex-1 bg-charcoal text-cream font-barlow font-semibold text-[0.75rem] tracking-[0.12em] uppercase py-2.5 rounded-lg hover:bg-[#2c2c2a] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-none"
          >
            {submitting ? "Saving…" : title.startsWith("Add") ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ProductsSection ──────────────────────────────────────────────────────────

export default function ProductsSection() {
  const { token } = useAuth();

  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Modal state
  const [showAdd, setShowAdd]     = useState(false);
  const [addError, setAddError]   = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editError, setEditError]   = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Load products ────────────────────────────────────────────────────────
  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add product ──────────────────────────────────────────────────────────
  async function handleAdd(form: ProductFormState) {
    if (!token) return;
    setAddError("");

    if (!form.name.trim())  { setAddError("Product name is required."); return; }
    if (!form.price)        { setAddError("Price is required."); return; }
    if (!form.stock)        { setAddError("Stock is required."); return; }
    if (!form.imageFile)    { setAddError("Product image is required."); return; }

    setAddSaving(true);
    try {
      await createProduct(
        {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price: Number(form.price),
          stock: Number(form.stock),
          image: form.imageFile,
        },
        token
      );
      setShowAdd(false);
      await loadProducts();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Could not create product.");
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit product ─────────────────────────────────────────────────────────
  async function handleEdit(form: ProductFormState) {
    if (!token || !editTarget) return;
    setEditError("");

    setEditSaving(true);
    try {
      await updateProduct(
        editTarget.id,
        {
          name: form.name.trim() || undefined,
          description: form.description.trim() || undefined,
          price: form.price ? Number(form.price) : undefined,
          stock: form.stock ? Number(form.stock) : undefined,
          image: form.imageFile ?? undefined,
        },
        token
      );
      setEditTarget(null);
      await loadProducts();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Could not update product.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete product ───────────────────────────────────────────────────────
  async function handleDelete(product: Product) {
    if (!token) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeletingId(product.id);
    try {
      await deleteProduct(product.id, token);
      await loadProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cormorant text-[1.4rem] font-semibold text-charcoal">Products</h2>
        <button
          onClick={() => { setAddError(""); setShowAdd(true); }}
          className="font-barlow text-[0.72rem] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-lg bg-charcoal text-cream hover:bg-[#2c2c2a] transition-colors cursor-pointer border-none"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white border border-charcoal/[0.09] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/[0.09]">
          <span className="font-cormorant text-[1rem] font-semibold text-charcoal">All Products</span>
          {!loading && !error && (
            <span className="text-[0.72rem] text-muted font-barlow">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin" width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="#c8a96e" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="10" stroke="#c8a96e" strokeOpacity={0.15} strokeWidth={1.5} />
              </svg>
              <span className="font-barlow text-[0.75rem] tracking-[0.12em] uppercase text-warmgray">
                Loading products…
              </span>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="px-5 py-4">
            <div
              className="border rounded-lg px-4 py-3 text-[0.82rem] font-barlow"
              style={{ background: "rgba(176,92,58,0.08)", borderColor: "rgba(176,92,58,0.25)", color: "#b05c3a" }}
              role="alert"
            >
              {error}
            </div>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && products.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[0.82rem] text-muted font-barlow">No products yet.</p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Product", "Price", "Stock", "Status", "Added", "Actions"].map((h) => (
                    <th key={h} className={thClass}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const badge = stockStatusBadge(p.stock);
                  const isDeleting = deletingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-[#faf9f6] transition-colors last:[&>td]:border-0">
                      {/* Product name + image */}
                      <td className={tdClass}>
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            <div className="w-[38px] h-[38px] rounded-lg overflow-hidden bg-[#f4f2ee] border border-charcoal/[0.09] flex-shrink-0 relative">
                              <Image
                                src={p.imageUrl} alt={p.name} fill
                                className="object-cover" sizes="38px"
                              />
                            </div>
                          ) : (
                            <div className="w-[38px] h-[38px] rounded-lg bg-[#f4f2ee] border border-charcoal/[0.09] flex items-center justify-center text-[0.55rem] text-warmgray flex-shrink-0">
                              IMG
                            </div>
                          )}
                          <span className="truncate max-w-[160px]">{p.name}</span>
                        </div>
                      </td>
                      <td className={`${tdClass} font-medium`}>{fmt(p.price)}</td>
                      <td className={tdClass}>{p.stock}</td>
                      <td className={tdClass}>
                        <Badge label={badge.label} className={badge.className} />
                      </td>
                      <td className={`${tdClass} text-warmgray`}>{formatDate(p.createdAt)}</td>
                      {/* Actions */}
                      <td className={tdClass}>
                        <div className="flex gap-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditError("");
                              setEditTarget(p);
                            }}
                            disabled={isDeleting}
                            className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-accent transition-all text-muted hover:text-charcoal disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Edit product"
                          >
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={isDeleting}
                            className="w-7 h-7 rounded-md border border-charcoal/[0.09] bg-white flex items-center justify-center cursor-pointer hover:border-rust transition-all text-muted hover:text-rust disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete product"
                          >
                            {isDeleting ? (
                              <svg className="animate-spin" width="10" height="10" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={2} />
                              </svg>
                            ) : (
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Product Modal ── */}
      {showAdd && (
        <ProductForm
          title="Add Product"
          initial={emptyForm}
          submitting={addSaving}
          error={addError}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* ── Edit Product Modal ── */}
      {editTarget && (
        <ProductForm
          title="Edit Product"
          initial={{
            name: editTarget.name,
            description: editTarget.description ?? "",
            price: String(editTarget.price),
            stock: String(editTarget.stock),
            imageFile: null,
            imagePreview: editTarget.imageUrl,
          }}
          submitting={editSaving}
          error={editError}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
