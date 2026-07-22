import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { homeContent } from "@/content/home-content";
import type { LocaleParams } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/routing";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  inverted = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  inverted?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-semibold tracking-[0.22em] uppercase ${inverted ? "text-orange-300" : "text-accent"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-5 text-4xl leading-tight font-semibold tracking-[-0.04em] sm:text-5xl ${inverted ? "text-white" : "text-foreground"}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-6 text-lg leading-8 ${inverted ? "text-white/65" : "text-muted"}`}>{description}</p>
      ) : null}
    </div>
  );
}

export default async function HomePage({ params }: { params: LocaleParams }) {
  const locale = await getRequestLocale(params);
  const content = homeContent[locale];

  return (
    <main className="flex-1 overflow-hidden">
      {/* 01 — Hero */}
      <section className="relative isolate min-h-[760px] overflow-hidden bg-industrial text-white">
        <Image
          fill
          priority
          alt={locale === "en" ? "Glowing alloy billet in a metallurgy facility" : "冶金设施中的高温合金坯料"}
          className="object-cover object-[68%_center]"
          sizes="100vw"
          src="/images/bybolt-hero.jpg"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,19,22,0.97)_0%,rgba(15,19,22,0.84)_38%,rgba(15,19,22,0.2)_73%,rgba(15,19,22,0.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-industrial/80 to-transparent" />
        <Container className="relative flex min-h-[760px] items-center py-24">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-orange-300 uppercase">{content.hero.eyebrow}</p>
            <h1 className="mt-7 text-5xl leading-[0.98] font-semibold tracking-[-0.055em] sm:text-7xl lg:text-[6.4rem]">
              {content.hero.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">{content.hero.description}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link className="inline-flex items-center gap-3 bg-accent px-6 py-3.5 font-semibold transition hover:bg-accent-strong" href={`/${locale}/alloys`}>
                {content.hero.primaryCta} <Arrow />
              </Link>
              <Link className="inline-flex items-center gap-3 border border-white/35 px-6 py-3.5 font-semibold transition hover:border-white hover:bg-white/5" href={`/${locale}/request-a-quote`}>
                {content.hero.secondaryCta} <Arrow />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 02 — Procurement trust strip */}
      <section className="border-b border-line bg-surface py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_3fr] lg:items-start">
            <p className="max-w-sm text-lg font-semibold leading-7">{content.trust.title}</p>
            <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
              {content.trust.items.map(([title, description], index) => (
                <article className="bg-surface p-5" key={title}>
                  <p className="font-mono text-[0.7rem] text-accent">0{index + 1}</p>
                  <h2 className="mt-5 font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 03 — Company introduction */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <SectionHeading eyebrow={content.company.eyebrow} title={content.company.title} description={content.company.description} />
          <div className="border-l border-line pl-7">
            <ul className="space-y-5">
              {content.company.points.map((point, index) => (
                <li className="flex items-center gap-4 text-lg font-medium" key={point}>
                  <span className="font-mono text-xs text-accent">0{index + 1}</span>
                  {point}
                </li>
              ))}
            </ul>
            <Link className="mt-9 inline-flex items-center gap-3 border-b border-foreground pb-1 text-sm font-semibold" href={`/${locale}/about`}>
              {content.company.link} <Arrow />
            </Link>
          </div>
        </Container>
      </section>

      {/* 04 — Product categories */}
      <section className="border-y border-line bg-surface py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:items-end">
            <SectionHeading eyebrow={content.products.eyebrow} title={content.products.title} description={content.products.description} />
            <div className="relative min-h-80 overflow-hidden bg-industrial lg:min-h-[430px]">
              <Image
                fill
                alt={locale === "en" ? "Selection of superalloy product forms" : "多种高温合金产品形态"}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="/images/bybolt-product-forms.jpg"
              />
            </div>
          </div>

          <div className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {content.products.items.map(([title, description], index) => (
              <Link className="group min-h-52 bg-background p-7 transition hover:bg-industrial hover:text-white" href={`/${locale}/product-forms`} key={title}>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-accent">0{index + 1}</span>
                  <span className="transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true">↗</span>
                </div>
                <h3 className="mt-16 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted group-hover:text-white/60">{description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 05 — Material capability */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={content.materials.eyebrow} title={content.materials.title} description={content.materials.description} />
            <Link className="inline-flex shrink-0 items-center gap-3 self-start border-b border-foreground pb-1 text-sm font-semibold" href={`/${locale}/alloys`}>
              {content.materials.link} <Arrow />
            </Link>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {content.materials.items.map(([title, description], index) => (
              <article className="relative min-h-80 overflow-hidden border border-line bg-surface p-8" key={title}>
                <div className="absolute -right-20 -bottom-24 size-64 rounded-full border-[32px] border-foreground/[0.035]" />
                <span className="font-mono text-xs text-accent">M-{index + 1}</span>
                <h3 className="mt-24 max-w-xs text-2xl font-semibold tracking-[-0.025em]">{title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-6 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 06 — Custom and supply capability */}
      <section className="bg-industrial py-24 text-white sm:py-32">
        <Container>
          <SectionHeading inverted eyebrow={content.supply.eyebrow} title={content.supply.title} description={content.supply.description} />
          <ol className="mt-16 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {content.supply.steps.map(([title, description], index) => (
              <li className="min-h-64 bg-industrial p-7" key={title}>
                <span className="font-mono text-xs text-orange-300">0{index + 1}</span>
                <h3 className="mt-20 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 07 — Quality and traceability */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow={content.quality.eyebrow} title={content.quality.title} description={content.quality.description} />
            <Link className="mt-9 inline-flex items-center gap-3 border-b border-foreground pb-1 text-sm font-semibold" href={`/${locale}/quality`}>
              {content.quality.link} <Arrow />
            </Link>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {content.quality.items.map(([title, description], index) => (
              <article className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr]" key={title}>
                <span className="font-mono text-xs text-accent">Q{index + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 08 — Applications */}
      <section className="border-y border-line bg-surface py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={content.applications.eyebrow} title={content.applications.title} />
            <Link className="inline-flex shrink-0 items-center gap-3 self-start border-b border-foreground pb-1 text-sm font-semibold" href={`/${locale}/industries`}>
              {content.applications.link} <Arrow />
            </Link>
          </div>
          <div className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {content.applications.items.map(([title, description], index) => (
              <article className="group min-h-60 bg-surface p-7 transition hover:bg-background" key={title}>
                <span className="font-mono text-xs text-accent">A-{index + 1}</span>
                <h3 className="mt-20 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 09 — Quotation process */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow={content.quote.eyebrow} title={content.quote.title} />
          <ol className="mt-16 grid gap-10 lg:grid-cols-4 lg:gap-0">
            {content.quote.steps.map(([number, title, description], index) => (
              <li className="relative border-l border-line pl-6 lg:border-t lg:border-l-0 lg:px-6 lg:pt-8" key={number}>
                <span className="absolute -left-2 top-0 size-4 rounded-full border-4 border-background bg-accent lg:-top-2 lg:left-6" />
                <span className="font-mono text-xs text-accent">{number}</span>
                <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
                {index < content.quote.steps.length - 1 ? <span className="sr-only">Next step</span> : null}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 10 — Final RFQ CTA */}
      <section className="relative overflow-hidden bg-industrial py-24 text-white sm:py-32">
        <div className="absolute -right-40 top-1/2 size-[34rem] -translate-y-1/2 rounded-full border-[80px] border-accent/15" />
        <Container className="relative">
          <p className="text-xs font-semibold tracking-[0.22em] text-orange-300 uppercase">{content.finalCta.eyebrow}</p>
          <h2 className="mt-6 max-w-5xl text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-6xl">{content.finalCta.title}</h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">{content.finalCta.description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link className="inline-flex items-center gap-3 bg-accent px-6 py-3.5 font-semibold transition hover:bg-accent-strong" href={`/${locale}/request-a-quote`}>
              {content.finalCta.primaryCta} <Arrow />
            </Link>
            <Link className="inline-flex items-center gap-3 border border-white/30 px-6 py-3.5 font-semibold transition hover:border-white" href={`/${locale}/contact`}>
              {content.finalCta.secondaryCta} <Arrow />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
