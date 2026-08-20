'use client'

import { useState } from "react";
import Link from "next/link";
import BrandPanel from "../components/auth/BrandPanel";

type StrengthLevel = {
  pct: string;
  color: string;
  label: string;
};

const strengthLevels: StrengthLevel[] = [
  { pct: "0%",   color: "",          label: ""       },
  { pct: "25%",  color: "#b05c3a",   label: "Weak"   },
  { pct: "50%",  color: "#c8a96e",   label: "Fair"   },
  { pct: "75%",  color: "#8aab6f",   label: "Good"   },
  { pct: "100%", color: "#4e9e6b",   label: "Strong" },
];

function getStrength(val: string): StrengthLevel {
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return strengthLevels[score];
}

const EyeOpen = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeClosed = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const inputClass =
  "w-full bg-white border border-charcoal/15 rounded-xl px-4 py-3.5 text-sm font-barlow font-light text-charcoal placeholder-warmgray transition-all duration-200 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)]";

export default function RegisterPage() {
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirm, setShowConfirm]          = useState(false);
  const [password, setPassword]                = useState("");
  const [error, setError]                      = useState("");
  const [loading, setLoading]                  = useState(false);

  const strength = getStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form        = e.currentTarget;
    const firstName   = (form.elements.namedItem("firstName")    as HTMLInputElement).value;
    const lastName    = (form.elements.namedItem("lastName")     as HTMLInputElement).value;
    const email       = (form.elements.namedItem("email")        as HTMLInputElement).value;
    const phone       = (form.elements.namedItem("phone")        as HTMLInputElement).value;
    const confirmPwd  = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    const terms       = (form.elements.namedItem("terms")        as HTMLInputElement).checked;

    if (password !== confirmPwd) {
      setError("Passwords do not match.");
      return;
    }
    if (!terms) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      // TODO: wire up to auth service
      console.log("Register attempt:", { firstName, lastName, email, phone });
      await new Promise((r) => setTimeout(r, 800));
      // On success: router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left: Brand Panel (desktop only) ── */}
      <BrandPanel quote="Join a community that celebrates the beauty of timeless fashion." />

      {/* ── Right: Register Form ── */}
      <div
        className="flex items-center justify-center px-6 py-12 sm:px-10 md:px-16 order-1 lg:order-2 relative overflow-hidden"
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

        {/* Accent bar */}
        <div
          className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
          style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
        />

        <div className="w-full max-w-md">

          {/* Mobile logo — links back to homepage */}
          <Link
            href="/"
            className="flex flex-col items-center lg:hidden mb-8 text-center group"
            aria-label="Back to Blockfuse Vintage homepage"
          >
            <div className="h-16 w-16 rounded-full border-2 border-accent flex items-center justify-center bg-charcoal mb-3 transition-opacity duration-200 group-hover:opacity-80">
              <span className="font-vintage text-accent text-xl">BV</span>
            </div>
            <span className="font-bebas text-2xl tracking-[0.15em] text-charcoal leading-none transition-opacity duration-200 group-hover:opacity-80">Blockfuse</span>
            <span className="text-warmgray text-[0.6rem] tracking-[0.35em] uppercase font-barlow mt-1 transition-opacity duration-200 group-hover:opacity-80">Vintage</span>
          </Link>

          {/* Heading */}
          <p className="text-accent text-xs tracking-[0.3em] uppercase font-barlow mb-2">Get Started</p>
          <h2 className="font-cormorant text-4xl sm:text-5xl text-charcoal font-semibold mb-1 leading-tight">
            Create Account
          </h2>
          <p className="text-muted text-sm font-barlow font-light mb-7">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-rust font-normal transition-colors hover:underline underline-offset-2"
            >
              Sign in
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

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                  First Name
                </label>
                <input
                  type="text" id="firstName" name="firstName"
                  required autoComplete="given-name" placeholder="Margaret"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                  Last Name
                </label>
                <input
                  type="text" id="lastName" name="lastName"
                  required autoComplete="family-name" placeholder="Holloway"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email & Phone row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                  Email Address
                </label>
                <input
                  type="email" id="email" name="email"
                  required autoComplete="email" placeholder="margaret@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel" id="phone" name="phone"
                  autoComplete="tel" placeholder="+1 (555) 000-0000"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password" name="password"
                  required autoComplete="new-password" placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warmgray hover:text-charcoal transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <>
                  <div className="mt-2 h-[3px] rounded-sm bg-charcoal/8 overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-300"
                      style={{ width: strength.pct, background: strength.color }}
                    />
                  </div>
                  <p className="text-[0.65rem] mt-1 font-barlow tracking-wide" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword" name="confirmPassword"
                  required autoComplete="new-password" placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warmgray hover:text-charcoal transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox" name="terms"
                required className="w-4 h-4 cursor-pointer rounded mt-0.5 flex-shrink-0 accent-accent"
              />
              <span className="text-sm font-barlow font-light text-muted leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-accent hover:text-rust transition-colors hover:underline underline-offset-2">
                  Terms of Use
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-accent hover:text-rust transition-colors hover:underline underline-offset-2">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full bg-charcoal hover:bg-charcoal/90 text-cream font-barlow font-semibold text-[0.78rem] tracking-[0.22em] uppercase py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-1 group"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="relative">
                {loading ? "Creating account…" : "Create Account"}
              </span>
            </button>
          </form>

          <p className="text-[0.7rem] text-muted text-center mt-6 font-barlow leading-relaxed">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
