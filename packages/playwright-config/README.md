# @react-app-boilerplate/playwright-config

Shared Playwright configuration for Vite-based React apps.

- CI-aware: 2 retries / 1 worker / HTML + GitHub reporters when `CI=true`; `list` reporter locally.
- Trace on first retry, screenshot only on failure.
- `webServer` auto-starts Vite (`pnpm dev`) from the parent directory (`cwd: '..'`). matches the plan's `e2e/` colocation.
- MSW handlers flow to Playwright via the dev server (which registers the service worker in dev).

## Usage

```ts
// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test';
import { playwrightViteConfig } from '@react-app-boilerplate/playwright-config';

export default defineConfig(playwrightViteConfig());
```

## Overrides

```ts
import { defineConfig, devices } from '@playwright/test';
import { playwrightViteConfig } from '@react-app-boilerplate/playwright-config';

export default defineConfig(
  playwrightViteConfig({
    baseURL: 'http://localhost:4173',
    webServerCommand: 'pnpm preview',
    projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
  }),
);
```
