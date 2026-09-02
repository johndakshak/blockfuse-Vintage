// app/lib/cart.ts
//
// This file contains all the API functions for the Cart feature.
// Responsibility: make the HTTP request, return the data (or throw an error).
//
// The Cart page calls these functions — it does NOT call fetch() itself.
// This follows the same pattern as app/lib/auth.ts.
//
// Pattern:
//   Cart page  →  cart.ts  →  fetch()  →  Backend
//
// 401 handling:
//   Every authenticated cart function checks for HTTP 401 before parsing
//   the response body. A 401 throws AuthError (from auth.ts), which the
//   calling page catches to clear the session and redirect to /login.
//
// 403 handling:
//   403 Forbidden is thrown as a plain Error — the session is NOT cleared
//   because the token is valid; the user simply lacks permission for that item.

import { AuthError } from "@/app/lib/auth";
import type {
  GetCartItemsResponse,
  AddToCartResponse,
  UpdateCartItemResponse,
  CartErrorResponse,
} from "@/app/components/cart/cartTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Get Cart Items ───────────────────────────────────────────────────────────
//
// Calls GET /cartItems with the user's JWT token.
// Returns all items in the user's cart, each with the nested product details.
// Also returns the server-calculated totalPrice.
//
// Throws AuthError  if the token is invalid/expired (401).
// Throws plain Error if anything else goes wrong.

export async function getCartItems(token: string): Promise<GetCartItemsResponse> {
  const response = await fetch(`${API_URL}/cartItems`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 401 — session invalid/expired
  if (response.status === 401) {
    throw new AuthError();
  }

  const data: GetCartItemsResponse | CartErrorResponse = await response.json();

  // The backend returns 404 with success: false when the cart is empty.
  // We treat that as an empty cart, not a real error — so we return a
  // valid empty response instead of throwing.
  if (!data.success) {
    if (response.status === 404) {
      // Cart is empty — return a valid empty response
      return { success: true, msg: "Cart is empty", totalPrice: 0, data: [] };
    }
    throw new Error((data as CartErrorResponse).msg || "Could not load cart.");
  }

  return data as GetCartItemsResponse;
}

// ─── Add To Cart ──────────────────────────────────────────────────────────────
//
// Calls POST /cart with a productId and quantity.
//
// Request body (from OpenAPI spec):
//   { productId: number, quantity: number }
//
// If the product is already in the cart the backend increments the quantity
// (upsert behaviour — you do NOT need to check first).
//
// Throws AuthError  if unauthenticated (401) — session should be cleared.
// Throws plain Error if productId/quantity invalid (400), product not found (404),
//   or quantity exceeds stock (409).

export async function addToCart(
  token: string,
  productId: number,
  quantity: number
): Promise<AddToCartResponse> {
  const response = await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  // 401 — session invalid/expired
  if (response.status === 401) {
    throw new AuthError();
  }

  const data: AddToCartResponse | CartErrorResponse = await response.json();

  if (!data.success) {
    throw new Error((data as CartErrorResponse).msg || "Could not add item to cart.");
  }

  return data as AddToCartResponse;
}

// ─── Update Cart Item Quantity ────────────────────────────────────────────────
//
// Calls PATCH /cart/:id to replace the quantity of a specific cart item.
// The :id is the cart item ID (not the product ID).
//
// Request body (from OpenAPI spec):
//   { quantity: number }  — minimum 1
//
// Throws AuthError  if unauthenticated (401) — session should be cleared.
// Throws plain Error if the cart item is not found (404), belongs to a different
//   user (403), or quantity < 1 (400). 403 does NOT clear the session.

export async function updateCartItem(
  token: string,
  cartItemId: number,
  quantity: number
): Promise<UpdateCartItemResponse> {
  const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  // 401 — session invalid/expired
  if (response.status === 401) {
    throw new AuthError();
  }

  const data: UpdateCartItemResponse | CartErrorResponse = await response.json();

  if (!data.success) {
    throw new Error((data as CartErrorResponse).msg || "Could not update cart item.");
  }

  return data as UpdateCartItemResponse;
}

// ─── Remove Cart Item ─────────────────────────────────────────────────────────
//
// Calls DELETE /cart/:id to remove a specific item from the cart.
// The :id is the cart item ID (not the product ID).
//
// Throws AuthError  if unauthenticated (401) — session should be cleared.
// Throws plain Error if the cart item is not found (404) or belongs to a
//   different user (403). 403 does NOT clear the session.

export async function removeCartItem(
  token: string,
  cartItemId: number
): Promise<void> {
  const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 401 — session invalid/expired
  if (response.status === 401) {
    throw new AuthError();
  }

  // DELETE returns { success: true, msg: "Cart item deleted successfully" }
  // We only need to know if it failed.
  if (!response.ok) {
    const data: CartErrorResponse = await response.json();
    throw new Error(data.msg || "Could not remove cart item.");
  }
}
