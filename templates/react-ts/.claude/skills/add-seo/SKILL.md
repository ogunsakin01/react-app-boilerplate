---
name: add-seo
description: Add SEO meta tags (title, description, canonical, Open Graph, Twitter card) to a page. Use when the user asks to add SEO, meta tags, social preview / link preview cards, page title, canonical URL, or noindex. Uses the boilerplate's Seo atom which leverages React 19's native <head> hoisting — no react-helmet needed.
---

# add-seo

Every page renders `<Seo />` from `@/components/atoms/Seo` at the top of its JSX. React 19 hoists `<title>`, `<meta>`, and `<link>` elements into `<head>` automatically, so this works without `react-helmet-async` or any wrapper library.

## Add SEO to a page

```tsx
import { Seo } from '@/components/atoms/Seo';

export function Dashboard() {
  return (
    <section>
      <Seo
        title="Dashboard"
        siteName="Acme"
        description="Your team's dashboard — live metrics, alerts, and traces."
        canonical="https://acme.example.com/dashboard"
      />
      {/* rest of page */}
    </section>
  );
}
```

## Full prop set

| prop          | required | notes                                                                        |
| ------------- | -------- | ---------------------------------------------------------------------------- |
| `title`       | yes      | Combined with `siteName` as `${title} · ${siteName}` if provided             |
| `description` | no       | Emits `<meta name="description">` + `og:description` + `twitter:description` |
| `canonical`   | no       | Emits `<link rel="canonical">` + `og:url`                                    |
| `image`       | no       | Emits `og:image` + `twitter:image`; picks `summary_large_image` twitter card |
| `siteName`    | no       | Emits `og:site_name` and suffixes the title                                  |
| `type`        | no       | `website` (default) / `article` / `profile` — emits `og:type`                |
| `robots`      | no       | e.g. `"noindex,nofollow"` for preview / staging pages                        |
| `locale`      | no       | e.g. `"en_US"` — emits `og:locale`                                           |

## When to use `noindex`

- Preview or staging deploys of the same route
- Auth-gated pages that shouldn't be crawled
- Internal admin views

```tsx
<Seo title="Internal preview" robots="noindex,nofollow" />
```

## Verify

Run the app (`pnpm dev`), open the page, and inspect `<head>` in devtools. You should see `<title>` and the meta tags for the values you passed. Unit-test via `document.head.querySelector(...)` — see `src/components/atoms/Seo/Seo.test.tsx`.

## robots.txt

Ships as `public/robots.txt`. Vite copies `public/` into `dist/` at build time, so the file is served at `/robots.txt` in production automatically. Edit it for your deployment (e.g. disallow admin paths, add a full sitemap URL if your robots.txt lives on a separate domain).

## Sitemap

The sitemap is generated **from your routes** at build time by `scripts/generate-sitemap.mjs`, so it stays in sync with `src/routes/` without any manual step.

- Runs automatically as part of `pnpm build` (writes to `dist/sitemap.xml`).
- Standalone: `pnpm generate:sitemap` (or `node scripts/generate-sitemap.mjs`).
- Flags: `--base-url https://your.site` (or set `VITE_SITE_URL`), `--out path/to/file`, `--routes path/to/routes`.
- Skips: `__root.tsx` layout and any dynamic route file (contains `$`). Extend the script if you need dynamic entries (e.g. blog posts from a CMS).
