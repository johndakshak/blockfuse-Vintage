import Link from "next/link";

type BrandPanelProps = {
  quote: string;
};

export default function BrandPanel({ quote }: BrandPanelProps) {
  return (
    <div
      className="hidden lg:flex flex-col items-center justify-center py-16 px-10 md:px-14 order-2 lg:order-1 relative overflow-hidden"
      style={{ background: "#1a1a18" }}
    >
      {/* Radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(200,169,110,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(200,169,110,0.10) 0%, transparent 55%)",
        }}
      />

      {/* BV watermark */}
      <span
        className="absolute bottom-[-2rem] right-[-1rem] font-bebas leading-none select-none pointer-events-none z-0"
        style={{ fontSize: "14rem", color: "rgba(200,169,110,0.04)" }}
        aria-hidden
      >
        BV
      </span>

      {/* Corner brackets */}
      <div
        className="absolute top-10 right-10 w-10 h-10 z-10"
        style={{
          borderTop: "1px solid rgba(200,169,110,0.3)",
          borderRight: "1px solid rgba(200,169,110,0.3)",
        }}
      />
      <div
        className="absolute bottom-10 left-10 w-10 h-10 z-10"
        style={{
          borderBottom: "1px solid rgba(200,169,110,0.3)",
          borderLeft: "1px solid rgba(200,169,110,0.3)",
        }}
      />

      {/* Content */}
      <div className="text-center w-full max-w-xs mx-auto z-10">
        {/* Emblem + brand name — clicking navigates home */}
        <Link href="/" className="no-underline group" aria-label="Back to Blockfuse Vintage homepage">
          <div
            className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-accent flex items-center justify-center transition-opacity duration-200 group-hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.05)",
              boxShadow: "0 0 30px rgba(200,169,110,0.2)",
            }}
          >
            <span className="text-3xl font-vintage text-accent select-none">BV</span>
          </div>

          {/* Brand name */}
          <h1 className="font-vintage text-4xl sm:text-5xl md:text-6xl tracking-widest text-accent select-none transition-opacity duration-200 group-hover:opacity-80">
            Blockfuse
          </h1>

          {/* Sub brand */}
          <p className="mt-2 font-clean text-xs sm:text-sm tracking-[0.35em] uppercase text-warmgray select-none">
            Vintage
          </p>
        </Link>

        {/* Decorative line */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <span className="h-px w-16 bg-accent opacity-60 block" />
          <span className="h-2 w-2 rounded-full bg-accent block" />
          <span className="h-px w-16 bg-accent opacity-60 block" />
        </div>

        {/* Quote */}
        <div className="mt-10">
          <p
            className="font-cormorant italic text-[1.15rem] leading-[1.65]"
            style={{ color: "rgba(245,242,236,0.75)" }}
          >
            &ldquo;{quote}&rdquo;
          </p>
          <p className="text-warmgray text-[0.7rem] tracking-[0.2em] uppercase mt-3">
            — Blockfuse Collective
          </p>
        </div>
      </div>
    </div>
  );
}
