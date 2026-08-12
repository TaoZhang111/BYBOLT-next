import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import Link from "@/components/navigation/static-link";
import { localizeNewsArticle, newsArticles } from "@/content/product-catalog";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "News and Technical Insights",
    description: "Browse BYBOLT news and technical guidance for high-temperature alloy fasteners, round bar, drawings and quality documentation.",
    alternates: localizedAlternates(locale, "news"),
  };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const articles = newsArticles.map((article) => localizeNewsArticle(article, locale));
  const zh = locale === "zh";

  return (
    <InformationSiteShell locale={locale} current="resources">
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div><p className={styles.kicker}>{zh ? "新闻与技术洞察" : "News and technical insights"}</p><h1>{zh ? "技术信息，按时间清晰归档。" : "Technical information, clearly archived."}</h1></div>
          <p className={styles.heroCopy}>{zh ? "查看合金选择、图纸评审、质量记录与制造准备相关的最新内容。" : "Browse updates on alloy selection, drawing review, quality records and manufacturing preparation."}</p>
        </div>
      </section>
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.container}>
          <div className={styles.newsArchive}>
            {articles.map((article) => {
              const date = new Date(article.publishedAt);
              const monthDay = new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { month: "2-digit", day: "2-digit" }).format(date).replace("/", "-");
              return <Link className={styles.newsRow} href={`/${locale}/news/${article.slug}`} key={article.slug}>
                <time dateTime={article.publishedAt}><strong>{monthDay}</strong><span>{date.getUTCFullYear()}</span></time>
                <span className={styles.newsRowCopy}><small>{article.category}</small><b>{article.title}</b><span>{article.excerpt}</span></span>
                <ArrowRight aria-hidden="true" />
              </Link>;
            })}
          </div>
        </div>
      </section>
    </InformationSiteShell>
  );
}
