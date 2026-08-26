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

// What the backend sends back when POST /product or PATCH /product/:id succeeds
export type MutateProductResponse = {
  success: true;
  msg: string;
  data: Product;
};

// What the backend sends back when DELETE /product/:id succeeds
export type DeleteProductResponse = {
  success: true;
  msg: string;
};

// Generic error shape the backend sends on failure
export type ProductErrorResponse = {
  success: false;
  msg: string;
  reason?: string;
};

// Fields for creating a product (POST /product — multipart/form-data)
export type CreateProductFields = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image: File;
};

// Fields for updating a product (PATCH /product/:id — multipart/form-data)
// All fields are optional; image is only sent if replacing the existing one.
export type UpdateProductFields = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image?: File;
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

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

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

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: GetProductByIdResponse | ProductErrorResponse = await response.json();

  if (!data.success) {
    throw new Error(
      (data as ProductErrorResponse).msg || "Product not found."
    );
  }

  return data as GetProductByIdResponse;
}

// ─── Create Product (Admin) ───────────────────────────────────────────────────
//
// Calls POST /product — admin only, requires Bearer token.
//
// IMPORTANT (from OpenAPI):
//   The backend expects multipart/form-data (not JSON).
//   The image is uploaded as a binary file in the "image" field.
//   Do NOT set Content-Type manually — the browser sets the multipart boundary.
//
// Throws an Error if:
//   - required fields are missing (400)
//   - unauthenticated (401)
//   - not an admin (403)
//   - server returns a non-JSON response

export async function createProduct(
  fields: CreateProductFields,
  token: string
): Promise<MutateProductResponse> {
  const body = new FormData();
  body.append("name", fields.name);
  if (fields.description) body.append("description", fields.description);
  body.append("price", String(fields.price));
  body.append("stock", String(fields.stock));
  body.append("image", fields.image);

  const response = await fetch(`${API_URL}/product`, {
    method: "POST",
    headers: {
      // No Content-Type — browser sets multipart/form-data with boundary automatically
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: MutateProductResponse | ProductErrorResponse = await response.json();

  if (!data.success) {
    const err = data as ProductErrorResponse;
    throw new Error(err.reason ? `${err.msg} — ${err.reason}` : err.msg || "Could not create product.");
  }

  return data as MutateProductResponse;
}

// ─── Update Product (Admin) ───────────────────────────────────────────────────
//
// Calls PATCH /product/:id — admin only, requires Bearer token.
//
// All fields are optional. If no image file is provided, the existing
// Cloudinary image is preserved (per the OpenAPI spec).
//
// Throws an Error if:
//   - product not found (404)
//   - unauthenticated (401)
//   - not an admin (403)

export async function updateProduct(
  id: number,
  fields: UpdateProductFields,
  token: string
): Promise<MutateProductResponse> {
  const body = new FormData();
  if (fields.name !== undefined)        body.append("name", fields.name);
  if (fields.description !== undefined) body.append("description", fields.description);
  if (fields.price !== undefined)       body.append("price", String(fields.price));
  if (fields.stock !== undefined)       body.append("stock", String(fields.stock));
  if (fields.image !== undefined)       body.append("image", fields.image);

  const response = await fetch(`${API_URL}/product/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: MutateProductResponse | ProductErrorResponse = await response.json();

  if (!data.success) {
    const err = data as ProductErrorResponse;
    throw new Error(err.reason ? `${err.msg} — ${err.reason}` : err.msg || "Could not update product.");
  }

  return data as MutateProductResponse;
}

// ─── Delete Product (Admin) ───────────────────────────────────────────────────
//
// Calls DELETE /product/:id — admin only, requires Bearer token.
//
// Throws an Error if:
//   - product not found (404)
//   - unauthenticated (401)
//   - not an admin (403)

export async function deleteProduct(
  id: number,
  token: string
): Promise<DeleteProductResponse> {
  const response = await fetch(`${API_URL}/product/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: DeleteProductResponse | ProductErrorResponse = await response.json();

  if (!data.success) {
    throw new Error(
      (data as ProductErrorResponse).msg || "Could not delete product."
    );
  }

  return data as DeleteProductResponse;
}
