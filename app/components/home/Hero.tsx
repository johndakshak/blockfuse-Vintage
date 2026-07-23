export default function Hero() {
  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* LEFT SIDE: emblem, name, tagline, buttons */}
      <div
        className="flex flex-col items-center pt-28 pb-12 px-6 md:pl-14 md:pr-12
                   justify-center lg:justify-between lg:pt-36 lg:pb-16 lg:min-h-screen"
      >
        <div className="text-center select-none w-full max-w-sm mx-auto">
          <div className="mx-auto mb-6 h-24 w-24 rounded-full border-4 border-accent flex items-center justify-center bg-neutral-900 shadow-[0_0_25px_rgba(255,255,255,0.25)]">
            <span className="text-3xl font-vintage text-accent">BV</span>
          </div>
          <h1 className="font-vintage text-4xl sm:text-5xl md:text-6xl text-accent tracking-widest">
            Blockfuse
          </h1>
          <p className="mt-2 font-clean text-xs sm:text-sm md:text-base text-warmgray tracking-[0.35em] uppercase">
            Vintage
          </p>
          <div className="mt-5 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-accent"></span>
            <span className="h-2 w-2 rounded-full bg-accent"></span>
            <span className="h-px w-16 bg-accent"></span>
          </div>
          <p className="mt-6 font-clean text-warmgray text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
            Blockfuse Vintage blends heritage craftsmanship with modern
            sophistication. Designed for individuals who appreciate classic
            fashion with bold presence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 lg:hidden">
            
            <a  href="#"
              className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-cream bg-charcoal px-8 py-3.5 no-underline transition-all duration-300 hover:bg-accent whitespace-nowrap"
            >
              Shop Now →
            </a>
            
             <a href="#"
              className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-charcoal bg-transparent px-8 py-3.5 no-underline border border-charcoal transition-all duration-300 hover:bg-accent hover:border-transparent hover:text-cream whitespace-nowrap"
            >
              Explore Lookbook
            </a>
          </div>
        </div>
        <div className="hidden lg:flex flex-row items-center justify-center gap-3 w-full max-w-sm mt-auto">
          
           <a href="#"
            className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-cream bg-charcoal px-8 py-3.5 no-underline transition-all duration-300 hover:bg-accent whitespace-nowrap"
          >
            Shop Now →
          </a>
          
           <a href="#"
            className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-charcoal bg-transparent px-8 py-3.5 no-underline border border-charcoal transition-all duration-300 hover:bg-accent hover:border-transparent hover:text-cream whitespace-nowrap"
          >
            Explore Lookbook
          </a>
        </div>
      </div>
      {/* RIGHT SIDE: hero image */}
      <div className="relative overflow-hidden bg-hero min-h-[60vw] md:min-h-0 group">
        <img
          src="https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=900&q=80"
          alt="Hero model"
          className="w-full h-full object-cover transition-transform duration-[8000ms] ease-linear group-hover:scale-[1.04]"
        />
        <div className="absolute bottom-8 left-8 bg-charcoal text-cream px-5 py-3 text-[0.65rem] tracking-[0.2em] uppercase">
          <strong className="block font-bebas text-[1.4rem] tracking-[0.06em] font-normal">
            SS 25
          </strong>
          New Arrivals
        </div>
      </div>
    </section>
  );
}