"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ProductReveal({ className, children }: { className: string; children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const image = root.querySelector<HTMLElement>("[data-reveal-image]");
        const copy = root.querySelector<HTMLElement>("[data-reveal-copy]");

        if (image) {
          gsap.fromTo(
            image,
            { scale: 0.96, opacity: 0.76 },
            {
              scale: 1,
              opacity: 0.94,
              ease: "none",
              scrollTrigger: { trigger: root, start: "top 92%", end: "center 56%", scrub: 0.45 },
            },
          );
        }

        if (copy) {
          gsap.fromTo(
            copy,
            { opacity: 0.72, y: 14 },
            {
              opacity: 1,
              y: 0,
              ease: "none",
              scrollTrigger: { trigger: root, start: "top 88%", end: "center 60%", scrub: 0.4 },
            },
          );
        }
      });

      const refresh = () => ScrollTrigger.refresh();
      Promise.all([document.fonts.ready, ...Array.from(root.querySelectorAll("img")).map((image) => image.decode?.().catch(() => undefined))]).then(refresh);
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return <article ref={rootRef} className={className}>{children}</article>;
}
