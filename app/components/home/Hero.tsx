'use client'

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Hero() {
  const heroRightRef = useRef<HTMLDivElement>(null);

  // Parallax on hero right (desktop only)
  useEffect(() => {
    const el = heroRightRef.current;
    if (!el || window.innerWidth < 768) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.12}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="min-h-[calc(100vh-56px)] grid grid-cols-1 md:grid-cols-2 md:grid-rows-1 overflow-hidden">
      {/* LEFT: emblem, name, tagline, buttons */}
      <div
        className="flex flex-col items-center pt-10 pb-12 px-6 md:pl-14 md:pr-12
                   justify-center lg:justify-between lg:pt-14 lg:pb-16 lg:min-h-[calc(100vh-56px)]"
      >
        <div className="text-center select-none w-full max-w-sm mx-auto">
          {/* Emblem */}
          <div className="reveal mx-auto mb-6 h-24 w-24 rounded-full border-4 border-accent flex items-center justify-center bg-neutral-900 shadow-[0_0_25px_rgba(255,255,255,0.25)]">
            <span className="text-3xl font-vintage text-accent">BV</span>
          </div>

          {/* Brand name */}
          <h1 className="reveal reveal-d1 font-vintage text-4xl sm:text-5xl md:text-6xl text-accent tracking-widest">
            Blockfuse
          </h1>

          {/* Sub brand */}
          <p className="reveal reveal-d2 mt-2 font-clean text-xs sm:text-sm md:text-base text-warmgray tracking-[0.35em] uppercase">
            Vintage
          </p>

          {/* Decorative line */}
          <div className="reveal reveal-d2 mt-5 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-accent"></span>
            <span className="h-2 w-2 rounded-full bg-accent"></span>
            <span className="h-px w-16 bg-accent"></span>
          </div>

          {/* Tagline */}
          <p className="reveal reveal-d3 mt-6 font-clean text-warmgray text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
            Blockfuse Vintage blends heritage craftsmanship with modern
            sophistication. Designed for individuals who appreciate classic
            fashion with bold presence.
          </p>

          {/* Buttons: sm/md */}
          <div className="reveal reveal-d4 mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 lg:hidden">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-cream bg-charcoal px-8 py-3.5 no-underline transition-all duration-300 hover:bg-accent whitespace-nowrap"
            >
              Shop Now →
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-charcoal bg-transparent px-8 py-3.5 no-underline border border-charcoal transition-all duration-300 hover:bg-accent hover:border-transparent hover:text-cream whitespace-nowrap"
            >
              Explore Lookbook
            </a>
          </div>
        </div>

        {/* Buttons: lg */}
        <div className="reveal reveal-d4 hidden lg:flex flex-row items-center justify-center gap-3 w-full max-w-sm mt-auto">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-cream bg-charcoal px-8 py-3.5 no-underline transition-all duration-300 hover:bg-accent whitespace-nowrap"
          >
            Shop Now →
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-[0.72rem] tracking-wider3 uppercase text-charcoal bg-transparent px-8 py-3.5 no-underline border border-charcoal transition-all duration-300 hover:bg-accent hover:border-transparent hover:text-cream whitespace-nowrap"
          >
            Explore Lookbook
          </a>
        </div>
      </div>

      {/* RIGHT: hero image */}
      <div
        ref={heroRightRef}
        className="relative overflow-hidden bg-hero min-h-[60vw] md:min-h-0 md:h-full group"
      >
        <Image
          src="https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=900&q=80"
          alt="Hero model"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-[8000ms] ease-linear group-hover:scale-[1.04]"
          priority
        />
        <div className="absolute bottom-8 left-8 bg-charcoal text-cream px-5 py-3 text-[0.65rem] tracking-[0.2em] uppercase z-10">
          <strong className="block font-bebas text-[1.4rem] tracking-[0.06em] font-normal">
            SS 25
          </strong>
          New Arrivals
        </div>
      </div>
    </section>
  );
}
