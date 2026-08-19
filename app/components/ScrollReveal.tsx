'use client'

import { useEffect } from "react";

/**
 * Mounts a single IntersectionObserver that adds the `visible` class
 * to every `.reveal` element on the page. Drop this once in the layout
 * or page — no need to repeat the observer in each component.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    // Observe all current and future elements lazily via a MutationObserver
    const attach = () =>
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => obs.observe(el));

    attach();

    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      obs.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
