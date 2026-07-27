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
