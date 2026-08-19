const marqueeItems = [
  "New Collection",
  "SS25",
  "Blockfuse Vintage",
  "Free Shipping",
  "Drop 01",
  "Refined Essentials",
];

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-charcoal/10 py-4 bg-charcoal">
      <div className="flex gap-12 whitespace-nowrap animate-marquee text-white">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="flex items-center gap-12 shrink-0">
            <span className="text-[0.7rem] tracking-widest uppercase shrink-0">
              {item}
            </span>
            <span className="text-accent shrink-0">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}