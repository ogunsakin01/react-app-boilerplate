---
'create-atomic-react': patch
---

SPA: the root route's error component accepts the router's `ErrorComponentProps` and narrows `error` from `unknown`, so new projects type-check with current `@tanstack/react-router` releases (1.170.41+ type thrown errors as `unknown`).
