"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

import Link from "@/components/navigation/static-link";
import type { Locale } from "@/i18n/config";
import type { NewsArticle } from "@/types/product-catalog";

import styles from "@/components/marketing/information-site.module.css";

const PAGE_SIZE = 4;

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(value));
}

function NewsRow({ article, locale }: { article: NewsArticle; locale: Locale }) {
  const parts = formatDate(article.publishedAt, locale);
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  return (
    <Link className={styles.newsRow} href={`/${locale}/news/${article.slug}`}>
      <time dateTime={article.publishedAt}><strong>{month}-{day}</strong><span>{year}</span></time>
      <span className={styles.newsRowCopy}><small>{article.category}</small><b>{article.title}</b><span>{article.excerpt}</span></span>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

export function ResourceNewsFeed({ articles, locale }: { articles: NewsArticle[]; locale: Locale }) {
  const pinned = useMemo(() => articles.filter((article) => article.pinned).slice(0, 3), [articles]);
  const chronological = useMemo(() => articles.filter((article) => !article.pinned), [articles]);
  const pageCount = Math.max(1, Math.ceil(chronological.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const visible = chronological.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const copy = locale === "zh" ? {
    kicker: "技术资源",
    title: "近期技术主题。",
    intro: "置顶指南帮助采购和工程团队快速准备合金紧固件询价。",
    latest: "最新文章",
    latestIntro: "其余文章按发布时间排列，每页显示四篇。",
    all: "查看全部新闻",
    previous: "上一页",
    next: "下一页",
  } : {
    kicker: "Technical resources",
    title: "Recent technical topics.",
    intro: "Pinned guidance for procurement and engineering teams preparing alloy fastener enquiries.",
    latest: "Latest articles",
    latestIntro: "The remaining articles are ordered by publication date, four per page.",
    all: "View all news",
    previous: "Previous page",
    next: "Next page",
  };

  return (
    <>
      <div className={styles.sectionHeading}>
        <div><p className={styles.kicker}>{copy.kicker}</p><h2 id="resource-news-title">{copy.title}</h2></div>
        <p>{copy.intro}</p>
      </div>
      {pinned.length > 0 && <div className={styles.articleGrid}>
        {pinned.map((article) => (
          <Link className={styles.articleCard} href={`/${locale}/news/${article.slug}`} key={article.slug}>
            <span>{article.category}</span>
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
            <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { dateStyle: "medium" }).format(new Date(article.publishedAt))}</time>
          </Link>
        ))}
      </div>}
      <div className={styles.newsFeedHeading}>
        <div><p className={styles.kicker}>{copy.latest}</p><p>{copy.latestIntro}</p></div>
        <Link href={`/${locale}/news`}>{copy.all} <ArrowRight aria-hidden="true" /></Link>
      </div>
      <div className={styles.newsList}>{visible.map((article) => <NewsRow article={article} locale={locale} key={article.slug} />)}</div>
      {pageCount > 1 && <nav className={styles.pagination} aria-label="News pagination">
        <button type="button" aria-label={copy.previous} disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}><ArrowLeft /></button>
        <span>{page + 1} / {pageCount}</span>
        <button type="button" aria-label={copy.next} disabled={page === pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}><ArrowRight /></button>
      </nav>}
    </>
  );
}
