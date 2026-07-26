# @react-app-boilerplate/vitest-config

Shared Vitest configuration for React apps: jsdom, v8 coverage, sensible excludes for stories/routes/mocks.

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vitestReactConfig } from '@react-app-boilerplate/vitest-config';

export default defineConfig({
  plugins: [react()],
  test: vitestReactConfig(),
});
```

## Overrides

```ts
test: vitestReactConfig({
  setupFiles: ['./src/test/setup.ts', './src/test/msw.ts'],
  coverageExclude: ['src/**/*.test.{ts,tsx}', 'src/legacy/**'],
});
```

## Defaults

- `environment: 'jsdom'`
- `globals: false` (explicit imports from `vitest`)
- `setupFiles: ['./src/test/setup.ts']`
- `include: ['src/**/*.{test,spec}.{ts,tsx}']`
- `exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'storybook-static/**', 'playwright-report/**']`
- Coverage: v8 provider, `text` + `html` + `lcov` reporters, excludes stories/routes/mocks/generated files
