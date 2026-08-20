import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-14" style={{ background: "#e8e3d8" }}>
      {/* Accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-16 w-16 rounded-full border-2 border-accent flex items-center justify-center bg-charcoal mb-3">
            <span className="font-vintage text-accent text-xl">BV</span>
          </div>
          <span className="font-bebas text-2xl tracking-[0.15em] text-charcoal leading-none">Blockfuse</span>
          <span className="text-warmgray text-[0.6rem] tracking-[0.35em] uppercase font-barlow mt-1">Vintage</span>
        </div>

        <p className="text-accent text-xs tracking-[0.3em] uppercase font-barlow mb-2">Account Recovery</p>
        <h2 className="font-cormorant text-4xl sm:text-5xl text-charcoal font-semibold mb-1 leading-tight">
          Reset Password
        </h2>
        <p className="text-muted text-sm font-barlow font-light mb-7">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form className="space-y-5">
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
              required
              autoComplete="email"
              placeholder="margaret@example.com"
              className="w-full bg-white border border-charcoal/15 rounded-xl px-4 py-3.5 text-sm font-barlow font-light text-charcoal placeholder-warmgray transition-all duration-200 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-charcoal hover:bg-charcoal/90 text-cream font-barlow font-semibold text-[0.78rem] tracking-[0.22em] uppercase py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-none mt-1"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center mt-6 font-barlow text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="text-accent hover:underline underline-offset-2">
            Back to Sign In
          </Link>
        </p>
      </div>
    </section>
  );
}
