"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollMedia({
  className,
  src,
  alt,
  width,
  height,
}: {
  className: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const figureRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const figure = figureRef.current;
      if (!figure) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: figure,
            start: "top 94%",
            end: "bottom 8%",
            scrub: 1.1,
          },
        })
          .fromTo(figure, { scale: 0.94, opacity: 0.72 }, { scale: 1, opacity: 1, duration: 0.46, ease: "none" })
          .to(figure, { scale: 0.98, opacity: 0.72, duration: 0.54, ease: "none" });
      });

      return () => media.revert();
    },
    { scope: figureRef },
  );

  return (
    <figure ref={figureRef} className={`${className} reveal-media`}>
      {/* Native images preserve the accepted static site's exact crop and loading behavior. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
    </figure>
  );
}
