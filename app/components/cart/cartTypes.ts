// app/components/cart/cartTypes.ts
//
// Type definitions for the Cart feature.
//
// Two categories of types live here:
//
//   1. Backend types  — the exact shape the backend API returns
//   2. Display types  — the flattened shape the UI components consume
//
// The cart page maps backend types → display types so that CartItemList
// and CartSummary don't have to know about the nested API response structure.

// ─── Backend types ────────────────────────────────────────────────────────────

// The Product object nested inside each CartItem from the backend
export type BackendProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string;
  stock: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

// The CartItem shape returned by GET /cartItems
export type BackendCartItem = {
  id: number;           // cart item ID — used for PATCH /cart/:id and DELETE /cart/:id
  quantity: number;     // how many of this product are in the cart
  userId: number;
  productId: number;
  product: BackendProduct;
  createdAt: string;
  updatedAt: string;
};

// The full response from GET /cartItems
export type GetCartItemsResponse = {
  success: true;
  msg: string;
  totalPrice: number;   // server-calculated sum of (quantity × product.price)
  data: BackendCartItem[];
};

// The response from POST /cart (adding an item)
export type AddToCartResponse = {
  success: true;
  msg: string;
  data: BackendCartItem;
};

// The response from PATCH /cart/:id (updating quantity)
export type UpdateCartItemResponse = {
  success: true;
  msg: string;
  data: BackendCartItem;
};

// Generic error shape the backend sends on failure
export type CartErrorResponse = {
  success: false;
  msg: string;
  reason?: string;
};

// ─── Display types ────────────────────────────────────────────────────────────

// The flattened shape that CartItemList and CartSummary use.
// We map BackendCartItem → CartItem when we receive data from the API.
export type CartItem = {
  id: number;           // cart item ID (used for PATCH and DELETE)
  productId: number;    // the product's own ID — used to exclude from Suggestions
  name: string;         // product.name
  meta: string;         // e.g. "In stock · 5 left" — derived from product.stock
  price: number;        // product.price
  qty: number;          // quantity
  imageUrl: string;     // product.imageUrl — Cloudinary URL for the product photo
};

// ─── Helper ───────────────────────────────────────────────────────────────────

// Format a number as Nigerian Naira: ₦38,000
export const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");

// Map a backend cart item to the flat display shape
export function toDisplayItem(item: BackendCartItem): CartItem {
  return {
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    meta: item.product.stock > 0
      ? `In stock · ${item.product.stock} left`
      : "Out of stock",
    price: item.product.price,
    qty: item.quantity,
    imageUrl: item.product.imageUrl,
  };
}
