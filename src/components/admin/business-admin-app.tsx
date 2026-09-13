"use client";

import { Archive, Calculator, ChevronRight, Database, Download, FilePlus2, FileText, Globe2, LayoutTemplate, LoaderCircle, LogOut, Package, Plus, ReceiptText, RefreshCw, Search, Settings2, Trash2, Upload, UsersRound, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { captureAdminSession, clearAdminSession, getLoginUrl, getLogoutUrl, getSession, type AdminSession } from "@/lib/admin/api";
import { createBusinessRecord, deleteBusinessRecord, drawingDownloadUrl, generateContract, generateSettlement, getBusinessOverview, listBusinessRecords, type BusinessOverview, type BusinessRecord, type BusinessResource, updateBusinessRecord, uploadBusinessDrawing } from "@/lib/admin/business-api";

import styles from "./business-admin.module.css";

type ModuleKey = "dashboard" | BusinessResource;
type FieldConfig = { key: string; label: string; type?: "text" | "number" | "date" | "textarea" | "select"; options?: string[]; required?: boolean; wide?: boolean; placeholder?: string };
type ModuleConfig = { label: string; singular: string; icon: typeof UsersRound; columns: string[]; fields: FieldConfig[] };

const modules: Record<BusinessResource, ModuleConfig> = {
  leads: { label: "海关获客", singular: "客户线索", icon: Globe2, columns: ["importer_name", "country", "product_interest", "opportunity_stage", "updated_at"], fields: [
    { key: "importer_name", label: "进口商 / 公司", required: true }, { key: "country", label: "国家 / 地区" }, { key: "contact_name", label: "联系人" }, { key: "email", label: "邮箱" }, { key: "whatsapp", label: "WhatsApp / 电话" }, { key: "hs_code", label: "HS 编码" }, { key: "product_interest", label: "关注产品", wide: true }, { key: "supplier", label: "现有供应商" }, { key: "last_shipment_date", label: "最近货运日期", type: "date" }, { key: "shipment_count", label: "货运次数", type: "number" }, { key: "opportunity_stage", label: "跟进阶段", type: "select", options: ["new", "contacted", "qualified", "quoted", "won", "lost", "archived"] }, { key: "source", label: "数据来源", placeholder: "customs / referral / exhibition" }, { key: "notes", label: "跟进记录", type: "textarea", wide: true },
  ] },
  quotes: { label: "报价管理", singular: "报价", icon: Calculator, columns: ["id", "company", "status", "currency", "total", "created_at"], fields: [
    { key: "company", label: "客户公司", required: true }, { key: "contact_name", label: "联系人" }, { key: "email", label: "邮箱" }, { key: "whatsapp", label: "WhatsApp / 电话" }, { key: "country", label: "国家 / 地区" }, { key: "destination", label: "交货地点" }, { key: "application", label: "应用 / 项目", wide: true }, { key: "target_delivery", label: "目标交期", type: "date" }, { key: "status", label: "状态", type: "select", options: ["new", "draft", "quoted", "confirmed", "lost", "delivery_failed", "archived"] }, { key: "currency", label: "币种", type: "select", options: ["USD", "EUR", "CNY", "GBP"] }, { key: "subtotal", label: "产品金额", type: "number" }, { key: "freight", label: "运费", type: "number" }, { key: "tax", label: "税费", type: "number" }, { key: "bom", label: "BOM / 产品明细", type: "textarea", wide: true }, { key: "testing", label: "检测要求", wide: true }, { key: "notes", label: "报价备注", type: "textarea", wide: true },
  ] },
  contracts: { label: "合同管理", singular: "销售合同", icon: FileText, columns: ["contract_no", "customer_company", "status", "currency", "total_amount", "delivery_date"], fields: [
    { key: "contract_no", label: "合同编号", required: true }, { key: "quote_id", label: "关联报价号" }, { key: "customer_company", label: "客户公司", required: true }, { key: "status", label: "状态", type: "select", options: ["draft", "confirmed", "in_production", "shipped", "completed", "cancelled", "archived"] }, { key: "currency", label: "币种", type: "select", options: ["USD", "EUR", "CNY", "GBP"] }, { key: "total_amount", label: "合同金额", type: "number" }, { key: "signed_date", label: "签署日期", type: "date" }, { key: "delivery_date", label: "交货日期", type: "date" }, { key: "terms", label: "贸易与付款条款", type: "textarea", wide: true }, { key: "notes", label: "合同备注", type: "textarea", wide: true },
  ] },
  settlements: { label: "结款单", singular: "结款单", icon: ReceiptText, columns: ["settlement_no", "contract_id", "status", "currency", "amount", "due_date"], fields: [
    { key: "settlement_no", label: "结款单编号", required: true }, { key: "contract_id", label: "关联合同 ID" }, { key: "status", label: "状态", type: "select", options: ["unpaid", "partial", "paid", "overdue", "cancelled"] }, { key: "currency", label: "币种", type: "select", options: ["USD", "EUR", "CNY", "GBP"] }, { key: "amount", label: "应收金额", type: "number" }, { key: "due_date", label: "到期日", type: "date" }, { key: "paid_date", label: "收款日", type: "date" }, { key: "payment_method", label: "付款方式" }, { key: "reference", label: "银行 / 流水参考" }, { key: "notes", label: "结款备注", type: "textarea", wide: true },
  ] },
  drawings: { label: "图纸管理", singular: "图纸", icon: FilePlus2, columns: ["drawing_no", "filename", "version", "owner_type", "project_name", "updated_at"], fields: [
    { key: "drawing_no", label: "图纸编号", required: true }, { key: "version", label: "版本", placeholder: "A / Rev.01" }, { key: "owner_type", label: "图纸类型", type: "select", options: ["customer", "product", "factory"] }, { key: "project_name", label: "关联项目" }, { key: "product_name", label: "关联产品" }, { key: "quote_id", label: "关联报价号" }, { key: "contract_id", label: "关联合同 ID" }, { key: "status", label: "状态", type: "select", options: ["active", "superseded", "approved", "archived"] }, { key: "notes", label: "图纸说明", type: "textarea", wide: true },
  ] },
  templates: { label: "模板中心", singular: "业务模板", icon: LayoutTemplate, columns: ["name", "type", "subject", "status", "updated_at"], fields: [
    { key: "name", label: "模板名称", required: true }, { key: "type", label: "模板类型", type: "select", options: ["quote", "email", "contract", "settlement"] }, { key: "subject", label: "标题 / 邮件主题", wide: true }, { key: "content", label: "模板内容", type: "textarea", wide: true }, { key: "status", label: "状态", type: "select", options: ["active", "draft", "archived"] },
  ] },
  settings: { label: "系统设置", singular: "系统参数", icon: Settings2, columns: ["setting_key", "category", "setting_value", "description"], fields: [
    { key: "setting_key", label: "参数键", required: true }, { key: "category", label: "分类" }, { key: "setting_value", label: "参数值", required: true }, { key: "description", label: "用途说明", type: "textarea", wide: true },
  ] },
};

const labels: Record<string, string> = { id: "编号", importer_name: "进口商", country: "国家", product_interest: "产品", opportunity_stage: "阶段", updated_at: "更新时间", created_at: "创建时间", company: "客户公司", status: "状态", currency: "币种", total: "总额", contract_no: "合同号", customer_company: "客户", total_amount: "合同额", delivery_date: "交期", settlement_no: "结款单号", contract_id: "合同 ID", amount: "金额", due_date: "到期日", drawing_no: "图号", filename: "文件", version: "版本", owner_type: "类型", project_name: "项目", name: "名称", type: "类型", subject: "标题", setting_key: "参数", category: "分类", setting_value: "值", description: "说明" };

function initialValues(config: ModuleConfig) {
  return Object.fromEntries(config.fields.map((field) => [field.key, field.type === "number" ? 0 : field.options?.[0] ?? ""]));
}

export function BusinessAdminApp() {
  const [module, setModule] = useState<ModuleKey>("dashboard");
  const [session, setSession] = useState<AdminSession>({ authenticated: false });
  const [records, setRecords] = useState<BusinessRecord[]>([]);
  const [overview, setOverview] = useState<BusinessOverview | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BusinessRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setNotice("");
    try {
      if (module === "dashboard") setOverview(await getBusinessOverview());
      else setRecords((await listBusinessRecords(module, search)).records);
    } catch (error) { setNotice(error instanceof Error ? error.message : "数据加载失败。"); }
    finally { setLoading(false); }
  }, [module, search]);

  useEffect(() => { captureAdminSession(); void getSession().then((next) => { setSession(next); if (!next.authenticated) setLoading(false); }).catch((error) => { setNotice(error instanceof Error ? error.message : "后台连接失败。"); setLoading(false); }); }, []);
  useEffect(() => { if (!session.authenticated) return; const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load, session.authenticated]);

  const activeConfig = module === "dashboard" ? null : modules[module];
  const title = module === "dashboard" ? "业务总览" : activeConfig?.label;

  function disconnect() { clearAdminSession(); window.location.assign(getLogoutUrl(businessLocation())); }

  async function remove(record: BusinessRecord) {
    if (module === "dashboard" || !window.confirm(`确定删除这条${modules[module].singular}记录？此操作会同时删除关联文件。`)) return;
    try { await deleteBusinessRecord(module, record.id); setEditing(null); await load(); } catch (error) { setNotice(error instanceof Error ? error.message : "删除失败。"); }
  }

  async function action(record: BusinessRecord) {
    try {
      if (module === "quotes") { await generateContract(record.id); setNotice("销售合同已生成，报价状态已更新为 confirmed。"); }
      if (module === "contracts") { await generateSettlement(record.id); setNotice("结款单已根据合同生成。"); }
    } catch (error) { setNotice(error instanceof Error ? error.message : "业务单据生成失败。"); }
  }

  return <main className={styles.shell}>
    <header className={styles.topbar}><Link className={styles.brand} href="/admin/"><span>BY</span><div><b>BYBOLT</b><small>BUSINESS OS / 合金紧固件业务后台</small></div></Link><div className={styles.topActions}><span className={styles.database}><Database />D1 + R2</span><Link href="/admin/"><Package />官网内容管理</Link>{session.authenticated && <button type="button" onClick={disconnect}><LogOut />退出</button>}</div></header>
    <div className={styles.layout}>
      <aside className={styles.sidebar}><p>业务中心</p><button className={module === "dashboard" ? styles.active : ""} onClick={() => setModule("dashboard")}><Database /><span>业务总览</span></button>{(Object.entries(modules) as [BusinessResource, ModuleConfig][]).map(([key, config]) => { const Icon = config.icon; return <button className={module === key ? styles.active : ""} onClick={() => { setModule(key); setSearch(""); setEditing(null); setCreating(false); }} key={key}><Icon /><span>{config.label}</span><ChevronRight /></button>; })}<div className={styles.sidebarNote}><Database /><p><b>统一业务数据库</b><span>询盘、报价、合同、结款和图纸关系保存在 Cloudflare D1，文件保存在私有 R2。</span></p></div></aside>
      <section className={styles.content}>
        <div className={styles.pageHeader}><div><p>BYBOLT / BUSINESS</p><h1>{title}</h1></div>{module !== "dashboard" && <button className={styles.primary} onClick={() => { setCreating(true); setEditing(null); }}><Plus />新建{activeConfig?.singular}</button>}</div>
        {!session.authenticated ? <div className={styles.connect}><Database /><h2>连接授权账号后进入业务数据库</h2><p>沿用现有 GitHub OAuth 白名单，未授权访客无法读取客户、报价、合同或图纸。</p><a href={getLoginUrl(businessLocation())}>连接 GitHub 管理员账号</a></div> : <>
          {notice && <div className={styles.notice}><span>{notice}</span><button onClick={() => setNotice("")}><X /></button></div>}
          {module === "dashboard" ? <Dashboard overview={overview} loading={loading} onRefresh={() => void load()} /> : activeConfig && <>
            <div className={styles.toolbar}><label><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(); }} placeholder={`搜索${activeConfig.label}`} /></label><button onClick={() => void load()}><RefreshCw />刷新</button><span>{records.length} 条记录</span></div>
            <RecordTable module={module} config={activeConfig} records={records} loading={loading} onEdit={(record) => { setEditing(record); setCreating(false); }} onAction={action} />
          </>}
        </>}
      </section>
    </div>
    {activeConfig && (creating || editing) && <RecordEditor resource={module as BusinessResource} config={activeConfig} record={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={async () => { setCreating(false); setEditing(null); await load(); }} onDelete={editing ? () => void remove(editing) : undefined} />}
  </main>;
}

function Dashboard({ overview, loading, onRefresh }: { overview: BusinessOverview | null; loading: boolean; onRefresh: () => void }) {
  const cards = [{ label: "待跟进海关线索", value: overview?.counts.leads ?? 0, icon: Globe2 }, { label: "进行中报价", value: overview?.counts.quotes ?? 0, icon: Calculator }, { label: "执行中合同", value: overview?.counts.contracts ?? 0, icon: FileText }, { label: "未结金额（USD 基准）", value: `$${(overview?.counts.outstanding ?? 0).toLocaleString()}`, icon: ReceiptText }];
  return <>{loading ? <Loading /> : <><div className={styles.metrics}>{cards.map((card) => { const Icon = card.icon; return <article key={card.label}><Icon /><span>{card.label}</span><strong>{card.value}</strong></article>; })}</div><section className={styles.recent}><header><div><p>最新询盘</p><h2>最近进入数据库的报价请求</h2></div><button onClick={onRefresh}><RefreshCw />刷新</button></header>{overview?.recentQuotes.length ? <div>{overview.recentQuotes.map((quote) => <article key={quote.id}><span>{quote.id}</span><b>{quote.company}</b><em>{quote.status}</em><strong>{quote.currency} {Number(quote.total ?? 0).toLocaleString()}</strong></article>)}</div> : <Empty />}</section></>}</>;
}

function RecordTable({ module, config, records, loading, onEdit, onAction }: { module: BusinessResource; config: ModuleConfig; records: BusinessRecord[]; loading: boolean; onEdit: (record: BusinessRecord) => void; onAction: (record: BusinessRecord) => void }) {
  if (loading) return <Loading />;
  if (!records.length) return <Empty />;
  return <div className={styles.tableWrap}><table><thead><tr>{config.columns.map((column) => <th key={column}>{labels[column] ?? column}</th>)}<th>操作</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} onClick={() => onEdit(record)}>{config.columns.map((column) => <td key={column}>{formatValue(column, record[column])}</td>)}<td><div className={styles.rowActions}>{module === "drawings" && <a href={drawingDownloadUrl(record.id)} onClick={(event) => event.stopPropagation()}><Download />下载</a>}{module === "quotes" && <button onClick={(event) => { event.stopPropagation(); void onAction(record); }}><FileText />生成合同</button>}{module === "contracts" && <button onClick={(event) => { event.stopPropagation(); void onAction(record); }}><ReceiptText />生成结款单</button>}<button onClick={() => onEdit(record)}>编辑</button></div></td></tr>)}</tbody></table></div>;
}

function RecordEditor({ resource, config, record, onClose, onSaved, onDelete }: { resource: BusinessResource; config: ModuleConfig; record: BusinessRecord | null; onClose: () => void; onSaved: () => Promise<void>; onDelete?: () => void }) {
  const [values, setValues] = useState<Record<string, string | number>>(() => record ? Object.fromEntries(config.fields.map((field) => [field.key, record[field.key] ?? (field.type === "number" ? 0 : "")])) : initialValues(config));
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const total = useMemo(() => Number(values.subtotal ?? 0) + Number(values.freight ?? 0) + Number(values.tax ?? 0), [values.freight, values.subtotal, values.tax]);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (resource === "drawings" && !record) {
        if (!file) throw new Error("请选择要上传的图纸或技术文件。");
        await uploadBusinessDrawing(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])), file);
      } else if (record) await updateBusinessRecord(resource, record.id, resource === "quotes" ? { ...values, total } : values);
      else await createBusinessRecord(resource, resource === "quotes" ? { ...values, total } : values);
      await onSaved();
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "保存失败。"); }
    finally { setSaving(false); }
  }

  return <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className={styles.drawer} onSubmit={(event) => void save(event)}><header><div><p>{record ? "编辑记录" : "创建记录"}</p><h2>{config.singular}</h2></div><button type="button" onClick={onClose}><X /></button></header><div className={styles.formGrid}>{config.fields.filter((field) => !(resource === "drawings" && !record && ["status"].includes(field.key))).map((field) => <label className={field.wide ? styles.wide : ""} key={field.key}><span>{field.label}{field.required && <b>*</b>}</span>{field.type === "textarea" ? <textarea rows={field.key === "content" ? 10 : 5} value={values[field.key] ?? ""} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} /> : field.type === "select" ? <select value={values[field.key] ?? ""} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input required={field.required} type={field.type ?? "text"} step={field.type === "number" ? "0.01" : undefined} value={values[field.key] ?? ""} placeholder={field.placeholder} onChange={(event) => setValues({ ...values, [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value })} />}</label>)}</div>{resource === "drawings" && !record && <div className={styles.uploadCard}><input ref={fileInput} hidden type="file" accept=".pdf,.dwg,.dxf,.step,.stp,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><Upload /><div><b>{file?.name ?? "选择图纸文件"}</b><span>PDF、DWG、DXF、STEP、XLSX 或图片，最大 10 MB</span></div><button type="button" onClick={() => fileInput.current?.click()}>浏览</button></div>}{resource === "quotes" && <div className={styles.totalBar}><span>自动计算报价总额</span><strong>{values.currency || "USD"} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>}{error && <p className={styles.formError}>{error}</p>}<footer>{onDelete && <button className={styles.danger} type="button" onClick={onDelete}><Trash2 />删除</button>}<span /><button type="button" onClick={onClose}>取消</button><button className={styles.primary} disabled={saving}>{saving ? <LoaderCircle className={styles.spin} /> : null}保存</button></footer></form></div>;
}

function Loading() { return <div className={styles.loading}><LoaderCircle className={styles.spin} />正在读取数据库…</div>; }
function Empty() { return <div className={styles.empty}><Archive /><h3>暂无记录</h3><p>点击右上角新建，或等待网站 RFQ 自动进入数据库。</p></div>; }
function formatValue(key: string, value: unknown) { if (value === null || value === undefined || value === "") return "—"; if (["total", "total_amount", "amount"].includes(key)) return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 }); if (key.endsWith("_at")) return new Date(String(value)).toLocaleString("zh-CN"); return String(value); }
function businessLocation() { return "/admin/business/"; }
