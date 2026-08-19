import Image from "next/image";

type Product = {
  name: string;
  price: string;
  image: string;
  alt: string;
  badge?: string;
};

const picks: Product[] = [
  {
    name: "Structured Blazer",
    price: "$220.00",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80",
    alt: "Blazer",
  },
  {
    name: "Raw Hem Denim",
    price: "$135.00",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=500&q=80",
    alt: "Denim",
    badge: "Limited",
  },
  {
    name: "Minimal Knit Vest",
    price: "$88.00",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&q=80",
    alt: "Vest",
  },
  {
    name: "Drop Shoulder Coat",
    price: "$310.00",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80",
    alt: "Coat",
  },
];

const delays = ["reveal-d1", "reveal-d2", "reveal-d3", "reveal-d4"];

export default function StaffPicks() {
  return (
    <section className="px-4 sm:px-6 md:px-14 py-16 md:py-20">
      <div className="reveal flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 md:mb-10 pb-4 border-b border-charcoal/10 gap-1">
        <h2 className="font-bebas text-[clamp(2rem,5vw,4rem)] tracking-[0.04em] leading-none">
          Staff Picks
        </h2>
        <span className="text-[0.65rem] tracking-[0.25em] uppercase text-warmgray">
          03 / Curated
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {picks.map((product, i) => (
          <div
            key={product.name}
            className={`reveal ${delays[i]} relative overflow-hidden bg-[#edeae3] group`}
          >
            {product.badge && (
              <span className="absolute top-3 left-3 z-10 bg-accent text-cream text-[0.6rem] tracking-[0.2em] uppercase px-2 py-1">
                {product.badge}
              </span>
            )}
            <div className="overflow-hidden aspect-[3/4] relative">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            {/* Quick Add overlay */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/25 transition-all duration-300 flex items-end justify-center pb-5 z-10">
              <button className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cream text-charcoal border-none px-5 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase cursor-pointer">
                Quick Add
              </button>
            </div>
            <div className="pt-3 pb-2 px-1">
              <h4 className="text-[0.82rem] sm:text-[0.85rem] tracking-[0.06em] font-normal mb-1">
                {product.name}
              </h4>
              <p className="text-[0.78rem] sm:text-[0.8rem] text-warmgray">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
