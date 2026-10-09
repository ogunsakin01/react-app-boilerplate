---
'create-atomic-react': patch
---

`pnpm generate` refuses to overwrite existing routes/pages, honours `--dir` in route imports, no longer nests a second `<main>`, and (SPA) regenerates `routeTree.gen.ts` so a new page type-checks immediately; `typecheck`/`build` regenerate it too. SSR pages also get a `+description.ts`. `strip-example` (both variants) now rewrites the MainLayout test and a11y spec, is idempotent, never replaces an edited Home page, and writes Prettier-clean files.
