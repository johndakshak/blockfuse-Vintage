import Image from "next/image";

const stats = [
  { value: "12+", label: "Collections" },
  { value: "40+", label: "Countries" },
  { value: "100%", label: "Sustainable" },
];

export default function Approach() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[auto] md:min-h-[70vh]">
      {/* Image */}
      <div className="relative overflow-hidden bg-approach min-h-[55vw] md:min-h-0 group">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
          alt="Design approach"
          fill
          className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center px-6 md:px-16 py-12 md:py-20">
        <p className="reveal text-[0.65rem] tracking-[0.3em] uppercase text-accent mb-5">
          Our Philosophy
        </p>
        <h2 className="reveal reveal-d1 font-bebas text-[clamp(2rem,4vw,3.8rem)] leading-[1.05] text-charcoal mb-6">
          Our Approach
          <br />
          to Fashion Design
        </h2>
        <p className="reveal reveal-d2 text-warmgray text-[0.88rem] md:text-[0.9rem] leading-[1.85] max-w-md mb-8">
          XIV was built on the belief that clothing should be both architecture
          and poetry. Every seam is a decision, every silhouette a statement. We
          create garments that exist in the tension between structure and freedom
          — designed for those who understand the power of a well-considered
          wardrobe.
        </p>
        <div className="reveal reveal-d3 mb-8">
          <a
            href="#"
            className="inline-flex items-center gap-3 text-[0.72rem] tracking-wider3 uppercase text-cream bg-charcoal px-8 md:px-10 py-4 no-underline transition-all duration-300 hover:bg-accent w-fit"
          >
            Discover Our Story
          </a>
        </div>
        <div className="reveal reveal-d4 flex gap-8 md:gap-12 flex-wrap">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-bebas text-[2.2rem] md:text-[2.5rem] tracking-[0.04em] text-charcoal">
                {s.value}
              </div>
              <div className="text-[0.68rem] tracking-[0.2em] uppercase text-warmgray">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
