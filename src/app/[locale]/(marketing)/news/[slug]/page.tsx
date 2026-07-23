import { PageIntro } from "@/components/marketing/page-intro";
import { getRequestLocale } from "@/i18n/routing";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { locale: "en", slug: "cms-ready" },
    { locale: "zh", slug: "cms-ready" },
  ];
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale = await getRequestLocale(Promise.resolve({ locale: resolvedParams.locale }));

  return (
    <PageIntro
      eyebrow={locale === "en" ? "News article" : "新闻文章"}
      title={resolvedParams.slug.replaceAll("-", " ")}
      description={
        locale === "en"
          ? "This dynamic route is ready to receive a localized article from the CMS."
          : "该动态路由已准备好接收来自 CMS 的多语言文章内容。"
      }
    />
  );
}
