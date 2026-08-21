// app/lib/products.ts
//
// This file contains all the API functions for the Products feature.
// Responsibility: make the HTTP request, return the data (or throw an error).
//
// Components call these functions — they do NOT call fetch() themselves.
// This follows the same pattern as app/lib/auth.ts and app/lib/cart.ts.
//
// Pattern:
//   Product component  →  products.ts  →  fetch()  →  Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

// The exact shape of a Product from the backend (matches the OpenAPI schema).
export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;          // in NGN (e.g. 4500)
  imageUrl: string;       // Cloudinary URL
  stock: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

// What the backend sends back when GET /products succeeds
export type GetProductsResponse = {
  success: true;
  msg: string;
  data: Product[];
};

// What the backend sends back when GET /product/:id succeeds
export type GetProductByIdResponse = {
  success: true;
  msg: string;
  data: Product;
};

// Generic error shape the backend sends on failure
export type ProductErrorResponse = {
  success: false;
  msg: string;
  reason?: string;
};

// ─── Get All Products ─────────────────────────────────────────────────────────
//
// Calls GET /products — public endpoint, no token needed.
// Returns the full product catalogue.
//
// Throws an Error if:
//   - the server returns a 500 error

export async function getProducts(): Promise<GetProductsResponse> {
  const response = await fetch(`${API_URL}/products`, {
    method: "GET",
  });

  const data: GetProductsResponse | ProductErrorResponse = await response.json();

  if (!data.success) {
    throw new Error(
      (data as ProductErrorResponse).msg || "Could not load products."
    );
  }

  return data as GetProductsResponse;
}

// ─── Get Product By ID ────────────────────────────────────────────────────────
//
// Calls GET /product/:id — public endpoint, no token needed.
// Returns a single product record.
//
// The :id must be a positive integer. The Next.js route param arrives as a
// string, so we parse it here and validate it before sending the request.
//
// Throws an Error if:
//   - the id is not a valid number (400)
//   - the product is not found (404)
//   - the server returns an error (500)

export async function getProductById(id: string | number): Promise<GetProductByIdResponse> {
  const numericId = Number(id);

  // Guard: reject clearly invalid IDs before wasting a network request
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new Error("Invalid product ID.");
  }

  const response = await fetch(`${API_URL}/product/${numericId}`, {
    method: "GET",
  });

  const data: GetProductByIdResponse | ProductErrorResponse = await response.json();

  if (!data.success) {
    throw new Error(
      (data as ProductErrorResponse).msg || "Product not found."
    );
  }

  return data as GetProductByIdResponse;
}
