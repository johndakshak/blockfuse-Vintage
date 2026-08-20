import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream px-6 py-16 max-w-3xl mx-auto">
      {/* Accent bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[999]"
        style={{ background: "linear-gradient(90deg, #a8893e, #c8a96e, #a8893e)" }}
      />

      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.12em] uppercase text-warmgray hover:text-charcoal transition-colors no-underline mb-6">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Home
        </Link>
        <p className="text-accent text-xs tracking-[0.3em] uppercase font-barlow mb-2 mt-4">Legal</p>
        <h1 className="font-cormorant text-4xl sm:text-5xl text-charcoal font-semibold leading-tight">
          Privacy Policy
        </h1>
        <p className="text-muted text-sm font-barlow mt-3">Last updated: August 2025</p>
      </div>

      <div className="prose prose-sm max-w-none font-barlow text-charcoal/80 leading-[1.85] space-y-5">
        <p>
          Blockfuse Vintage (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">1. Information We Collect</h3>
        <p>
          We collect information you provide directly — such as your name, email address, phone number, and shipping address — when you create an account or place an order.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">2. How We Use Your Data</h3>
        <p>
          We use your data to process orders, communicate about your purchases, and (with your consent) send you updates about new collections and promotions. We never sell your personal information to third parties.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">3. Cookies</h3>
        <p>
          Our site uses cookies to improve your browsing experience and understand site usage. You can disable cookies in your browser settings, but this may affect some functionality.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">4. Your Rights</h3>
        <p>
          You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at{" "}
          <a href="mailto:hello@blockfusevintage.com" className="text-accent hover:underline">
            hello@blockfusevintage.com
          </a>
          .
        </p>
      </div>

      <div className="mt-10 pt-8 border-t border-charcoal/10 flex gap-4 text-sm font-barlow">
        <Link href="/terms" className="text-accent hover:underline">Terms &amp; Conditions</Link>
        <Link href="/login" className="text-muted hover:text-charcoal transition-colors">Sign In</Link>
      </div>
    </div>
  );
}
