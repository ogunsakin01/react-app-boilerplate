---
name: add-seo
description: Add SEO meta tags (title, description, Open Graph image, canonical, Twitter card, noindex) to a page in this Vike SSR project. Use when the user asks to add SEO, meta tags, social preview / link preview cards, page title, canonical URL, or noindex. Tags are set with Vike's +title / +description / +image / +Head files and baked into the prerendered HTML - no react-helmet, no Seo component.
---

# add-seo

Every route is prerendered to static HTML at build time, so whatever you set here is in the HTML that crawlers and link-preview bots (Slack, X, Facebook, LinkedIn) fetch - no JavaScript needed.

Metadata lives next to the page in `pages/<slug>/`, never inside React components. Do not render `<title>` or `<meta>` from components, and do not install `react-helmet-async`.

## Title and description

```ts
// pages/dashboard/+title.ts
export const title = 'Dashboard · Acme';
```

```ts
// pages/dashboard/+description.ts
export const description = "Your team's dashboard - live metrics, alerts, and traces.";
```

`vike-react` turns these into `<title>`, `og:title`, `<meta name="description">` and `og:description`. A page without its own `+title.ts` falls back to the site-wide `title` in `pages/+config.ts`.

## Social preview image

```ts
// pages/dashboard/+image.ts
export const image = 'https://acme.example.com/og/dashboard.png';
```

Emits `og:image` and `<meta name="twitter:card" content="summary_large_image">`. Use an absolute URL - crawlers don't resolve relative ones.

## Everything else: `+Head.tsx`

For canonical URLs, `og:url`, `og:type`, a `twitter:card` on pages without `+image`, and `robots`, add a `+Head.tsx` to the page (see `pages/index/+Head.tsx`):

```tsx
// pages/dashboard/+Head.tsx
export default function Head() {
  return (
    <>
      <link rel="canonical" href="https://acme.example.com/dashboard" />
      <meta property="og:url" content="https://acme.example.com/dashboard" />
      <meta property="og:type" content="website" />
    </>
  );
}
```

Site-wide head tags (favicon, theme colour) live in `pages/+Head.tsx`. Page `+Head` files add to it rather than replacing it.

## When to use `noindex`

- Preview or staging deploys of the same route
- Auth-gated pages that shouldn't be crawled
- Internal admin views

```tsx
// pages/internal/+Head.tsx
export default function Head() {
  return <meta name="robots" content="noindex,nofollow" />;
}
```

## Dynamic values

Values must be known at build time - the HTML is generated once by `pnpm build`. For pages built from data (e.g. blog posts), export a function instead of a string; it receives `pageContext`:

```ts
// pages/blog/@slug/+title.ts
import type { PageContext } from 'vike/types';

export function title(pageContext: PageContext) {
  const { post } = pageContext.data as { post: { title: string } };
  return `${post.title} · Acme`;
}
```

That needs a `+data.ts` and a `+onBeforePrerenderStart.ts` that lists every slug - see https://vike.dev/onBeforePrerenderStart.

## Verify

```bash
pnpm build
```

Open `dist/client/<slug>/index.html` (or `dist/client/index.html` for `/`) and check the `<head>`. That file is exactly what a crawler sees. `pnpm preview` serves the same output.

## robots.txt

Ships as `public/robots.txt` and is copied to `dist/client/robots.txt`. Edit it for your deployment, and replace the relative `Sitemap:` line with your absolute sitemap URL (the robots.txt spec requires an absolute URL).

## Sitemap

Generated **from `pages/`** at build time by `scripts/generate-sitemap.mjs`:

- Runs automatically as part of `pnpm build` (writes `dist/client/sitemap.xml`).
- Standalone: `pnpm generate:sitemap`.
- Flags: `--base-url https://your.site` (or set `VITE_SITE_URL` in the shell - the script does not read `.env`), `--out <file>`, `--pages <dir>`.
- Includes every directory with a `+Page.tsx`. Skips folders starting with `_` (`_error`). Route-parameter folders (`@slug`) are not handled yet - exclude them or extend the script.
