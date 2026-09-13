"use client";

import Link from "@/components/navigation/static-link";
import { useQuoteList } from "@/components/quote-list/quote-list-context";
import type { Locale } from "@/i18n/config";
import { type DragEvent, type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

const countries = ["United States", "Canada", "Mexico", "United Kingdom", "Germany", "France", "Italy", "Netherlands", "Spain", "Poland", "Turkey", "United Arab Emirates", "Saudi Arabia", "India", "Singapore", "Malaysia", "Indonesia", "Japan", "South Korea", "Australia", "Brazil", "South Africa"];
const materials = ["Inconel 625", "Inconel 718", "Hastelloy C276", "Monel 400", "Titanium Grade 2", "Titanium Grade 5", "Duplex 2205", "Super Duplex 2507"];
const tests = ["MTC / EN 10204 3.1", "PMI", "Hardness", "Tensile", "Ultrasonic", "Third-party inspection", "Other"];
const acceptedExtensions = new Set(["pdf", "dwg", "dxf", "step", "stp", "xls", "xlsx", "csv", "jpg", "jpeg", "png", "webp"]);
const maxAttachmentBytes = 3 * 1024 * 1024;
const maxAttachmentCount = 8;
const rfqApiUrl = process.env.NEXT_PUBLIC_RFQ_API_URL || "https://bybolt-quote-api.tao1461248574.workers.dev";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getValidationMessage(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (field.validity.valueMissing) return "Please complete this required field.";
  if (field.validity.typeMismatch && field.type === "email") return "Enter a valid business email address.";
  return "Check this value and try again.";
}

function FieldError({ name, errors }: { name: string; errors: Record<string, string> }) {
  return <small className="field-error">{errors[name] ?? ""}</small>;
}

export function RfqForm({ locale }: { locale: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryApplied = useRef(false);
  const { items, hydrated, addManualItem, updateItem, removeItem, clearItems } = useQuoteList();
  const [testingOther, setTestingOther] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ inquiry: string; email: string; itemCount: number } | null>(null);

  useEffect(() => {
    if (!hydrated || queryApplied.current) return;
    queryApplied.current = true;
    const requestedProduct = new URLSearchParams(window.location.search).get("product")?.trim();
    if (requestedProduct && !items.some((item) => item.productName.toLowerCase() === requestedProduct.toLowerCase())) addManualItem(requestedProduct);
  }, [addManualItem, hydrated, items]);

  const validateField = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    if (!field.name || field.disabled || field.type === "checkbox" || field.type === "file") return true;
    const valid = field.checkValidity();
    setErrors((current) => ({ ...current, [field.name]: valid ? "" : getValidationMessage(field) }));
    return valid;
  };

  const addFiles = (incoming: FileList | File[]) => {
    const fileErrors: string[] = [];
    setFiles((current) => {
      const next = [...current];
      for (const file of Array.from(incoming)) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!acceptedExtensions.has(extension)) { fileErrors.push(`${file.name}: unsupported format.`); continue; }
        if (next.length >= maxAttachmentCount) { fileErrors.push(`A maximum of ${maxAttachmentCount} files can be attached.`); break; }
        if (next.some((selected) => selected.name === file.name && selected.size === file.size && selected.lastModified === file.lastModified)) continue;
        if (next.reduce((total, selected) => total + selected.size, 0) + file.size > maxAttachmentBytes) { fileErrors.push(`${file.name}: attachments must total 3 MB or less.`); continue; }
        next.push(file);
      }
      return next;
    });
    setFileError(fileErrors.join(" "));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
    const nextErrors: Record<string, string> = {};
    let firstInvalid: typeof fields[number] | undefined;
    for (const field of fields) {
      if (!field.name || field.disabled || field.type === "file" || (field.type === "checkbox" && field.name !== "privacyConsent")) continue;
      if (!field.checkValidity()) { nextErrors[field.name] = getValidationMessage(field); firstInvalid ??= field; }
    }
    setErrors(nextErrors);
    if (firstInvalid) { setStatus("Please correct the highlighted fields before submitting."); firstInvalid.focus(); return; }

    const validItems = items.filter((item) => item.productName.trim() && Number(item.quantity) > 0);
    const bom = String(new FormData(form).get("bom") ?? "").trim();
    if (!validItems.length && !bom) { setStatus("Add at least one complete quote line or paste a BOM before submitting."); return; }

    setStatus("");
    setSubmitting(true);
    try {
      const payload = new FormData(form);
      payload.set("items", JSON.stringify(validItems));
      files.forEach((file) => payload.append("attachments", file, file.name));
      const response = await fetch(rfqApiUrl, { method: "POST", headers: { Accept: "application/json" }, body: payload });
      const result = await response.json().catch(() => null) as { inquiry?: string; error?: string } | null;
      if (!response.ok || !result?.inquiry) throw new Error(result?.error || "Delivery failed");
      const email = String(payload.get("email") ?? "");
      clearItems();
      setSuccess({ inquiry: result.inquiry, email, itemCount: validItems.length });
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-rfq-success]")?.focus());
    } catch {
      setStatus("The RFQ could not be delivered. Please email sales@bybolt.com.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <section className="rfq-success" data-rfq-success tabIndex={-1} aria-labelledby="success-title">
      <span className="success-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9.2 16.6-4.8-4.8 1.4-1.4 3.4 3.4 9-9 1.4 1.4-10.4 10.4Z" /></svg></span>
      <p className="eyebrow dark">RFQ delivered</p><h2 id="success-title">Your request has been received.</h2><p>Our team will respond using the contact details provided.</p>
      <dl><div><dt>Inquiry number</dt><dd>{success.inquiry}</dd></div><div><dt>Contact email</dt><dd>{success.email}</dd></div><div><dt>Quote lines</dt><dd>{success.itemCount || "BOM attachment"}</dd></div></dl>
      <div className="success-actions"><Link className="button primary" href={`/${locale}`}>Return to Homepage</Link><button className="button outline-dark" type="button" onClick={() => setSuccess(null)}>Start Another RFQ</button></div>
    </section>
  );

  return (
    <form ref={formRef} className="rfq-form rfq-form-detailed" noValidate onSubmit={handleSubmit}>
      <input className="rfq-honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <fieldset>
        <legend><span>01</span>Buyer &amp; Project</legend>
        <div className="form-row">
          <label><span>Name <b aria-hidden="true">*</b></span><input name="name" maxLength={120} autoComplete="name" required aria-invalid={Boolean(errors.name)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="name" errors={errors} /></label>
          <label><span>Business Email <b aria-hidden="true">*</b></span><input name="email" type="email" maxLength={180} autoComplete="email" required aria-invalid={Boolean(errors.email)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="email" errors={errors} /></label>
        </div>
        <div className="form-row">
          <label><span>Company <b aria-hidden="true">*</b></span><input name="company" maxLength={180} autoComplete="organization" required aria-invalid={Boolean(errors.company)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="company" errors={errors} /></label>
          <label><span>WhatsApp / Phone</span><input name="whatsapp" maxLength={80} autoComplete="tel" placeholder="Include country code" /></label>
        </div>
        <div className="form-row">
          <label><span>Country / Region <b aria-hidden="true">*</b></span><input name="country" maxLength={120} list="country-options" autoComplete="country-name" required aria-invalid={Boolean(errors.country)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="country" errors={errors} /></label>
          <label><span>Application / Project</span><input name="application" maxLength={240} placeholder="e.g. refinery turnaround" /></label>
        </div>
        <div className="form-row">
          <label><span>Target Delivery</span><input name="targetDelivery" type="date" /></label>
          <label><span>Destination <b aria-hidden="true">*</b></span><input name="destination" maxLength={180} placeholder="City, country" required aria-invalid={Boolean(errors.destination)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="destination" errors={errors} /></label>
        </div>
        <datalist id="country-options">{countries.map((country) => <option value={country} key={country} />)}</datalist>
      </fieldset>

      <fieldset>
        <legend><span>02</span>Quote List &amp; BOM</legend>
        <div className="rfq-list-heading"><p>{items.length ? `${items.length} product line${items.length === 1 ? "" : "s"} ready for review.` : "Add product lines or paste a BOM below."}</p><div><Link href={`/${locale}/quote-list/`}>Open Quote List</Link><button type="button" onClick={() => addManualItem()}>+ Add line</button></div></div>
        <div className="rfq-line-items">
          {items.map((item, index) => (
            <article className="rfq-line-item" key={item.id}>
              <span className="rfq-line-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="rfq-line-fields">
                <label><span>Product / Drawing <b aria-hidden="true">*</b></span><input maxLength={180} value={item.productName} onChange={(e) => updateItem(item.id, { productName: e.target.value })} /></label>
                <label><span>Material</span><input maxLength={120} list="material-options" value={item.material} placeholder="e.g. Inconel 718" onChange={(e) => updateItem(item.id, { material: e.target.value })} /></label>
                <label><span>Size / Drawing No.</span><input maxLength={140} value={item.requestedSize} onChange={(e) => updateItem(item.id, { requestedSize: e.target.value })} /></label>
                <label><span>Quantity <b aria-hidden="true">*</b></span><span className="quantity-control"><input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: e.target.value })} /><select aria-label={`Quantity unit for line ${index + 1}`} value={item.quantityUnit} onChange={(e) => updateItem(item.id, { quantityUnit: e.target.value as typeof item.quantityUnit })}><option>pcs</option><option>sets</option><option>kg</option></select></span></label>
                <label className="rfq-line-wide"><span>Standard</span><input maxLength={180} value={item.standard} onChange={(e) => updateItem(item.id, { standard: e.target.value })} /></label>
                <label className="rfq-line-wide"><span>Line Notes</span><input maxLength={500} value={item.notes} onChange={(e) => updateItem(item.id, { notes: e.target.value })} /></label>
              </div>
              <button className="rfq-line-remove" type="button" onClick={() => removeItem(item.id)} aria-label={`Remove quote line ${index + 1}`}>Remove</button>
            </article>
          ))}
        </div>
        <datalist id="material-options">{materials.map((material) => <option value={material} key={material} />)}</datalist>
        <label><span>BOM / Procurement List</span><textarea name="bom" maxLength={12000} rows={6} placeholder="Paste multiple line items, part numbers, quantities, materials and standards here." /></label>
        <div className="control-group"><span className="control-label">Required Testing</span><div className="checkbox-grid">{tests.map((test) => <label className="check-control" key={test}><input type="checkbox" name="testing" value={test} checked={test === "Other" ? testingOther : undefined} onChange={test === "Other" ? (e) => setTestingOther(e.target.checked) : undefined} /><span>{test}</span></label>)}</div>{testingOther && <label className="conditional-field compact"><span>Other Testing</span><input name="testingOther" maxLength={240} /></label>}</div>
        <label><span>Quote Notes</span><textarea name="notes" maxLength={5000} rows={4} placeholder="Commercial requirements, operating conditions, packaging, Incoterms or quotation notes." /></label>
      </fieldset>

      <fieldset>
        <legend><span>03</span>Files &amp; Consent</legend>
        <div className="upload-zone" role="button" tabIndex={0} aria-controls="drawing-upload" aria-describedby="upload-formats upload-error" onClick={(e) => { if (e.target !== fileInputRef.current) fileInputRef.current?.click(); }} onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }} onDragEnter={(e) => { e.preventDefault(); e.currentTarget.classList.add("is-dragging"); }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => e.currentTarget.classList.remove("is-dragging")} onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.classList.remove("is-dragging"); addFiles(e.dataTransfer.files); }}>
          <input ref={fileInputRef} id="drawing-upload" type="file" accept=".pdf,.dwg,.dxf,.step,.stp,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} />
          <span className="upload-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 16V7.8L8.4 10.4 7 9l5-5 5 5-1.4 1.4L13 7.8V16h-2Zm-5 4a3 3 0 0 1-3-3v-2h2v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2h2v2a3 3 0 0 1-3 3H6Z" /></svg></span>
          <strong>Upload BOM, drawings or specifications</strong><span>Drag files here or <u>browse files</u></span><small id="upload-formats">PDF, STEP, DWG, DXF, XLSX, CSV and images. Up to 8 files, 3 MB combined.</small>
        </div>
        <p className="upload-error" id="upload-error" aria-live="polite">{fileError}</p>
        <ul className="file-list" aria-label="Selected files">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}`}><span className="file-type">{file.name.split(".").pop()?.toUpperCase() || "FILE"}</span><span className="file-meta"><strong>{file.name}</strong><small>{formatFileSize(file.size)} · Ready</small></span><button className="file-remove" type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></li>)}</ul>
        <label className="confidentiality-control"><input type="checkbox" name="confidentiality" /><span><strong>Keep this inquiry and uploaded files confidential.</strong><small>The confidentiality request will be included with the RFQ.</small></span></label>
        <label className="confidentiality-control privacy-control"><input type="checkbox" name="privacyConsent" required aria-invalid={Boolean(errors.privacyConsent)} /><span><strong>I consent to BYBOLT using these details to prepare and respond to this quotation. <b aria-hidden="true">*</b></strong><small>Your information is used for this B2B enquiry.</small></span></label>
      </fieldset>

      <div className="submit-row"><button className="button primary form-submit" type="submit" disabled={submitting}><span>{submitting ? "Delivering RFQ..." : "Submit Complete RFQ"}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 5.2 20 12l-6.8 6.8-1.2-1.2 4.8-4.8H4v-1.6h12.8L12 6.4l1.2-1.2Z" /></svg></button><p className="form-status" aria-live="polite">{status}</p></div>
    </form>
  );
}
