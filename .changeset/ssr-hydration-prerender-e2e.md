---
'create-atomic-react': patch
---

SSR: `/watch?v=…` no longer hydrates with a mismatch (React #418) on direct loads. A new `e2e/prerender.spec.ts` checks the built, prerendered HTML through `vite preview` (titles, descriptions, OG tags, the 404 page) and fails on hydration errors, which the dev-server-only e2e never exercised. `strip-example` trims it, and `--pm npm|yarn` rewrites its server command.
