"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { processSteps } from "@/content/home-content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function SupplyProcess() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-process-step]", section);
      const images = gsap.utils.toArray<HTMLElement>("[data-process-image]", section);
      const media = gsap.matchMedia();

      const activate = (activeIndex: number) => {
        images.forEach((image, index) => {
          image.classList.toggle("is-active", index === activeIndex);
          image.setAttribute("aria-hidden", String(index !== activeIndex));
        });
        cards.forEach((card, index) => card.classList.toggle("is-active", index === activeIndex));
      };

      media.add(
        {
          desktop: "(min-width: 761px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          if (!conditions?.desktop || conditions.reduce) {
            images.forEach((image) => image.removeAttribute("aria-hidden"));
            cards.forEach((card) => card.classList.remove("is-active"));
            images.forEach((image) => image.classList.remove("is-active"));
            return;
          }

          activate(0);
          cards.forEach((card, index) => {
            ScrollTrigger.create({
              trigger: card,
              start: "top 58%",
              end: "bottom 42%",
              onEnter: () => activate(index),
              onEnterBack: () => activate(index),
            });
          });
        },
      );

      let cancelled = false;
      const refresh = () => {
        if (!cancelled) ScrollTrigger.refresh();
      };
      const imageReady = images.map((figure) => {
        const image = figure.querySelector("img");
        if (!image || image.complete) return Promise.resolve();
        return image.decode?.().catch(() => undefined) ?? Promise.resolve();
      });
      Promise.all([document.fonts.ready, ...imageReady]).then(refresh);
      window.addEventListener("load", refresh, { once: true });

      return () => {
        cancelled = true;
        window.removeEventListener("load", refresh);
        media.revert();
        images.forEach((image) => image.removeAttribute("aria-hidden"));
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="section process-journey light-chapter" id="company" aria-labelledby="process-title">
      <div className="container process-journey-grid">
        <div className="process-heading">
          <p className="eyebrow dark">From RFQ to shipment</p>
          <h2 id="process-title">A predictable supply workflow.</h2>
          <p>Each image and workflow card moves as one matched stage, then stacks over the stage before it.</p>
        </div>
        <div className="process-image-list" aria-live="polite">
          {processSteps.map((step, index) => (
            <figure className={`process-image${index === 0 ? " is-active" : ""}`} data-process-image={index} key={step.number}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.image} alt={step.alt} width={index === 0 ? 1717 : index === 1 ? 1672 : index === 3 ? 1774 : 1536} height={index === 0 ? 916 : index === 1 ? 941 : index === 3 ? 887 : 1024} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
        <div className="process-card-list">
          {processSteps.map((step, index) => (
            <article className={`process-card${index === 0 ? " is-active" : ""}`} data-process-step={index} key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
