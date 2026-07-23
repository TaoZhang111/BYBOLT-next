# BYBOLT Git Admin Setup

The product administrator uses GitHub as its content store. It has no SQL database, no D1 database, and no persistent Worker storage. Product JSON and uploaded images are committed directly to `TaoZhang111/BYBOLT-next`; the resulting commit triggers the Cloudflare Pages build.

## Included components

- `/admin/`: static React administration workspace.
- `src/content/product-catalog.json`: versioned catalog source.
- `workers/admin-api`: Cloudflare Worker for GitHub authentication and atomic commits.
- `.github/workflows/deploy-preview.yml`: validates, builds and deploys every `main` update.
- `.github/workflows/deploy-admin-api.yml`: manually deploys the authentication/publish Worker.

## One-time account setup

### 1. Create the GitHub App

Open GitHub **Settings > Developer settings > GitHub Apps > New GitHub App**.

Use these values:

| Setting | Value |
| --- | --- |
| GitHub App name | `BYBOLT Product Admin` (or another unique name) |
| Homepage URL | `https://bybolt-next-preview.pages.dev/admin/` |
| Callback URL | `https://bybolt-admin-api.tao1461248574.workers.dev/auth/callback` |
| Webhook | Disabled |
| Repository permissions > Contents | Read and write |
| Repository permissions > Metadata | Read-only |
| Where can this GitHub App be installed? | Only on this account |

Create the app, generate a client secret, then install it only on `TaoZhang111/BYBOLT-next`.

### 2. Deploy and configure the Worker

Authenticate Wrangler once on the local computer, then run:

```powershell
pnpm exec wrangler secret put GITHUB_CLIENT_ID --config workers/admin-api/wrangler.jsonc
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET --config workers/admin-api/wrangler.jsonc
pnpm exec wrangler secret put SESSION_SECRET --config workers/admin-api/wrangler.jsonc
pnpm run deploy:admin-api
```

`SESSION_SECRET` must be a random value of at least 32 characters. It encrypts the short-lived GitHub access token inside an opaque admin credential. The credential is kept only for the current browser tab in `sessionStorage` and is sent to the Worker as a bearer token; an HttpOnly cookie is also issued as a compatibility fallback. The Worker itself stores no session record, and the raw GitHub token is never stored as readable browser data.

The current Worker URL is:

```text
https://bybolt-admin-api.tao1461248574.workers.dev
```

### 3. Configure repository Actions

In `TaoZhang111/BYBOLT-next`, open **Settings > Secrets and variables > Actions**.

Create repository secrets:

- `CLOUDFLARE_API_TOKEN`: token with Cloudflare Pages and Workers edit access.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

Optional repository variable (only needed if the Worker URL changes):

- `NEXT_PUBLIC_ADMIN_API_URL`: an override for the built-in Worker URL, without a trailing slash.

Run **Actions > Deploy BYBOLT Admin API > Run workflow**, then run **Deploy BYBOLT Preview** once. The rebuilt `/admin/` page will display the GitHub Connect button.

## Daily workflow

1. Open `https://bybolt-next-preview.pages.dev/admin/`.
2. Sign in through the installed GitHub App.
3. Edit a category or product. Existing published slugs are locked so accepted URLs cannot be changed accidentally.
4. Upload JPG, PNG or WebP. The browser resizes it to a maximum edge of 1920 px and converts it to WebP.
5. Check the preview and validation panel.
6. Publish. The Worker commits the catalog and images together.
7. GitHub Actions runs lint/build and deploys the generated static site to the existing Preview project.

Draft and archived products remain in Git but are not generated as public product routes. Browser drafts are also saved locally until they are published or discarded.

## Security boundaries

- Only GitHub login `TaoZhang111` is accepted.
- The Worker is fixed to `TaoZhang111/BYBOLT-next` and branch `main`.
- The GitHub App should be installed only on this repository.
- API requests accept only `https://bybolt-next-preview.pages.dev` as their browser origin.
- Uploads can only write to `public/uploads/products/`.
- A stale editor cannot overwrite a newer repository commit.
- The formal Cloudflare Worker website is not modified by either workflow.
