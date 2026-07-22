import Link from "next/link";

import { Container } from "@/components/ui/container";
import type { LocaleParams } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/routing";

const pillars = {
  en: [
    ["Alloy portfolio", "Nickel-, cobalt- and iron-based superalloys organized around customer specifications."],
    ["Supply capability", "Product forms, processing, testing, traceability and export delivery in one clear system."],
    ["Technical confidence", "Standards, certifications, data sheets and engineering content built for professional buyers."],
  ],
  zh: [
    ["合金产品体系", "围绕客户规格组织镍基、钴基及铁基高温合金。"],
    ["供应与交付能力", "系统呈现产品形态、加工、检测、追溯及出口交付能力。"],
    ["技术可信度", "为专业采购人员提供标准、认证、数据表和工程内容。"],
  ],
} as const;

export default async function HomePage({ params }: { params: LocaleParams }) {
  const locale = await getRequestLocale(params);
  const isEnglish = locale === "en";

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-industrial py-24 text-white sm:py-36">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(211,95,45,0.28),transparent_66%)]" />
        <Container className="relative">
          <p className="text-xs font-semibold tracking-[0.24em] text-orange-300 uppercase">
            {isEnglish ? "Built for extreme environments" : "面向极端工况"}
          </p>
          <h1 className="mt-6 max-w-5xl text-5xl leading-[0.98] font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">
            {isEnglish
              ? "High-performance superalloys for demanding applications"
              : "服务严苛应用的高性能高温合金"}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65">
            {isEnglish
              ? "A multilingual B2B platform for alloy discovery, technical verification and international enquiries."
              : "面向海外客户的多语言 B2B 平台，支持材料查找、技术验证与国际询价。"}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link className="bg-accent px-6 py-3 font-semibold hover:bg-accent-strong" href={`/${locale}/alloys`}>
              {isEnglish ? "Explore Alloys" : "查看合金产品"}
            </Link>
            <Link className="border border-white/30 px-6 py-3 font-semibold hover:border-white" href={`/${locale}/request-a-quote`}>
              {isEnglish ? "Request a Quote" : "提交询价"}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">
              {isEnglish ? "Website foundation" : "网站基础结构"}
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              {isEnglish ? "Brand, product knowledge and lead generation" : "品牌、产品知识与销售获客"}
            </h2>
          </div>
          <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
            {pillars[locale].map(([title, description], index) => (
              <article className="min-h-72 bg-surface p-8" key={title}>
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <h3 className="mt-20 text-xl font-semibold">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-16">
        <Container className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-muted">{isEnglish ? "Have a material requirement?" : "已有材料需求？"}</p>
            <h2 className="mt-2 text-3xl font-semibold">
              {isEnglish ? "Start with a structured RFQ." : "从结构化询价开始。"}
            </h2>
          </div>
          <Link className="self-start bg-industrial px-6 py-3 font-semibold text-white md:self-auto" href={`/${locale}/request-a-quote`}>
            {isEnglish ? "Send requirements" : "发送需求"}
          </Link>
        </Container>
      </section>
    </main>
  );
}
