'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandPanel from "../components/auth/BrandPanel";
import { registerUser } from "@/app/lib/auth";

// ─── Password strength meter ──────────────────────────────────────────────────

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

// ─── Validation ───────────────────────────────────────────────────────────────

// The shape of our field-level errors object.
type RegisterFormErrors = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: string;
};

// validateRegisterForm checks all fields and returns an errors object.
// Password requirements match the backend:
//   - min 8 characters
//   - at least one uppercase letter
//   - at least one lowercase letter
//   - at least one number
//   - at least one symbol
function validateRegisterForm(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  terms: boolean
): RegisterFormErrors {
  const errors: RegisterFormErrors = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  };

  // First name: required
  if (!firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  // Last name: required
  if (!lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  // Email: required + format
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  // Password: required + backend rules
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must include at least one uppercase letter.";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Password must include at least one lowercase letter.";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password must include at least one number.";
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = "Password must include at least one symbol (e.g. !@#$%).";
  }

  // Confirm password: required + must match
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // Terms: must be checked
  if (!terms) {
    errors.terms = "Please agree to the Terms and Privacy Policy.";
  }

  return errors;
}

// Returns true if the errors object has no messages.
function isFormValid(errors: RegisterFormErrors): boolean {
  return Object.values(errors).every((msg) => msg === "");
}

// ─── Icons ────────────────────────────────────────────────────────────────────

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

// ─── Shared input class ───────────────────────────────────────────────────────

// Accepts an optional hasError boolean to apply error styling
function inputCls(hasError = false) {
  return `w-full bg-white border rounded-xl px-4 py-3.5 text-sm font-barlow font-light text-charcoal placeholder-warmgray transition-all duration-200 outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] ${
    hasError
      ? "border-[#b05c3a] focus:border-[#b05c3a]"
      : "border-charcoal/15 focus:border-accent"
  }`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirm, setShowConfirm]          = useState(false);
  const [password, setPassword]                = useState("");
  // formErrors holds field-level validation messages
  const [formErrors, setFormErrors]            = useState<RegisterFormErrors>({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "", terms: "",
  });
  // error holds the top-level banner message (backend error or network error)
  const [error, setError]                      = useState("");
  const [loading, setLoading]                  = useState(false);

  const strength = getStrength(password);

  // useRouter lets us redirect the user to /login after successful registration
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form        = e.currentTarget;
    const firstName   = (form.elements.namedItem("firstName")       as HTMLInputElement).value;
    const lastName    = (form.elements.namedItem("lastName")        as HTMLInputElement).value;
    const email       = (form.elements.namedItem("email")           as HTMLInputElement).value;
    const confirmPwd  = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    const terms       = (form.elements.namedItem("terms")           as HTMLInputElement).checked;

    // ── Step 1: Validate before calling the backend ───────────────────────────
    const errors = validateRegisterForm(firstName, lastName, email, password, confirmPwd, terms);
    setFormErrors(errors);

    // If validation failed, stop here — do NOT call the API
    if (!isFormValid(errors)) {
      return;
    }

    // ── Step 2: Validation passed — call the backend ──────────────────────────
    // The backend expects a single "name" field — combine first + last name.
    const fullName = `${firstName} ${lastName}`.trim();

    setLoading(true);
    try {
      // registerUser() returns { success, msg, data: { name, email } } on success,
      // throws a friendly Error on backend error or network failure
      await registerUser(fullName, email, password);

      // Registration succeeded — send the user to the login page.
      // Registration does not return a token; they need to log in separately.
      router.push("/login");
    } catch (err: unknown) {
      // Show backend or network error in the banner
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
                  autoComplete="given-name" placeholder="Margaret"
                  aria-describedby={formErrors.firstName ? "firstName-error" : undefined}
                  className={inputCls(!!formErrors.firstName)}
                />
                {formErrors.firstName && (
                  <p id="firstName-error" className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                    {formErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                  Last Name
                </label>
                <input
                  type="text" id="lastName" name="lastName"
                  autoComplete="family-name" placeholder="Holloway"
                  aria-describedby={formErrors.lastName ? "lastName-error" : undefined}
                  className={inputCls(!!formErrors.lastName)}
                />
                {formErrors.lastName && (
                  <p id="lastName-error" className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                    {formErrors.lastName}
                  </p>
                )}
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
                  autoComplete="email" placeholder="margaret@example.com"
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                  className={inputCls(!!formErrors.email)}
                />
                {formErrors.email && (
                  <p id="email-error" className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-[0.68rem] font-barlow tracking-[0.2em] uppercase text-warmgray mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel" id="phone" name="phone"
                  autoComplete="tel" placeholder="+1 (555) 000-0000"
                  className={inputCls()}
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
                  autoComplete="new-password" placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={formErrors.password ? "password-error" : undefined}
                  className={`${inputCls(!!formErrors.password)} pr-12`}
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
              {formErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                  {formErrors.password}
                </p>
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
                  autoComplete="new-password" placeholder="••••••••"
                  aria-describedby={formErrors.confirmPassword ? "confirmPassword-error" : undefined}
                  className={`${inputCls(!!formErrors.confirmPassword)} pr-12`}
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
              {formErrors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox" name="terms"
                  className="w-4 h-4 cursor-pointer rounded mt-0.5 flex-shrink-0 accent-accent"
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
              {formErrors.terms && (
                <p className="mt-1.5 text-xs font-barlow" style={{ color: "#b05c3a" }}>
                  {formErrors.terms}
                </p>
              )}
            </div>

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
