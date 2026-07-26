import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import { DEFAULT_IGNORES } from './base.js';

const VITE_REACT_IGNORES = [
  ...DEFAULT_IGNORES,
  // Generated or vendored, never lint.
  '**/public/mockServiceWorker.js',
  '**/src/routeTree.gen.ts',
  '.storybook/**',
];

const DEFAULT_REACT_FILES = ['src/**/*.{ts,tsx}'];
const DEFAULT_NODE_FILES = ['e2e/**/*.ts', 'playwright.config.ts', 'vite.config.ts'];

export function viteReact({
  ignores = [],
  reactFiles = DEFAULT_REACT_FILES,
  nodeFiles = DEFAULT_NODE_FILES,
} = {}) {
  return tseslint.config(
    { ignores: [...VITE_REACT_IGNORES, ...ignores] },
    {
      files: reactFiles,
      languageOptions: {
        ecmaVersion: 2022,
        globals: globals.browser,
      },
      extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended,
        reactHooks.configs['recommended-latest'],
        reactRefresh.configs.vite,
      ],
    },
    {
      files: nodeFiles,
      languageOptions: {
        ecmaVersion: 2022,
        globals: globals.node,
      },
      extends: [js.configs.recommended, ...tseslint.configs.recommended],
    },
    prettier,
  );
}

export default viteReact();
