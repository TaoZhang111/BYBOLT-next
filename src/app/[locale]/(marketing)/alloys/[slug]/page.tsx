import { PageIntro } from "@/components/marketing/page-intro";
import { getRequestLocale } from "@/i18n/routing";

function formatSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AlloyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale = await getRequestLocale(Promise.resolve({ locale: resolvedParams.locale }));
  const name = formatSlug(resolvedParams.slug);

  return (
    <PageIntro
      eyebrow={locale === "en" ? "Alloy grade" : "合金牌号"}
      title={name}
      description={
        locale === "en"
          ? "Reserved for CMS-driven composition, properties, standards, product forms, applications and downloadable data sheets."
          : "预留用于展示由 CMS 管理的成分、性能、标准、产品形态、应用及可下载数据表。"
      }
    />
  );
}
