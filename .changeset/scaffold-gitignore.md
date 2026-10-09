---
'create-atomic-react': patch
---

Scaffolded projects now get a `.gitignore`. npm strips `.gitignore` from published tarballs, so the template now ships it as `_gitignore` and the CLI renames it on copy (merging into an existing `.gitignore` when scaffolding into `.`). The template ignore list also covers `.env*` (except `.env.example`), `coverage`, logs and `.DS_Store`.
