import Link from "@/components/navigation/static-link";
import { contactDetails } from "@/content/product-catalog";
import type { Locale } from "@/i18n/config";

import styles from "./information-site.module.css";

function resolveContactHref(locale: Locale, type: string, value: string, href: string): string | null {
  if (type === "email" && value) return `mailto:${value}`;
  if (type === "phone" && value) return `tel:${value.replace(/\s/g, "")}`;
  if (type === "link" && href.startsWith("/")) return `/${locale}${href}`;
  if (type === "link" && href) return href;
  return null;
}

export function ContactBand({ locale, titleId }: { locale: Locale; titleId: string }) {
  const zh = locale === "zh";
  if (contactDetails.length === 0) return null;

  const heading = zh ? "\u4e0e BYBOLT \u56e2\u961f\u8054\u7cfb\u3002" : "Contact the BYBOLT team.";
  const kicker = zh ? "\u8054\u7cfb\u6211\u4eec" : "Contact";
  const localizedLabels: Record<string, string> = {
    email: "\u90ae\u7bb1",
    phone: "\u7535\u8bdd",
    contact: "\u8054\u7cfb",
  };

  return (
    <section className={styles.contactBand} aria-labelledby={titleId}>
      <div className={`${styles.container} ${styles.contactGrid}`}>
        <div>
          <p className={styles.kicker}>{kicker}</p>
          <h2 id={titleId}>{heading}</h2>
        </div>
        <address>
          {contactDetails.map((method) => {
            const href = resolveContactHref(locale, method.type, method.value, method.href);
            const label = zh ? (localizedLabels[method.id] ?? method.label) : method.label;
            const value = zh && method.id === "contact" && method.value === "Send an enquiry"
              ? "\u53d1\u9001\u54a8\u8be2"
              : method.value;

            return (
              <p key={method.id}>
                <span>{label}</span>
                {href ? <Link href={href}>{value}</Link> : <b>{value || "\u2014"}</b>}
              </p>
            );
          })}
        </address>
      </div>
    </section>
  );
}
