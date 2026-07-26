import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export const DEFAULT_IGNORES = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/storybook-static/**',
  '**/playwright-report/**',
  '**/test-results/**',
  '**/.turbo/**',
];

export function base({ ignores = [] } = {}) {
  return tseslint.config(
    { ignores: [...DEFAULT_IGNORES, ...ignores] },
    {
      files: ['**/*.{js,mjs,cjs,ts,tsx}'],
      languageOptions: {
        ecmaVersion: 2022,
        globals: { ...globals.browser, ...globals.node },
      },
      extends: [js.configs.recommended, ...tseslint.configs.recommended],
    },
    prettier,
  );
}

export default base();
