"use client";

import Link from "@/components/navigation/static-link";
import { useEffect, useState } from "react";

import { CatalogDropdown } from "@/components/navigation/catalog-dropdown";
import { LanguageSelector } from "@/components/navigation/language-selector";
import { QuoteListNavLink } from "@/components/quote-list/quote-list-nav-link";
import type { Locale } from "@/i18n/config";

type HeaderSection = "products" | "materials" | "custom" | "quality" | "resources" | "about";

export function HomeHeader({ locale, solid = false, quoteCurrent = false, current }: { locale: Locale; solid?: boolean; quoteCurrent?: boolean; current?: HeaderSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const base = `/${locale}`;
  const navCopy = locale === "zh"
    ? { quality: "质量", resources: "资料", about: "关于", quote: "提交询价" }
    : locale === "ar"
      ? { quality: "الجودة", resources: "الموارد", about: "من نحن", quote: "طلب عرض سعر" }
      : { quality: "Quality", resources: "Resources", about: "About", quote: "Request a Quote" };

  useEffect(() => {
    const updateHeader = () => {
      setIsScrolled(window.scrollY > 18);

      const lightChapter = document.querySelector<HTMLElement>("[data-light-header-start]");
      const transitionLead = Math.min(260, window.innerHeight * 0.25);
      setIsLight(!solid && Boolean(lightChapter) && window.scrollY >= (lightChapter?.offsetTop ?? 0) - transitionLead);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, [solid]);

  return (
    <header className={`site-header${solid ? " is-solid" : ""}${isScrolled ? " is-scrolled" : ""}${isLight ? " is-light" : ""}`} data-header>
      <Link className="brand" href={base} aria-label="BYBOLT home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7.2 3.8 3.8 7.2v9.6l3.4 3.4h9.6l3.4-3.4V7.2l-3.4-3.4H7.2Zm.8 3h8l1.2 1.2v8l-1.2 1.2H8L6.8 16V8L8 6.8Zm1.8 3.4v3.6h4.4v-3.6H9.8Z" />
          </svg>
        </span>
        <span className="brand-copy">
          <strong>BYBOLT</strong>
          <small>built by bolt, made to endure</small>
        </span>
      </Link>
      <button
        className="nav-toggle"
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span />
        <span />
      </button>
      <nav className={`site-nav${isOpen ? " is-open" : ""}`} aria-label="Primary navigation">
        <CatalogDropdown kind="products" locale={locale} surface="home" current={current === "products"} onNavigate={() => setIsOpen(false)} />
        <CatalogDropdown kind="materials" locale={locale} surface="home" current={current === "materials"} onNavigate={() => setIsOpen(false)} />
        <CatalogDropdown kind="custom" locale={locale} surface="home" current={current === "custom"} onNavigate={() => setIsOpen(false)} />
        <Link href={`${base}/quality`} aria-current={current === "quality" ? "page" : undefined} onClick={() => setIsOpen(false)}>{navCopy.quality}</Link>
        <Link href={`${base}/resources`} aria-current={current === "resources" ? "page" : undefined} onClick={() => setIsOpen(false)}>{navCopy.resources}</Link>
        <Link href={`${base}/about`} aria-current={current === "about" ? "page" : undefined} onClick={() => setIsOpen(false)}>{navCopy.about}</Link>
        <QuoteListNavLink locale={locale} onNavigate={() => setIsOpen(false)} />
        <LanguageSelector locale={locale} />
        <Link className="nav-cta" href={`${base}/request-a-quote`} aria-current={quoteCurrent ? "page" : undefined} onClick={() => setIsOpen(false)}>{navCopy.quote}</Link>
      </nav>
    </header>
  );
}
