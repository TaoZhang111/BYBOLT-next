import type { Metadata } from "next";

import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

const articles = [
  ["Material selection", "What to specify before selecting a nickel alloy fastener", "A practical checklist covering temperature, corrosion media, load, mating materials and governing standards."],
  ["Drawing review", "Five details that reduce custom fastener quotation delays", "Revision control, tolerances, thread definition, material condition and inspection scope should be visible from the start."],
  ["Quality records", "How to define documentation requirements on an RFQ", "Separate mandatory certificates and tests from optional records so the final supply scope remains clear."],
] as const;

const faqs = [
  ["What information should be included in an RFQ?", "Include the product form, alloy grade, standard or drawing, dimensions, quantity, required testing, documentation and delivery destination."],
  ["Can BYBOLT review a customer drawing?", "Yes. The custom workflow is structured around drawing review, including geometry, tolerances, threads, material condition and inspection requirements."],
  ["Are material certificates available?", "Material certification and other records can be included when they are specified and confirmed as part of the order scope."],
  ["Which alloy grades can be considered?", "The current catalogue includes Inconel 625, Inconel 718, Hastelloy C-276, Monel K-500, A-286 and other project-specific alloy options."],
  ["Can standard and custom products be quoted together?", "Yes. List each line item clearly and attach the relevant drawings so standard and drawing-based products can be reviewed in one RFQ."],
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Fastener Resources and FAQ",
    description: "Read BYBOLT technical news, specification guidance and frequently asked questions about alloy fasteners and RFQs.",
    alternates: localizedAlternates(locale, "resources"),
  };
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  return (
    <InformationSiteShell locale={locale} current="resources">
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div><p className={styles.kicker}>Technical resources</p><h1>Better inputs create clearer supply decisions.</h1></div>
          <p className={styles.heroCopy}>Short technical notes and practical answers for buyers preparing alloy fastener specifications, drawings and documentation requirements.</p>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="resource-news-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>News and guidance</p><h2 id="resource-news-title">Recent technical topics.</h2></div><p>These article entries are ready to become CMS-managed news posts in the administrator phase.</p></div>
          <div className={styles.articleGrid}>
            {articles.map(([category, title, description], index) => (
              <article className={styles.articleCard} key={title}><span>{category}</span><h2>{title}</h2><p>{description}</p><time dateTime={`2026-0${8 - index}-01`}>Technical note {String(index + 1).padStart(2, "0")}</time></article>
            ))}
          </div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.sectionWhite}`} aria-labelledby="faq-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>Common questions</p><h2 id="faq-title">Frequently asked questions.</h2></div><p>Answers describe the current website workflow and do not replace the final technical review of a specific order.</p></div>
          <div className={styles.faqList}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </div>
      </section>
    </InformationSiteShell>
  );
}
