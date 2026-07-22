import { StructuredPage } from "@/components/marketing/structured-page";
import type { LocaleParams } from "@/i18n/routing";
import { getRequestLocale } from "@/i18n/routing";

export default async function AlloysPage({ params }: { params: LocaleParams }) {
  return <StructuredPage locale={await getRequestLocale(params)} page="alloys" />;
}
