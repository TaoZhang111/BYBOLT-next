import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { InformationSiteShell } from "@/components/marketing/information-site-shell";
import styles from "@/components/marketing/information-site.module.css";
import Link from "@/components/navigation/static-link";
import { localizeNewsArticle, newsArticles } from "@/content/product-catalog";
import { isLocale, locales } from "@/i18n/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => newsArticles.map((article) => ({ locale, slug: article.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = newsArticles.find((item) => item.slug === slug);
  if (!article) return {};
  const localized = localizeNewsArticle(article, locale);
  return { title: localized.seoTitle || localized.title, description: localized.seoDescription || localized.excerpt };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const source = newsArticles.find((item) => item.slug === slug);
  if (!source) notFound();
  const article = localizeNewsArticle(source, locale);
  const zh = locale === "zh";

  return (
    <InformationSiteShell locale={locale} current="resources">
      <article className={styles.newsArticle}>
        <header className={styles.newsArticleHeader}>
          <div className={styles.container}>
            <Link className={styles.backLink} href={`/${locale}/news`}>&larr; {zh ? "返回新闻" : "Back to news"}</Link>
            <p className={styles.kicker}>{article.category}</p>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>
            <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { dateStyle: "long" }).format(new Date(article.publishedAt))}</time>
          </div>
        </header>
        {article.image && <figure className={`${styles.container} ${styles.newsArticleMedia}`}><Image src={article.image} alt={article.imageAlt || article.title} width={1440} height={720} sizes="(max-width: 760px) calc(100vw - 32px), min(1440px, calc(100vw - 64px))" unoptimized /></figure>}
        <div className={`${styles.container} ${styles.newsArticleBody}`}>{article.body.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </article>
    </InformationSiteShell>
  );
}
