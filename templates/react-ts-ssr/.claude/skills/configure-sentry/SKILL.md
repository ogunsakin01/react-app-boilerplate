---
name: configure-sentry
description: Enable, disable, or tune Sentry error tracking + performance monitoring in this boilerplate. Use when the user asks about error tracking, crash reporting, Sentry, monitoring, or setting up alerts. Sentry is wired to opt-in via VITE_SENTRY_DSN - set the DSN and it activates, leave it empty and Sentry never loads.
---

# configure-sentry

Sentry is wired via `@sentry/react`. Initialization lives in `src/lib/sentry.ts` and runs once from `src/main.tsx` before the React tree mounts. It is a no-op unless `VITE_SENTRY_DSN` is set.

## Enable Sentry

Add to `.env.local` (or your production env):

```
VITE_SENTRY_DSN=https://<public-key>@<org-ingest>.sentry.io/<project-id>
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

The DSN is public (safe to ship in the client bundle). `VITE_SENTRY_ENVIRONMENT` falls back to `import.meta.env.MODE` if unset. `VITE_SENTRY_TRACES_SAMPLE_RATE` is 0.0-1.0; keep it low (0.05-0.1) in production to control quota.

The env schema in `src/lib/env.ts` already validates all three fields.

## Disable in development

The init helper sets `enabled: !import.meta.env.DEV`, so Sentry is inert in `pnpm dev` even if a DSN is present. Flip that flag in `src/lib/sentry.ts` if you want to test capture locally.

## Wrap route errors

Wire Sentry into TanStack Router's error boundary by importing `Sentry` from `@/lib/sentry` in `src/routes/__root.tsx`:

```tsx
import { Sentry } from '@/lib/sentry';

function ErrorComponent({ error }: { error: Error }) {
  Sentry.captureException(error);
  return <div role="alert">Something went wrong: {error.message}</div>;
}
```

## Add Session Replay (optional)

```ts
integrations: [
  Sentry.browserTracingIntegration(),
  Sentry.replayIntegration({
    maskAllText: true,
    blockAllMedia: true,
  }),
],
replaysSessionSampleRate: 0.01,
replaysOnErrorSampleRate: 1.0,
```

## Upload source maps (optional but recommended)

Install `@sentry/vite-plugin` and add to `vite.config.ts` plugins array (guarded by env so builds work without the token):

```ts
if (env.SENTRY_AUTH_TOKEN) {
  plugins.push(
    sentryVitePlugin({
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      authToken: env.SENTRY_AUTH_TOKEN,
    }),
  );
}
```

`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` are build-only - put them in the CI environment, not in `.env.local`.

## Verify

```bash
pnpm build && pnpm preview
```

Open the preview URL, throw an error from the console:

```js
throw new Error('sentry smoke test');
```

Check the Sentry issue stream. If you see the error, you're wired up.
