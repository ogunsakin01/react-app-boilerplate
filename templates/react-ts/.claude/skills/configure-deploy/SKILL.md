---
name: configure-deploy
description: Deploy this app's built output to an S3-compatible bucket (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO) and optionally invalidate a CloudFront cache. Use when the user asks about deploying, publishing, CDN, S3, R2, Spaces, CloudFront, bucket upload, or hosting the SPA.
---

# configure-deploy

`scripts/deploy.mjs` ships `dist/` to any S3-compatible bucket via the AWS CLI. Zero JS SDK bloat — it shells out to `aws s3 sync` (which handles concurrent uploads, MIME detection, ETag comparison) and optionally invalidates a CloudFront distribution afterwards.

## Prerequisites

- **AWS CLI** on PATH (`aws --version`). Install: https://aws.amazon.com/cli/
- **Credentials** via the standard chain (env vars, `~/.aws/credentials`, IAM role, or SSO)
- **A built app**: `pnpm build` first

## Basic AWS S3 deploy

```bash
DEPLOY_BUCKET=my-app-prod pnpm deploy
```

Uploads `dist/` to `s3://my-app-prod/` with two cache policies:

| files                                                                      | cache-control                       |
| -------------------------------------------------------------------------- | ----------------------------------- |
| hashed assets (JS/CSS with `-<hash>.` filenames)                           | `public,max-age=31536000,immutable` |
| `index.html`, `sw.js`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml` | `public,max-age=0,must-revalidate`  |

The `--delete` flag removes files from the bucket that are no longer in `dist/` (safe: hashed filenames mean no in-flight page can reference them).

## S3-compatible providers

Any provider with an S3-compatible API works via `--endpoint` (or `DEPLOY_ENDPOINT`):

```bash
# Cloudflare R2
DEPLOY_BUCKET=my-app \
DEPLOY_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com \
pnpm deploy

# DigitalOcean Spaces
DEPLOY_BUCKET=my-app \
DEPLOY_ENDPOINT=https://<region>.digitaloceanspaces.com \
pnpm deploy

# MinIO (self-hosted)
DEPLOY_BUCKET=my-app \
DEPLOY_ENDPOINT=https://minio.internal:9000 \
pnpm deploy
```

Credentials still come from the standard AWS chain (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` env vars work for all providers).

## CloudFront invalidation

Append `--cloudfront-id <id>` (or set `DEPLOY_CLOUDFRONT_ID`) to invalidate the entry-point files after upload:

```bash
DEPLOY_BUCKET=my-app-prod \
DEPLOY_CLOUDFRONT_ID=E1234567890 \
pnpm deploy
```

Only entry-point files are invalidated (index.html, sw.js, manifest.webmanifest, robots.txt, sitemap.xml). Hashed assets never need invalidation because their filenames change per build.

## Serve from a CDN prefix

If you serve assets from a CDN with a subpath (e.g. `https://cdn.example.com/app/`), set `VITE_BASE_URL` at build time:

```bash
VITE_BASE_URL=https://cdn.example.com/app/ pnpm build
```

Vite bakes that URL into every hashed asset reference. Deploy the resulting `dist/` to the corresponding path.

## Dry run

```bash
pnpm deploy --bucket my-app --dry-run
```

Prints every `aws` command without executing anything. Use to verify the config before shipping.

## All flags

| flag               | env var                | notes                           |
| ------------------ | ---------------------- | ------------------------------- |
| `--bucket`, `-b`   | `DEPLOY_BUCKET`        | required                        |
| `--dist`, `-d`     | —                      | default: `dist`                 |
| `--endpoint`, `-e` | `DEPLOY_ENDPOINT`      | for R2/Spaces/MinIO             |
| `--region`, `-r`   | `AWS_REGION`           | standard AWS region             |
| `--cloudfront-id`  | `DEPLOY_CLOUDFRONT_ID` | invalidate after upload         |
| `--dry-run`        | —                      | preview commands, don't execute |

## Managed hosts (zero-config)

The template ships preconfigured for the three most common managed hosts. Import the repo and the build works with no extra flags.

**Vercel** — `vercel.json` at the root handles SPA fallback and cache-control. Just link the repo in the Vercel dashboard.

**Netlify** — `netlify.toml` at the root sets build command, publish dir, SPA fallback, and cache headers. Link the repo in the Netlify dashboard.

**Cloudflare Pages** — `public/_redirects` and `public/_headers` handle SPA fallback and cache-control (Vite copies `public/` into `dist/`). In Cloudflare Pages, set the build command to `pnpm build` and the output dir to `dist`.

**GitHub Pages** — use `actions/deploy-pages` after `pnpm build`. Set `VITE_BASE_URL=/repo-name/` if serving from a subpath.

If you go with a managed host, you can delete `scripts/deploy.mjs`, the `deploy` script in `package.json`, the `deploy.test.ts`, and any host configs you don't use.
