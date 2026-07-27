---
name: configure-pwa
description: Configure the boilerplate's Progressive Web App (PWA) support — manifest fields, theme colors, icons, precache patterns, and the update prompt. Use when the user asks about PWA, installability, service worker, offline support, manifest, add-to-home-screen, or app icons.
---

# configure-pwa

PWA support ships enabled via `vite-plugin-pwa`. The plugin is configured in `vite.config.ts` and the update prompt is wired into `MainLayout` via the `PwaUpdate` molecule (`src/components/molecules/PwaUpdate/`). No extra setup needed after scaffold — `pnpm build` produces `dist/sw.js`, `dist/manifest.webmanifest`, and precaches the built assets.

## Change the manifest

Edit `vite.config.ts` → `VitePWA({ manifest: { ... } })`. Fields worth setting:

- `name` — long form (defaults to `VITE_APP_TITLE`)
- `short_name` — homescreen label (defaults to `VITE_APP_SHORT_NAME` or `name`)
- `description` — defaults to `VITE_APP_DESCRIPTION`
- `theme_color` — matches the `<meta name="theme-color">` in `index.html` (update both)
- `background_color` — splash-screen background
- `display` — `standalone` (default), `fullscreen`, `minimal-ui`, or `browser`
- `icons` — array of `{src, sizes, type, purpose}`

For env-driven values, edit `.env.example`:

```
VITE_APP_TITLE=My App
VITE_APP_SHORT_NAME=App
VITE_APP_DESCRIPTION=Short pitch line for the manifest and social previews
```

## Change the icons

Default manifest points at `public/favicon.svg` for all sizes and purposes. For maximum compatibility (iOS Safari especially), add PNG variants:

1. Drop `pwa-192x192.png`, `pwa-512x512.png`, and `apple-touch-icon.png` into `public/`.
2. Add them to the `manifest.icons` array with explicit `sizes` and `type: 'image/png'`.
3. Update the `<link rel="apple-touch-icon">` tag in `index.html`.

`@vite-pwa/assets-generator` can generate PNG variants from a single SVG source:

```bash
pnpm dlx @vite-pwa/assets-generator --preset minimal-2023 public/favicon.svg
```

## Precache what's shipped

`workbox.globPatterns` in `vite.config.ts` controls what gets precached. Default:

```ts
globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'];
```

Add extensions if you ship other static assets (mp4, webp, etc). Skip large files (>2 MB by default) — override with `maximumFileSizeToCacheInBytes` if needed.

## Register mode

`registerType: 'prompt'` (default): the app shows the `PwaUpdate` toast when a new SW is available; the user clicks "Reload."

Switch to `registerType: 'autoUpdate'` if you want silent updates without a prompt (the SW takes over on the next navigation).

## Dev-time

`devOptions: { enabled: false }` — the SW is disabled in `pnpm dev` so hot-reload isn't fighting the cache. Flip to `enabled: true` when debugging PWA-specific behavior (be aware: it will cache your dev assets).

## Verify

```bash
pnpm build && pnpm preview
```

Open the preview URL, DevTools → Application → Manifest / Service Workers. Lighthouse's PWA audit should pass all installability checks.
