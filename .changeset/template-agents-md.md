---
'create-atomic-react': minor
---

Scaffolded projects now ship a variant-specific `AGENTS.md` (plus a `CLAUDE.md` that imports it), so Cursor, Codex, Claude Code and other agents pick up the project's conventions - routing, SEO, testing mocks, env handling and deploy - for the SPA or SSR variant. `--mui` and `--react-aria` append a section describing their wrapper atoms.
