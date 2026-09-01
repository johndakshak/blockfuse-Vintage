// app/lib/auth.ts
//
// This file contains all the API functions for authentication.
// Responsibility: make the HTTP request, return the data (or throw an error).
//
// The components call these functions — they don't call fetch() themselves.
// This keeps fetch logic in one place and keeps the components readable.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── AuthError ────────────────────────────────────────────────────────────────
//
// A sentinel error subclass thrown whenever the backend returns HTTP 401.
//
// Why a subclass?
//   Pages and components need to distinguish "the session is invalid/expired"
//   from "a normal API error occurred". Using a dedicated subclass lets any
//   caller do:
//
//     } catch (err) {
//       if (err instanceof AuthError) {
//         logout();
//         router.push("/login");
//       } else {
//         setError(err.message);
//       }
//     }
//
//   without duplicating status-code checks or "magic string" comparisons.
//
// 401 vs 403:
//   - 401 Unauthorized → the token is missing, invalid, or expired.
//     Throw AuthError. The caller should clear the session.
//   - 403 Forbidden → the token is valid but the user lacks permission.
//     Throw a plain Error. The caller should NOT clear the session.
//
// This class is defined in auth.ts so all lib files can import it from
// one place without creating circular dependencies.

export class AuthError extends Error {
  constructor(message: string = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "AuthError";
    // Maintain correct prototype chain in environments that transpile classes
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

// What the backend sends back when login is successful
export type LoginResponse = {
  success: true;
  msg: string;
  access_token: string;
};

// What the backend sends back when registration is successful
export type RegisterResponse = {
  success: true;
  msg: string;
  data: {
    name: string;
    email: string;
  };
};

// The user object returned by GET /me
export type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

// What the backend sends back when GET /me is successful
export type MeResponse = {
  success: true;
  msg: string;
  user: User;
};

// What the backend sends back when something goes wrong
export type ErrorResponse = {
  success: false;
  msg: string;
};

// ─── Network error helper ─────────────────────────────────────────────────────

// fetch() itself throws a TypeError ("Failed to fetch") when it cannot reach the
// server at all — CORS preflight failure, DNS error, network offline, or the
// server is down (e.g. Render free-tier cold start timeout).
// This helper converts that low-level error into a message the user can act on.
function handleNetworkError(err: unknown, context: string): never {
  // Log the real error to the console for debugging purposes
  console.error(`[auth] Network error during ${context}:`, err);

  // Throw a friendly message instead of exposing "TypeError: Failed to fetch"
  throw new Error(
    "Unable to connect to the server. Please check your connection and try again."
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

// Calls POST /login with email and password.
// Returns the access_token on success.
// Throws an Error with the backend's error message on failure.
// Throws a friendly network error if fetch() itself fails (server unreachable).
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    // fetch() threw — network-level failure (server down, CORS, DNS, etc.)
    handleNetworkError(err, "POST /login");
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: LoginResponse | ErrorResponse = await response.json();

  // If the backend says success is false, throw so the component can show the error
  if (!data.success) {
    throw new Error((data as ErrorResponse).msg || "Login failed.");
  }

  return data as LoginResponse;
}

// ─── Register ─────────────────────────────────────────────────────────────────

// Calls POST /users/create with name, email, and password.
// The backend requires: name (string), email (string), password (string).
// Password must be min 8 chars, with uppercase, lowercase, number, and symbol.
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
  } catch (err) {
    // fetch() threw — network-level failure (server down, CORS, DNS, etc.)
    handleNetworkError(err, "POST /users/create");
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: RegisterResponse | ErrorResponse = await response.json();

  if (!data.success) {
    throw new Error((data as ErrorResponse).msg || "Registration failed.");
  }

  return data as RegisterResponse;
}

// ─── Get Current User ─────────────────────────────────────────────────────────

// Calls GET /me with the JWT token in the Authorization header.
// Returns the full user object on success.
//
// Throws AuthError  if the token is invalid/expired (401).
// Throws plain Error if anything else fails (network, 500, etc.).
export async function getCurrentUser(token: string): Promise<MeResponse> {
  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 401 — token invalid or expired. Throw AuthError so the caller (AuthContext
  // or a page) knows to clear the session rather than show a generic error.
  if (response.status === 401) {
    throw new AuthError();
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: MeResponse | ErrorResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error((data as ErrorResponse).msg || "Could not fetch user.");
  }

  return data as MeResponse;
}

// ─── Get All Users (Admin) ────────────────────────────────────────────────────

// What the backend sends back when GET /users succeeds
export type GetUsersResponse = {
  success: true;
  msg: string;
  data: User[];
};

// Error shape from GET /users
export type GetUsersErrorResponse = {
  success: false;
  msg: string;
};

// Calls GET /users — admin only, requires Bearer token with ADMIN role.
// Returns a list of all registered users.
//
// Throws AuthError  if unauthenticated (401) — session should be cleared.
// Throws plain Error if not an admin (403) — session must NOT be cleared.
// Throws plain Error if the server returns a non-JSON response (cold start / 502).

export async function getAdminUsers(token: string): Promise<GetUsersResponse> {
  const response = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 401 — token invalid/expired → clear session
  if (response.status === 401) {
    throw new AuthError();
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server is currently unavailable. Please wait a moment and try again."
    );
  }

  const data: GetUsersResponse | GetUsersErrorResponse = await response.json();

  if (!data.success) {
    throw new Error(
      (data as GetUsersErrorResponse).msg || "Could not load customers."
    );
  }

  return data as GetUsersResponse;
}
