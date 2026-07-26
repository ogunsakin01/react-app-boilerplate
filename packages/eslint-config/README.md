# @react-app-boilerplate/eslint-config

Shared ESLint flat configurations.

## Variants

- **`base`**. TypeScript + Prettier + browser/Node globals. Fits any TS project.
- **`vite-react`**. extends base with `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` for `src/**/*.{ts,tsx}`, and a Node-globals block for `e2e/`, `playwright.config.ts`, `vite.config.ts`.

## Usage

### Simple (no overrides)

```js
// eslint.config.mjs
export { default } from '@react-app-boilerplate/eslint-config/vite-react';
```

### With overrides

```js
// eslint.config.mjs
import { viteReact } from '@react-app-boilerplate/eslint-config/vite-react';

export default viteReact({
  ignores: ['my-custom-dir/**'],
});
```

### Composing with your own rules

```js
import tseslint from 'typescript-eslint';
import { viteReact } from '@react-app-boilerplate/eslint-config/vite-react';

export default tseslint.config(...viteReact(), {
  rules: { 'no-console': 'error' },
});
```

## What's always ignored

`node_modules`, `dist`, `build`, `coverage`, `storybook-static`, `playwright-report`, `test-results`, `.turbo`, `public/mockServiceWorker.js`, `src/routeTree.gen.ts`, `.storybook/**`.
