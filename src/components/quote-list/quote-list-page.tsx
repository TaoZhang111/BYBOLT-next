"use client";

import Link from "@/components/navigation/static-link";
import { HomeHeader } from "@/components/home/home-header";
import type { Locale } from "@/i18n/config";

import { useQuoteList } from "./quote-list-context";
import styles from "./quote-list.module.css";

export function QuoteListPage({ locale }: { locale: Locale }) {
  const { items, hydrated, updateItem, removeItem, clearItems, addManualItem } = useQuoteList();
  const base = `/${locale}`;

  return (
    <div className={styles.page}>
      <HomeHeader locale={locale} solid />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div><p className={styles.eyebrow}>BOM / QUOTE WORKSPACE</p><h1>Quote List</h1></div>
            <p className={styles.heroCopy}>Build one technical enquiry from several products. Compare the catalogue references, add project-specific details and send the complete list for review.</p>
          </div>
        </section>

        <section className={styles.workspace}>
          <div className={styles.container}>
            <div className={styles.toolbar}>
              <strong>{hydrated ? `${items.length} ${items.length === 1 ? "line item" : "line items"}` : "Loading quote list"}</strong>
              <div className={styles.toolbarActions}>
                <button className={styles.textButton} type="button" onClick={() => addManualItem()}>+ Add manual item</button>
                {items.length > 0 && <button className={styles.textButton} type="button" onClick={clearItems}>Clear list</button>}
              </div>
            </div>

            {hydrated && items.length === 0 ? (
              <div className={styles.empty}>
                <div><p className={styles.eyebrow}>NO ITEMS YET</p><h2>Start with a product or a drawing.</h2><p>Add catalogue products as you browse, or create a manual line for a drawing-based requirement.</p><div className={styles.toolbarActions}><Link className={styles.primaryButton} href={`${base}/products/`}>Browse products</Link><button className={styles.outlineButton} type="button" onClick={() => addManualItem()}>Add manual item</button></div></div>
              </div>
            ) : (
              <div className={styles.lineItems}>
                {items.map((item, index) => (
                  <article className={styles.lineItem} key={item.id}>
                    <span className={styles.lineNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <div className={styles.productIdentity}><span>{item.categoryName}</span><h2>{item.productName || "New requirement"}</h2><p>{item.description || "Enter the product or drawing reference, then add the commercial details."}</p></div>
                    <div className={styles.fields}>
                      <label className={styles.field}><span>Product / drawing</span><input value={item.productName} onChange={(event) => updateItem(item.id, { productName: event.target.value })} /></label>
                      <label className={styles.field}><span>Material grade</span><input value={item.material} placeholder="e.g. Inconel 718" onChange={(event) => updateItem(item.id, { material: event.target.value })} /></label>
                      <label className={styles.field}><span>Size / drawing no.</span><input value={item.requestedSize} placeholder={item.catalogSize || "M16 × 80 / DRW-1042"} onChange={(event) => updateItem(item.id, { requestedSize: event.target.value })} /></label>
                      <label className={styles.field}><span>Quantity</span><span className={styles.quantity}><input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: event.target.value })} /><select aria-label={`Quantity unit for ${item.productName || `item ${index + 1}`}`} value={item.quantityUnit} onChange={(event) => updateItem(item.id, { quantityUnit: event.target.value as typeof item.quantityUnit })}><option>pcs</option><option>sets</option><option>kg</option></select></span></label>
                      <label className={`${styles.field} ${styles.fieldWide}`}><span>Required standard</span><input value={item.standard} placeholder={item.catalogStandard || "ASTM, ASME, DIN, ISO or project specification"} onChange={(event) => updateItem(item.id, { standard: event.target.value })} /></label>
                      <label className={`${styles.field} ${styles.fieldWide}`}><span>Line notes</span><textarea rows={2} value={item.notes} placeholder="Tolerance, finish, testing, packaging or service condition" onChange={(event) => updateItem(item.id, { notes: event.target.value })} /></label>
                    </div>
                    <button className={styles.removeButton} type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.productName || `item ${index + 1}`}`}>Remove</button>
                  </article>
                ))}
              </div>
            )}

            {items.length > 1 && (
              <section className={styles.comparison} aria-labelledby="comparison-title">
                <div className={styles.sectionHeader}><h2 id="comparison-title">Catalogue comparison</h2><p>Reference values help align the enquiry. Your requested values above are the values sent for quotation.</p></div>
                <div className={styles.comparisonScroller}>
                  <table className={styles.comparisonTable}>
                    <thead><tr><th>Reference</th>{items.map((item) => <th key={item.id}>{item.productName || "Manual item"}</th>)}</tr></thead>
                    <tbody>
                      <tr><td>Category</td>{items.map((item) => <td key={item.id}>{item.categoryName}</td>)}</tr>
                      <tr><td>Description</td>{items.map((item) => <td key={item.id}>{item.description || "Drawing-defined requirement"}</td>)}</tr>
                      <tr><td>Catalog size</td>{items.map((item) => <td key={item.id}>{item.catalogSize || "Drawing-defined"}</td>)}</tr>
                      <tr><td>Standard</td>{items.map((item) => <td key={item.id}>{item.catalogStandard || "Project specification"}</td>)}</tr>
                      <tr><td>Thread / tolerance</td>{items.map((item) => <td key={item.id}>{item.threads || "As specified"}</td>)}</tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {items.length > 0 && <div className={styles.finalBar}><div><h2>Ready for commercial review?</h2><p>Send every line item, BOM note and drawing in one enquiry.</p></div><div className={styles.finalActions}><Link className={styles.outlineButton} href={`${base}/products/`}>Continue browsing</Link><Link className={styles.primaryButton} href={`${base}/request-a-quote/?from=quote-list`}>Continue to RFQ</Link></div></div>}
          </div>
        </section>
      </main>
    </div>
  );
}
