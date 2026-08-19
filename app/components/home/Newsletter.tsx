'use client'

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to email service
    setEmail("");
  };

  return (
    <div className="bg-charcoal px-4 sm:px-6 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
      <div className="text-center md:text-left">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-accent mb-2">
          Stay Connected
        </p>
        <h3 className="font-bebas text-[1.8rem] md:text-[2.2rem] tracking-[0.06em] text-cream">
          Join the XIV Inner Circle
        </h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full md:w-auto max-w-[420px]"
      >
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 min-w-0 px-4 md:px-5 py-4 bg-white/[.07] border border-white/[.15] border-r-0 text-cream text-[0.82rem] outline-none font-barlow placeholder-cream/30"
        />
        <button
          type="submit"
          className="px-5 md:px-6 py-4 bg-accent text-charcoal text-[0.68rem] tracking-[0.2em] uppercase border-none whitespace-nowrap hover:bg-[#e0be80] transition-colors duration-300 cursor-pointer"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
