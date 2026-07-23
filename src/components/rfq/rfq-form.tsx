"use client";

import Link from "@/components/navigation/static-link";
import { type DragEvent, type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

import type { Locale } from "@/i18n/config";

const countries = ["United States", "Canada", "Mexico", "United Kingdom", "Germany", "France", "Italy", "Netherlands", "Spain", "Poland", "Turkey", "United Arab Emirates", "Saudi Arabia", "India", "Singapore", "Malaysia", "Indonesia", "Japan", "South Korea", "Australia", "Brazil", "South Africa"];
const materials = ["Inconel 625", "Inconel 718", "Hastelloy C276", "Monel 400", "Titanium Grade 2", "Titanium Grade 5", "Duplex 2205", "Super Duplex 2507"];
const tests = ["MTC / EN 10204 3.1", "PMI", "Hardness", "Tensile", "Ultrasonic", "Third-party inspection", "Other"];
const acceptedExtensions = new Set(["pdf", "dwg", "dxf", "step", "stp", "jpg", "jpeg", "png"]);
const maxFileSize = 10 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createInquiryNumber() {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");
  return `BYB-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getValidationMessage(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (field.validity.valueMissing) return "Please complete this required field.";
  if (field.validity.typeMismatch && field.type === "email") return "Enter a valid business email address.";
  if (field.validity.rangeUnderflow) return "Quantity must be at least 1.";
  return "Check this value and try again.";
}

function FieldError({ name, errors }: { name: string; errors: Record<string, string> }) {
  return <small className="field-error">{errors[name] ?? ""}</small>;
}

export function RfqForm({ locale }: { locale: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState("");
  const [productOther, setProductOther] = useState("");
  const [testingOther, setTestingOther] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ inquiry: string; email: string } | null>(null);

  useEffect(() => {
    const requestedProduct = new URLSearchParams(window.location.search).get("product");
    if (!requestedProduct) return;
    const knownProducts = ["Bolts", "Nuts", "Studs", "Washers", "Screws", "Custom Products"];
    const timer = window.setTimeout(() => {
      if (knownProducts.includes(requestedProduct)) setProduct(requestedProduct);
      else {
        setProduct("Other");
        setProductOther(requestedProduct);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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
      Array.from(incoming).forEach((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!acceptedExtensions.has(extension)) {
          fileErrors.push(`${file.name}: unsupported format.`);
          return;
        }
        if (file.size > maxFileSize) {
          fileErrors.push(`${file.name}: file exceeds 10 MB.`);
          return;
        }
        if (!next.some((selected) => selected.name === file.name && selected.size === file.size && selected.lastModified === file.lastModified)) next.push(file);
      });
      return next;
    });
    setFileError(fileErrors.join(" "));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Array.from(form.elements).filter((element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);
    const nextErrors: Record<string, string> = {};
    let firstInvalid: typeof fields[number] | undefined;
    fields.forEach((field) => {
      if (!field.name || field.disabled || field.type === "checkbox" || field.type === "file") return;
      if (!field.checkValidity()) {
        nextErrors[field.name] = getValidationMessage(field);
        firstInvalid ??= field;
      }
    });
    setErrors(nextErrors);
    if (firstInvalid) {
      setStatus("Please correct the highlighted fields before submitting.");
      firstInvalid.focus();
      return;
    }

    setStatus("");
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const data = new FormData(form);
    setSuccess({ inquiry: createInquiryNumber(), email: String(data.get("email") ?? "") });
    setSubmitting(false);
    requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-rfq-success]")?.focus());
  };

  const resetForm = () => {
    formRef.current?.reset();
    setProduct("");
    setProductOther("");
    setTestingOther(false);
    setFiles([]);
    setFileError("");
    setErrors({});
    setStatus("");
    setSuccess(null);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  if (success) {
    return (
      <section className="rfq-success" data-rfq-success tabIndex={-1} aria-labelledby="success-title">
        <span className="success-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9.2 16.6-4.8-4.8 1.4-1.4 3.4 3.4 9-9 1.4 1.4-10.4 10.4Z" /></svg></span>
        <p className="eyebrow dark">RFQ submitted</p>
        <h2 id="success-title">Your request has been received.</h2>
        <p>Our team will respond within one business day.</p>
        <dl>
          <div><dt>Inquiry number</dt><dd>{success.inquiry}</dd></div>
          <div><dt>Reply sent to</dt><dd>{success.email}</dd></div>
        </dl>
        <div className="success-actions">
          <Link className="button primary" href={`/${locale}`}>Return to Homepage</Link>
          <button className="button outline-dark" type="button" onClick={resetForm}>Start Another RFQ</button>
        </div>
      </section>
    );
  }

  return (
    <form ref={formRef} className="rfq-form rfq-form-detailed" noValidate onSubmit={handleSubmit}>
      <fieldset>
        <legend><span>01</span>Contact Information</legend>
        <div className="form-row">
          <label><span>Name <b aria-hidden="true">*</b></span><input name="name" type="text" autoComplete="name" required aria-invalid={Boolean(errors.name)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="name" errors={errors} /></label>
          <label><span>Business Email <b aria-hidden="true">*</b></span><input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="email" errors={errors} /></label>
        </div>
        <div className="form-row">
          <label><span>Company <b aria-hidden="true">*</b></span><input name="company" type="text" autoComplete="organization" required aria-invalid={Boolean(errors.company)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="company" errors={errors} /></label>
          <label><span>Country / Region <b aria-hidden="true">*</b></span><input name="country" type="text" list="country-options" autoComplete="country-name" required aria-invalid={Boolean(errors.country)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="country" errors={errors} /></label>
        </div>
        <datalist id="country-options">{countries.map((country) => <option value={country} key={country} />)}</datalist>
      </fieldset>

      <fieldset>
        <legend><span>02</span>Product Requirements</legend>
        <div className="form-row">
          <label>
            <span>Product Type <b aria-hidden="true">*</b></span>
            <select name="product" required value={product} aria-invalid={Boolean(errors.product)} onChange={(e) => setProduct(e.target.value)} onBlur={(e) => validateField(e.currentTarget)}>
              <option value="">Select product</option>{["Bolts", "Nuts", "Studs", "Washers", "Screws", "Custom Products", "Other"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <FieldError name="product" errors={errors} />
          </label>
          <label><span>Material Grade <b aria-hidden="true">*</b></span><input name="material" type="text" list="material-options" placeholder="e.g. Inconel 718" required aria-invalid={Boolean(errors.material)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="material" errors={errors} /></label>
        </div>
        {product === "Other" && <label className="conditional-field"><span>Other Product Type <b aria-hidden="true">*</b></span><input name="productOther" type="text" required value={productOther} onChange={(e) => setProductOther(e.target.value)} aria-invalid={Boolean(errors.productOther)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="productOther" errors={errors} /></label>}
        <datalist id="material-options">{materials.map((material) => <option value={material} key={material} />)}</datalist>
        <div className="form-row">
          <label><span>Size / Drawing Number</span><input name="size" type="text" placeholder="M16 × 80 or DRW-1042" /></label>
          <div className="quantity-field"><label><span>Quantity <b aria-hidden="true">*</b></span><span className="quantity-control"><input name="quantity" type="number" inputMode="numeric" min="1" step="1" required aria-invalid={Boolean(errors.quantity)} onBlur={(e) => validateField(e.currentTarget)} /><select name="quantityUnit" aria-label="Quantity unit"><option>pcs</option><option>sets</option><option>kg</option></select></span><FieldError name="quantity" errors={errors} /></label></div>
        </div>
        <div className="form-row">
          <label><span>Required Standard</span><input name="standard" type="text" placeholder="ASTM, ASME, DIN, ISO or project spec" /></label>
          <label><span>Destination <b aria-hidden="true">*</b></span><input name="destination" type="text" placeholder="City, country" required aria-invalid={Boolean(errors.destination)} onBlur={(e) => validateField(e.currentTarget)} /><FieldError name="destination" errors={errors} /></label>
        </div>
        <div className="control-group">
          <span className="control-label">Required Testing</span>
          <div className="checkbox-grid">{tests.map((test) => <label className="check-control" key={test}><input type="checkbox" name="testing" value={test} checked={test === "Other" ? testingOther : undefined} onChange={test === "Other" ? (e) => setTestingOther(e.target.checked) : undefined} /><span>{test}</span></label>)}</div>
          {testingOther && <label className="conditional-field compact"><span>Other Testing</span><input name="testingOther" type="text" /></label>}
        </div>
        <label><span>Additional Notes</span><textarea name="notes" rows={4} placeholder="Operating temperature, corrosion environment, tolerance, delivery target or packing requirement" /></label>
      </fieldset>

      <fieldset>
        <legend><span>03</span>Drawing &amp; Confidentiality</legend>
        <div
          className="upload-zone"
          role="button"
          tabIndex={0}
          aria-controls="drawing-upload"
          aria-describedby="upload-formats upload-error"
          onClick={(event) => { if (event.target !== fileInputRef.current) fileInputRef.current?.click(); }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInputRef.current?.click(); } }}
          onDragEnter={(event) => { event.preventDefault(); event.currentTarget.classList.add("is-dragging"); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => event.currentTarget.classList.remove("is-dragging")}
          onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); event.currentTarget.classList.remove("is-dragging"); addFiles(event.dataTransfer.files); }}
        >
          <input ref={fileInputRef} id="drawing-upload" name="drawings" type="file" accept=".pdf,.dwg,.dxf,.step,.stp,.jpg,.jpeg,.png" multiple onChange={(event) => event.target.files && addFiles(event.target.files)} />
          <span className="upload-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M11 16V7.8L8.4 10.4 7 9l5-5 5 5-1.4 1.4L13 7.8V16h-2Zm-5 4a3 3 0 0 1-3-3v-2h2v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2h2v2a3 3 0 0 1-3 3H6Z" /></svg></span>
          <strong>Upload drawings or specifications</strong><span>Drag files here or <u>browse files</u></span><small id="upload-formats">Accepted formats: PDF, DWG, DXF, STEP, JPG, PNG. Maximum 10 MB per file.</small>
        </div>
        <p className="upload-error" id="upload-error" aria-live="polite">{fileError}</p>
        <ul className="file-list" aria-label="Selected files">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}`}><span className="file-type">{file.name.split(".").pop()?.toUpperCase() || "FILE"}</span><span className="file-meta"><strong>{file.name}</strong><small>{formatFileSize(file.size)} · Ready</small></span><button className="file-remove" type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button></li>)}</ul>
        <label className="confidentiality-control"><input type="checkbox" name="confidentiality" /><span><strong>Please keep this inquiry and all uploaded drawings confidential.</strong><small>Your confidentiality request will be included with the RFQ.</small></span></label>
      </fieldset>

      <div className="submit-row">
        <button className="button primary form-submit" type="submit" disabled={submitting}><span>{submitting ? "Submitting..." : "Submit RFQ"}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 5.2 20 12l-6.8 6.8-1.2-1.2 4.8-4.8H4v-1.6h12.8L12 6.4l1.2-1.2Z" /></svg></button>
        <p className="form-status" aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
