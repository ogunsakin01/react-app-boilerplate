---
'create-atomic-react': patch
---

Host configs (Netlify, Vercel, Cloudflare Pages) send baseline security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`). SPA PWA: `mockServiceWorker.js` is no longer precached, a CDN `VITE_BASE_URL` keeps the app and service worker same-origin and points only JS/CSS at the CDN, and a sub-path base moves the manifest scope, icons and offline fallback with it. Storybook a11y violations show as errors instead of todos.
