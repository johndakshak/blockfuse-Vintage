// app/lib/checkout.ts
//
// This file contains the API functions for the Checkout and Payment features.
// Responsibility: make the HTTP request, return the data (or throw an error).
//
// The Checkout page calls these functions — it does NOT call fetch() itself.
// This follows the same pattern as auth.ts, cart.ts, and products.ts.
//
// Pattern:
//   Checkout page  →  checkout.ts  →  fetch()  →  Backend

import type { BackendCartItem } from "@/app/components/cart/cartTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

// The Order object returned inside the checkout response.
// Fields taken directly from the OpenAPI Order schema.
export type Order = {
  id: number;
  userId: number;
  totalPrice: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentReference: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

// Each item line inside the Order
export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
};

// The full response from POST /checkout on success
export type CheckoutResponse = {
  success: true;
  msg: string;
  data: {
    order: Order;
    cartItems: BackendCartItem[];
    totalPrice: number;
  };
};

// Error shape (400 includes a "reason" field, e.g. "Cart is empty")
export type CheckoutErrorResponse = {
  success: false;
  msg: string;
  reason?: string;
};

// ─── Payment types ────────────────────────────────────────────────────────────

// The Paystack initialisation data returned inside POST /payment/:id
export type PaystackInitData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

// The full response from POST /payment/:id on success
export type PaymentResponse = {
  success: true;
  msg: string;
  data: PaystackInitData;
};

// Error shape from POST /payment/:id
export type PaymentErrorResponse = {
  success: false;
  msg: string;
  reason?: string;
};

// ─── Checkout ─────────────────────────────────────────────────────────────────
//
// Calls POST /checkout.
//
// IMPORTANT (from OpenAPI):
//   POST /checkout sends NO request body.
//   The backend reads the user's cart server-side using the JWT.
//   All we need to send is the Authorization header.
//
// The backend atomically:
//   1. Reads all cart items
//   2. Calculates totalPrice server-side
//   3. Creates the Order record
//   4. Decrements product stock
//   5. Clears the cart
//
// Returns the created Order, the cart items that were ordered, and the total.
//
// Throws an Error if:
//   - the cart is empty (400 — reason: "Cart is empty")
//   - insufficient stock for a product (400 — reason: "Insufficient stock...")
//   - unauthenticated (401)

export async function checkout(token: string): Promise<CheckoutResponse> {
  const response = await fetch(`${API_URL}/checkout`, {
    method: "POST",
    headers: {
      // No Content-Type needed — no request body is sent
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: CheckoutResponse | CheckoutErrorResponse = await response.json();

  if (!data.success) {
    const err = data as CheckoutErrorResponse;
    // If there's a "reason" field, include it in the message
    // e.g. "Failed to checkout — Cart is empty"
    const message = err.reason
      ? `${err.msg} — ${err.reason}`
      : err.msg || "Checkout failed.";
    throw new Error(message);
  }

  return data as CheckoutResponse;
}

// ─── Initialize Payment ───────────────────────────────────────────────────────
//
// Calls POST /payment/:orderId to initialize a Paystack payment for the given order.
//
// IMPORTANT (from OpenAPI):
//   - The :id is the ORDER ID returned by POST /checkout — not a cart ID or product ID.
//   - No request body is sent. The backend derives all details from the JWT and order record.
//   - The order must belong to the authenticated user and must be in PENDING status.
//
// On success, returns Paystack's authorization_url which the browser should be
// redirected to so the user can complete payment on Paystack's hosted page.
//
// Throws an Error if:
//   - the order is not found (404)
//   - the order does not belong to the user (403)
//   - the order is not in PENDING status (409)
//   - unauthenticated (401)
//   - the server returns a non-JSON response (cold start / 502)

export async function initializePayment(
  orderId: number,
  token: string
): Promise<PaymentResponse> {
  const response = await fetch(`${API_URL}/payment/${orderId}`, {
    method: "POST",
    headers: {
      // No Content-Type needed — no request body is sent
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: PaymentResponse | PaymentErrorResponse = await response.json();

  if (!data.success) {
    const err = data as PaymentErrorResponse;
    const message = err.reason
      ? `${err.msg} — ${err.reason}`
      : err.msg || "Payment initialization failed.";
    throw new Error(message);
  }

  return data as PaymentResponse;
}
