---
'create-atomic-react': patch
---

SPA: every page renders `<Seo>` with `siteName` from `VITE_APP_TITLE` (NotFound is `noindex`), and `index.html` ships default description / Open Graph tags for link-preview bots that don't run JavaScript; `<Seo>` removes them once per-page tags render. SSR: page titles use `VITE_APP_TITLE` instead of a hardcoded name.
