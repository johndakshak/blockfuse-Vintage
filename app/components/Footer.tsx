import Image from "next/image";
import Link from "next/link";

// Map footer link labels to their destinations.
// Category links (Men, Women, etc.) anchor to home page sections.
// Support/company links without dedicated pages use "#" anchors on home.
const footerLinks: Record<string, { label: string; href: string }[]> = {
  Shop: [
    { label: "New Arrivals",   href: "/cart" },
    { label: "Men",            href: "/#men" },
    { label: "Women",          href: "/#women" },
    { label: "Accessories",    href: "/#accessories" },
    { label: "Archive Sale",   href: "/cart" },
  ],
  Company: [
    { label: "Our Story",      href: "/register" },
    { label: "Sustainability",  href: "/#about" },
    { label: "Press",          href: "/#contact" },
    { label: "Careers",        href: "/#contact" },
    { label: "Wholesale",      href: "/#contact" },
  ],
  Support: [
    { label: "Shipping & Returns",  href: "/#contact" },
    { label: "Size Guide",          href: "/#contact" },
    { label: "Care Instructions",   href: "/#contact" },
    { label: "FAQ",                 href: "/#contact" },
    { label: "Contact Us",          href: "/#contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream px-4 sm:px-6 md:px-14 pt-14 md:pt-20 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-6 md:gap-12 mb-12 md:mb-16">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4 md:mb-6">
            <Link href="/" className="inline-block no-underline">
              <Image
                src="/images/logo_accent-removebg-preview.png"
                alt="Blockfuse Vintage"
                width={144}
                height={40}
                className="w-36 h-auto"
              />
            </Link>
          </div>
          <p className="text-[0.8rem] text-cream/50 leading-[1.7] max-w-[240px]">
            A fashion house built on the architecture of restraint and the
            poetry of precision. Crafted for those who understand the power of a
            considered wardrobe.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h5 className="text-[0.65rem] tracking-[0.25em] uppercase text-accent mb-4 md:mb-6">
              {heading}
            </h5>
            <ul className="space-y-2 md:space-y-3 list-none p-0">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[0.8rem] md:text-[0.82rem] text-cream/60 no-underline hover:text-cream transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10 pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-center">
        <p className="text-[0.7rem] tracking-[0.1em] text-cream/35">
          © 2025 XIV QR — johndakshak. All rights reserved.
        </p>
        <p className="text-[0.7rem] tracking-[0.1em] text-cream/35">
          <Link href="/privacy" className="hover:text-cream/60 transition-colors no-underline text-cream/35">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="hover:text-cream/60 transition-colors no-underline text-cream/35">Terms &amp; Conditions</Link>
        </p>
      </div>
    </footer>
  );
}
