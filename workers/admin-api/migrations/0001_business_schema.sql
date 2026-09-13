PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customs_leads (
  id TEXT PRIMARY KEY,
  importer_name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  hs_code TEXT NOT NULL DEFAULT '',
  product_interest TEXT NOT NULL DEFAULT '',
  supplier TEXT NOT NULL DEFAULT '',
  last_shipment_date TEXT NOT NULL DEFAULT '',
  shipment_count INTEGER NOT NULL DEFAULT 0,
  opportunity_stage TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'customs',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'new',
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  application TEXT NOT NULL DEFAULT '',
  target_delivery TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal REAL NOT NULL DEFAULT 0,
  freight REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  bom TEXT NOT NULL DEFAULT '',
  testing TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  confidentiality INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  material TEXT NOT NULL DEFAULT '',
  requested_size TEXT NOT NULL DEFAULT '',
  standard TEXT NOT NULL DEFAULT '',
  quantity REAL NOT NULL DEFAULT 1,
  quantity_unit TEXT NOT NULL DEFAULT 'pcs',
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  contract_no TEXT NOT NULL UNIQUE,
  quote_id TEXT REFERENCES quotes(id) ON DELETE SET NULL,
  customer_company TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'USD',
  total_amount REAL NOT NULL DEFAULT 0,
  signed_date TEXT NOT NULL DEFAULT '',
  delivery_date TEXT NOT NULL DEFAULT '',
  terms TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY,
  settlement_no TEXT NOT NULL UNIQUE,
  contract_id TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  currency TEXT NOT NULL DEFAULT 'USD',
  amount REAL NOT NULL DEFAULT 0,
  due_date TEXT NOT NULL DEFAULT '',
  paid_date TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT '',
  reference TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS drawings (
  id TEXT PRIMARY KEY,
  drawing_no TEXT NOT NULL,
  quote_id TEXT REFERENCES quotes(id) ON DELETE SET NULL,
  contract_id TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL DEFAULT '',
  owner_type TEXT NOT NULL DEFAULT 'customer',
  product_name TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT 'A',
  filename TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'quote',
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'business',
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_stage_updated ON customs_leads(opportunity_stage, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status_created ON quotes(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_contracts_status_created ON contracts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_status_due ON settlements(status, due_date);
CREATE INDEX IF NOT EXISTS idx_drawings_links ON drawings(quote_id, contract_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type, status);

INSERT OR IGNORE INTO templates (id, type, name, subject, content, status, created_at, updated_at) VALUES
('tpl-quote-default', 'quote', 'Default quotation', 'BYBOLT Quotation {{quote_no}}', 'Quotation for {{company}}\nValidity: 30 days\nDelivery: {{delivery}}', 'active', datetime('now'), datetime('now')),
('tpl-email-rfq', 'email', 'RFQ acknowledgement', 'We received {{quote_no}}', 'Thank you for your enquiry. Our team is reviewing the technical and commercial requirements.', 'active', datetime('now'), datetime('now')),
('tpl-contract-default', 'contract', 'Default sales contract', 'Sales Contract {{contract_no}}', 'Seller: BYBOLT\nBuyer: {{company}}\nTotal: {{currency}} {{total}}\nTerms: {{terms}}', 'active', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO settings (id, category, setting_key, setting_value, description, created_at, updated_at) VALUES
('setting-default-currency', 'quotation', 'default_currency', 'USD', 'Default currency for new quotations.', datetime('now'), datetime('now')),
('setting-quote-validity', 'quotation', 'quote_validity_days', '30', 'Default quotation validity period.', datetime('now'), datetime('now')),
('setting-contract-prefix', 'contract', 'contract_prefix', 'BYB-SC', 'Prefix used for sales contract numbers.', datetime('now'), datetime('now')),
('setting-settlement-prefix', 'settlement', 'settlement_prefix', 'BYB-SET', 'Prefix used for settlement numbers.', datetime('now'), datetime('now'));
