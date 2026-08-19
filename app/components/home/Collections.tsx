import Image from "next/image";

const collections = [
  {
    season: "Spring / Summer",
    label: "Collection 2022",
    image: "https://images.unsplash.com/photo-1536922246289-88c42f957773?w=900&q=80",
    alt: "Collection 2022",
    className: "relative overflow-hidden group min-h-[55vw] lg:min-h-[70vh]",
  },
  {
    season: "Autumn / Winter",
    label: "Collection 2023",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    alt: "Collection 2023",
    className: "relative overflow-hidden group min-h-[45vw] lg:min-h-[35vh]",
  },
  {
    season: "Resort",
    label: "Collection 2024",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    alt: "Collection 2024",
    className: "relative overflow-hidden group min-h-[45vw] lg:min-h-[35vh]",
  },
];

export default function Collections() {
  return (
    <section className="px-4 sm:px-6 md:px-14 py-14 md:py-16 bg-archive">
      <div className="reveal flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 md:mb-10 pb-4 border-b border-charcoal/10 gap-1">
        <h2 className="font-bebas text-[clamp(2rem,5vw,4rem)] tracking-[0.04em] leading-none">
          XIV Collections
          <br />
          <span className="text-accent">22 – 24</span>
        </h2>
        <span className="text-[0.65rem] tracking-[0.25em] uppercase text-warmgray">
          02 / Archive
        </span>
      </div>

      <div className="reveal grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-[2px]">
        {collections.map((col) => (
          <div key={col.label} className={col.className}>
            <Image
              src={col.image}
              alt={col.alt}
              fill
              className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 to-transparent flex flex-col justify-end p-6 md:p-8 z-10">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase text-cream/65 mb-1">
                {col.season}
              </span>
              <h3 className="font-bebas text-[1.5rem] md:text-[1.8rem] tracking-[0.08em] text-cream">
                {col.label}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
