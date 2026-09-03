'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandPanel from "../components/auth/BrandPanel";
import { loginUser } from "@/app/lib/auth";
import { useAuth } from "@/app/context/AuthContext";

// ─── Validation ───────────────────────────────────────────────────────────────

// The shape of our field-level errors object.
// Each key matches a form field; the value is the error message (or empty string).
type LoginFormErrors = {
  email: string;
  password: string;
};

// validateLoginForm checks the form values and returns an errors object.
// If every field is valid, all values will be empty strings.
// This runs BEFORE the API request is made.
function validateLoginForm(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = { email: "", password: "" };

  // Email: required + basic format check
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  // Password: required only (the backend validates strength on registration;
  // on login we just need something to send)
  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

// Returns true if the errors object has no messages (all fields are valid).
function isFormValid(errors: LoginFormErrors): boolean {
  return Object.values(errors).every((msg) => msg === "");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  // formErrors holds field-level validation messages
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({ email: "", password: "" });
  // error holds the top-level banner message (backend error or network error)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // rememberMe controls whether the token is stored in localStorage (true) or sessionStorage (false)
  const [rememberMe, setRememberMe] = useState(false);

  // useRouter lets us redirect the user after login
  const router = useRouter();

  // useAuth gives us the login() function to save the token and user
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Read values from the form
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    // ── Step 1: Validate before calling the backend ───────────────────────────
    const errors = validateLoginForm(email, password);
    setFormErrors(errors);

    // If validation failed, stop here — do NOT call the API
    if (!isFormValid(errors)) {
      return;
    }

    // ── Step 2: Validation passed — call the backend ──────────────────────────
    setLoading(true);

    try {
      // loginUser() returns { success, msg, access_token } on success,
      // throws a friendly Error on backend error (400/404) or network failure
      const response = await loginUser(email, password);

      // Save token + fetch user profile via GET /me.
      // Pass rememberMe so AuthContext stores the token in the correct location.
      await login(response.access_token, rememberMe);

      // Redirect to the homepage
      router.push("/");
    } catch (err: unknown) {
      // Show backend or network error in the banner
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left: Brand Panel (desktop only) ── */}
      <BrandPanel quote="Every vintage piece carries a century of stories. Welcome back to yours." />

      {/* ── Right: Login Form ── */}
      <div
        className="flex items-center justify-center px-6 py-14 sm:px-10 md:px-16 order-1 lg:order-2 relative overflow-hidden"
        style={{ background: "#e8e3d8" }}
      >
        {/* Subtle top-right glow */}
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(200,169,110,0.08), transparent 70%)",
          }}
        />

        {/* Accent bar at top */}
        <div
          className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
          style={{
            background:
              "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)",
          }}
        />

        <div className="w-full max-w-md">

          {/* Mobile logo — links back to homepage */}
          <Link
            href="/"
            className="flex flex-col items-center lg:hidden mb-10 text-center group"
            aria-label="Back to Blockfuse Vintage homepage"
          >
            <div className="h-16 w-16 rounded-full border-2 border-accent flex items-center justify-center bg-charcoal mb-3 transition-opacity duration-200 group-hover:opacity-80">
              <span className="font-vintage text-accent text-xl">BV</span>
            </div>
            <span className="font-bebas text-2xl tracking-[0.15em] text-charcoal leading-none transition-opacity duration-200 group-hover:opacity-80">
              Blockfuse
            </span>
            <span className="text-warmgray text-[0.6rem] tracking-[0.35em] uppercase font-barlow mt-1 transition-opacity duration-200 group-hover:opacity-80">
              Vintage
            </span>
          </Link>

          {/* Heading */}
          <p className="text-accent text-xs tracking-[0.3em] uppercase font-barlow mb-2">
            Welcome Back
          </p>
          <h2 className="font-cormorant text-4xl sm:text-5xl text-charcoal font-semibold mb-1 leading-tight">
            Sign In
          </h2>
          <p className="text-muted text-sm font-barlow font-light mb-7">
            New to Blockfuse?{" "}
            <Link
              href="/register"
              className="text-accent hover:text-rust font-normal transition-colors hover:underline underline-offset-2"
            >
              Create an account
            </Link>
          </p>

          {/* Error banner */}
          {error && (
            <div
              className="border rounded-xl px-4 py-3 text-sm mb-5 font-barlow"
              style={{
                background: "rgba(176,92,58,0.1)",
                borderColor: "rgba(176,92,58,0.3)",
                color: "#b05c3a",
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="margaret@example.com"
                aria-describedby={formErrors.email ? "email-error" : undefined}
                className={`w-full bg-white border rounded-xl px-4 py-3.5 text-sm font-barlow font-light text-charcoal placeholder-warmgray transition-all duration-200 outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] ${
                  formErrors.email
                    ? "border-[#b05c3a] focus:border-[#b05c3a]"
                    : "border-charcoal/15 focus:border-accent"
                }`}
              />
              {formErrors.email && (
                <p id="email-error" className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent hover:text-rust transition-colors font-barlow"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                  className={`w-full bg-white border rounded-xl px-4 py-3.5 pr-12 text-sm font-barlow font-light text-charcoal placeholder-warmgray transition-all duration-200 outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] ${
                    formErrors.password
                      ? "border-[#b05c3a] focus:border-[#b05c3a]"
                      : "border-charcoal/15 focus:border-accent"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warmgray hover:text-charcoal transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 cursor-pointer rounded accent-accent"
              />
              <span className="text-sm font-barlow font-light text-muted">
                Keep me signed in
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full bg-charcoal hover:bg-charcoal/90 text-cream font-barlow font-semibold text-[0.78rem] tracking-[0.22em] uppercase py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-1 group"
            >
              {/* Gold shimmer overlay */}
              <span className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="relative">
                {loading ? "Signing in…" : "Sign In"}
              </span>
            </button>
          </form>

          {/* Create account prompt */}
          <p className="text-sm font-barlow font-light text-muted text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-accent hover:text-rust font-normal transition-colors hover:underline underline-offset-2"
            >
              Create account
            </Link>
          </p>

          {/* Privacy note */}
          <p className="text-[0.7rem] text-muted text-center mt-4 font-barlow leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-accent hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
