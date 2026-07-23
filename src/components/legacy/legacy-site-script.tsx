"use client";

import Script from "next/script";

export function LegacySiteScript() {
  return (
    <>
      <Script src="/assets/vendor/gsap.min.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/ScrollTrigger.min.js" strategy="afterInteractive" />
      <Script src="/legacy-site.js" strategy="afterInteractive" />
    </>
  );
}
