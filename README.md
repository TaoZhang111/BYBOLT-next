# BYBOLT Website

Multilingual B2B website foundation for an international superalloy business.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- English-first localized routes with Chinese support
- CMS adapter boundary ready for Sanity, Payload or another provider
- Git-backed product admin with no traditional database

## Local development

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`. The root route redirects to `/en`; `/zh` is the
Chinese entry point.

The product administration workspace is available at `/admin/`. See
[`docs/ADMIN_SETUP.md`](docs/ADMIN_SETUP.md) for the one-time GitHub App and
Cloudflare Worker setup.

## Route structure

```text
/:locale
├── alloys
│   └── :slug
├── product-forms
├── industries
├── capabilities
├── quality
├── resources
├── news
│   └── :slug
├── about
├── contact
└── request-a-quote
```

## Source organization

```text
src/
├── app/                 # Routes, layouts and route-level metadata
├── components/
│   ├── layout/          # Shared header and footer
│   ├── marketing/       # Marketing page sections
│   └── ui/              # Small reusable UI primitives
├── config/              # Site identity and navigation
├── content/             # Temporary localized copy before CMS integration
├── i18n/                # Supported locales and route validation
├── lib/cms/             # Provider-independent CMS contract
└── types/               # Shared content types
```

## Architecture decisions

- English is the default locale and every public page lives below a locale URL.
- Pages depend on a small CMS contract rather than importing a provider SDK.
- Alloy and news detail pages use dynamic routes so CMS content can be added
  without changing the route structure.
- The RFQ route is separate from general contact and is reserved for structured
  material requirements and secure file uploads.
- The sales email address and current product copy are working placeholders.

## Planned integrations

1. Select and connect the Headless CMS.
2. Define alloy, product form, industry, resource and news schemas.
3. Implement the RFQ form, private file storage and sales email notification.
4. Add real brand assets, photography, SEO metadata, analytics and consent.
5. Add automated browser tests and deploy a preview to Vercel.
