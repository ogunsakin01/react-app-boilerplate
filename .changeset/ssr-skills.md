---
'create-atomic-react': patch
---

The SSR template's Claude Code skills now describe the Vike variant (`+title` / `+description` / `+image` / `+Head` for SEO, `pages/+client.ts`, the `_error` page for Sentry, per-key env reads, `dist/client` deploys) instead of the SPA. The SPA-only `configure-pwa` skill is no longer shipped with `--ssr`. Both `add-env-var` skills now warn that `z.coerce.boolean()` parses `"false"` as `true`.
