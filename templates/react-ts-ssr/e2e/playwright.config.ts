import { defineConfig } from '@playwright/test';
import { playwrightViteConfig } from '@react-app-boilerplate/playwright-config';

const base = playwrightViteConfig({
  webServerCommand: 'pnpm dev:app',
});

// The dev server renders on demand with MSW, so it never exercises the static
// HTML this variant ships. prerender.spec.ts runs against `vite preview` of a
// real build on PREVIEW_URL.
export const PREVIEW_URL = 'http://localhost:4173';

export default defineConfig({
  ...base,
  webServer: [
    ...(Array.isArray(base.webServer) ? base.webServer : base.webServer ? [base.webServer] : []),
    {
      command: 'pnpm build && pnpm preview',
      cwd: '..',
      url: PREVIEW_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
  ],
});
