---
'create-atomic-react': patch
---

Sitemap generation reads `VITE_SITE_URL` from `.env` / `.env.production` (not only the shell) and warns when it falls back to example.com, rewrites the `robots.txt` `Sitemap:` line to an absolute URL, follows TanStack Router's file-routing rules (nested folders, `.` nesting, `_pathless`, `(group)`, `-ignored`, `route.tsx`) in the SPA, and skips Vike `@param` folders in SSR. `VITE_SITE_URL` is now in `.env.example`.
