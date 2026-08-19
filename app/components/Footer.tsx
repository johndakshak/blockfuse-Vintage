import Image from "next/image";

const footerLinks = {
  Shop: ["New Arrivals", "Men", "Women", "Accessories", "Archive Sale"],
  Company: ["Our Story", "Sustainability", "Press", "Careers", "Wholesale"],
  Support: [
    "Shipping & Returns",
    "Size Guide",
    "Care Instructions",
    "FAQ",
    "Contact Us",
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream px-4 sm:px-6 md:px-14 pt-14 md:pt-20 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-6 md:gap-12 mb-12 md:mb-16">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4 md:mb-6">
            <Image
              src="/images/logo_accent-removebg-preview.png"
              alt="Blockfuse Vintage"
              width={144}
              height={40}
              className="w-36 h-auto"
            />
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
                <li key={link}>
                  <a
                    href="#"
                    className="text-[0.8rem] md:text-[0.82rem] text-cream/60 no-underline hover:text-cream transition-colors duration-200"
                  >
                    {link}
                  </a>
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
          Privacy Policy · Terms &amp; Conditions
        </p>
      </div>
    </footer>
  );
}
