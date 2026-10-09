---
'create-atomic-react': patch
---

Theme choice is saved and defaults to the system light/dark preference, with an inline boot script so neither variant flashes the wrong theme (SSR hydration still matches). Empty env values copied from `.env.example` (`KEY=""`) now fall back to schema defaults instead of overriding them. Queries no longer retry 4xx `ApiError`s.
