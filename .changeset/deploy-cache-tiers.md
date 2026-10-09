---
'create-atomic-react': patch
---

`pnpm deploy` now caches only Vite's hashed `assets/` as immutable; every other file (HTML at any depth, favicon, robots.txt, sitemap, service workers, Vike page data) revalidates. Old assets are kept so open tabs can still lazy-load chunks (`--prune-assets` removes them), CloudFront invalidates `/*`, and the SSR variant deploys `dist/client` by default instead of the wrong `dist` folder.
