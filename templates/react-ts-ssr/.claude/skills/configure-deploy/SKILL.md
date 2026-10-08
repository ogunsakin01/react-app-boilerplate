---
name: configure-deploy
description: Deploy this Vike SSR project's prerendered output (dist/client) to a managed static host (Netlify, Vercel, Cloudflare Pages) or an S3-compatible bucket (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO) with optional CloudFront invalidation. Use when the user asks about deploying, publishing, hosting, CDN, S3, R2, Spaces, CloudFront, or bucket upload.
---

# configure-deploy

`pnpm build` prerenders every page to static files in **`dist/client/`** - one `index.html` per route (`dist/client/docs/index.html`, …), a `404.html`, hashed JS/CSS under `assets/`, and `*.pageContext.json` files Vike fetches during client-side navigation. There is no server to run; any static host works.

Everything below deploys `dist/client/`, never `dist/` (which also holds Vike's build metadata).

## Managed hosts (recommended)

The template ships configs that already point at `dist/client` with correct cache headers:

- **Netlify** - `netlify.toml` sets the build command, `publish = "dist/client"`, cache headers, and serves `404.html` for unknown paths. Link the repo in the Netlify dashboard.
- **Vercel** - `vercel.json` sets `outputDirectory: "dist/client"` and cache headers. Link the repo in the Vercel dashboard.
- **Cloudflare Pages** - `public/_headers` (copied into `dist/client/`) sets cache headers. Build command `pnpm build`, output directory `dist/client`.
- **GitHub Pages** - upload `dist/client` with `actions/upload-pages-artifact` + `actions/deploy-pages`. Set `VITE_BASE_URL=/repo-name/` at build time if serving from a subpath.

No SPA fallback rewrite is needed - every route is a real file.

## S3-compatible buckets (`pnpm deploy`)

`scripts/deploy.mjs` shells out to `aws s3 sync --delete` and optionally invalidates CloudFront.

Prerequisites: the **AWS CLI** on PATH (`aws --version`), credentials via the standard chain (env vars, `~/.aws/credentials`, IAM role, or SSO), and a fresh `pnpm build`.

```bash
DEPLOY_BUCKET=my-site-prod pnpm deploy
```

It uploads `dist/client/` by default with two cache tiers:

| files                                                                                  | cache-control                       |
| -------------------------------------------------------------------------------------- | ----------------------------------- |
| `assets/*` (Vite's content-hashed JS/CSS/images), uploaded first                       | `public,max-age=31536000,immutable` |
| everything else: HTML, `robots.txt`, `sitemap.xml`, favicon, `*.pageContext.json`, ... | `public,max-age=0,must-revalidate`  |

Only content-hashed files are safe to cache forever - a changed favicon or `robots.txt` keeps its name, so it must revalidate.

`--delete` applies to everything **except** `assets/`: pages you removed disappear, but old hashed chunks stay. A tab still running the previous release lazy-loads chunks by their old names, and deleting them would break its next navigation. Old assets accumulate; pass `--prune-assets` occasionally (or add a bucket lifecycle rule) to clean them up.

### S3-compatible providers

Any provider with an S3-compatible API works via `--endpoint` (or `DEPLOY_ENDPOINT`):

```bash
# Cloudflare R2
DEPLOY_BUCKET=my-site \
DEPLOY_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com \
pnpm deploy

# DigitalOcean Spaces
DEPLOY_BUCKET=my-site \
DEPLOY_ENDPOINT=https://<region>.digitaloceanspaces.com \
pnpm deploy
```

Credentials still come from the standard AWS chain (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` work for all providers).

For a bucket website endpoint, set the index document to `index.html` and the error document to `404.html` so `/docs` resolves to `docs/index.html` and unknown paths get the prerendered 404.

### CloudFront

Append `--cloudfront-id <id>` (or set `DEPLOY_CLOUDFRONT_ID`) to invalidate `/*` after upload. CloudFront doesn't map `/docs` to `docs/index.html` on its own; use a CloudFront Function or the S3 website endpoint as the origin.

### Dry run

```bash
pnpm deploy --bucket my-site --dry-run
```

Prints every `aws` command without executing anything.

### All flags

| flag               | env var                | notes                               |
| ------------------ | ---------------------- | ----------------------------------- |
| `--bucket`, `-b`   | `DEPLOY_BUCKET`        | required                            |
| `--dist`, `-d`     | -                      | default `dist` - pass `dist/client` |
| `--endpoint`, `-e` | `DEPLOY_ENDPOINT`      | for R2/Spaces/MinIO                 |
| `--region`, `-r`   | `AWS_REGION`           | standard AWS region                 |
| `--cloudfront-id`  | `DEPLOY_CLOUDFRONT_ID` | invalidate after upload             |
| `--dry-run`        | -                      | preview commands, don't execute     |

## Serve assets from a CDN prefix

Set `VITE_BASE_URL` at build time (e.g. `VITE_BASE_URL=https://cdn.example.com/site/ pnpm build`). Vite bakes that URL into every asset reference in the prerendered HTML. Upload `dist/client/assets/` to the CDN path and the HTML to your host.

## Using a managed host only?

Delete `scripts/deploy.mjs`, the `deploy` script in `package.json`, `src/test/deploy.test.ts`, and any host configs you don't use.
