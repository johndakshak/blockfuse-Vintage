import Link from "next/link";

export default function TermsPage() {
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
          Terms &amp; Conditions
        </h1>
        <p className="text-muted text-sm font-barlow mt-3">Last updated: August 2025</p>
      </div>

      <div className="prose prose-sm max-w-none font-barlow text-charcoal/80 leading-[1.85] space-y-5">
        <p>
          By accessing or using the Blockfuse Vintage website and services, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before placing an order.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">1. Orders &amp; Payment</h3>
        <p>
          All orders are subject to availability. We reserve the right to refuse or cancel any order at our discretion. Payment must be received in full before goods are dispatched.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">2. Returns &amp; Refunds</h3>
        <p>
          Items may be returned within 14 days of delivery, provided they are unworn, unwashed, and in original condition with tags attached. Sale items are final sale and non-refundable.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">3. Intellectual Property</h3>
        <p>
          All content on this site — including images, copy, and design — is the property of Blockfuse Vintage and may not be reproduced without written permission.
        </p>
        <h3 className="font-cormorant text-2xl text-charcoal font-semibold mt-6">4. Limitation of Liability</h3>
        <p>
          Blockfuse Vintage is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
        </p>
        <p>
          For questions, contact us at{" "}
          <a href="mailto:hello@blockfusevintage.com" className="text-accent hover:underline">
            hello@blockfusevintage.com
          </a>
          .
        </p>
      </div>

      <div className="mt-10 pt-8 border-t border-charcoal/10 flex gap-4 text-sm font-barlow">
        <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
        <Link href="/login" className="text-muted hover:text-charcoal transition-colors">Sign In</Link>
      </div>
    </div>
  );
}
