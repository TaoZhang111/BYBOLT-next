import type { Metadata } from "next";

import Link from "@/components/navigation/static-link";
import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import { ResourceNewsFeed } from "@/components/resources/resource-news-feed";
import { contactDetails, frequentlyAskedQuestions, localizeFaq, localizeNewsArticle, newsArticles } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Fastener Resources, News and FAQ",
    description: "Read BYBOLT technical guidance, alloy fastener news and frequently asked questions about specifications, drawings and RFQs.",
    alternates: localizedAlternates(locale, "resources"),
  };
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const localizedNews = newsArticles.map((article) => localizeNewsArticle(article, locale));
  const localizedFaqs = frequentlyAskedQuestions.map((faq) => localizeFaq(faq, locale));
  const zh = locale === "zh";

  return (
    <InformationSiteShell locale={locale} current="resources">
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div><p className={styles.kicker}>{zh ? "技术资源" : "Technical resources"}</p><h1>{zh ? "更完整的信息，带来更清晰的供应决策。" : "Better inputs create clearer supply decisions."}</h1></div>
          <p className={styles.heroCopy}>{zh ? "面向采购和工程团队的合金紧固件选材、图纸、检验与文件准备指南。" : "Technical notes and practical answers for buyers preparing alloy fastener specifications, drawings and documentation requirements."}</p>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="resource-news-title">
        <div className={styles.container}><ResourceNewsFeed articles={localizedNews} locale={locale} /></div>
      </section>
      <section className={`${styles.section} ${styles.sectionWhite}`} aria-labelledby="faq-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>{zh ? "常见问题" : "Common questions"}</p><h2 id="faq-title">{zh ? "常见问题解答。" : "Frequently asked questions."}</h2></div><p>{zh ? "以下回答说明当前网站和询价流程，具体订单仍需进行技术评审。" : "Answers describe the current website workflow and do not replace the final technical review of a specific order."}</p></div>
          <div className={styles.faqList}>{localizedFaqs.map((faq) => <details key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
        </div>
      </section>
      <section className={styles.contactBand} aria-labelledby="resource-contact-title">
        <div className={`${styles.container} ${styles.contactGrid}`}>
          <div><p className={styles.kicker}>{zh ? "联系我们" : "Contact"}</p><h2 id="resource-contact-title">{zh ? "与 BYBOLT 团队联系。" : "Contact the BYBOLT team."}</h2></div>
          <address>
            {contactDetails.email && <p><span>{zh ? "邮箱" : "Email"}</span><Link href={`mailto:${contactDetails.email}`}>{contactDetails.email}</Link></p>}
            {contactDetails.phone && <p><span>{zh ? "电话" : "Phone"}</span><Link href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}>{contactDetails.phone}</Link></p>}
            {contactDetails.wechat && <p><span>WeChat</span><b>{contactDetails.wechat}</b></p>}
          </address>
        </div>
      </section>
    </InformationSiteShell>
  );
}
