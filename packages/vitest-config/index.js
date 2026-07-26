const DEFAULT_INCLUDE = ['src/**/*.{test,spec}.{ts,tsx}'];
const DEFAULT_EXCLUDE = [
  'e2e/**',
  'node_modules/**',
  'dist/**',
  'storybook-static/**',
  'playwright-report/**',
];
const DEFAULT_SETUP_FILES = ['./src/test/setup.ts'];
const DEFAULT_COVERAGE_EXCLUDE = [
  'src/**/*.test.{ts,tsx}',
  'src/**/*.stories.{ts,tsx}',
  'src/main.tsx',
  'src/router.ts',
  'src/routeTree.gen.ts',
  'src/routes/**',
  'src/vite-env.d.ts',
  'src/mocks/**',
  'src/test/**',
  'src/types/**',
];

/**
 * @param {import('./index').VitestReactConfigOptions} [options]
 * @returns {import('vitest/config').UserConfig['test']}
 */
export function vitestReactConfig(options = {}) {
  const {
    include = DEFAULT_INCLUDE,
    exclude = DEFAULT_EXCLUDE,
    setupFiles = DEFAULT_SETUP_FILES,
    coverageInclude = ['src/**/*.{ts,tsx}'],
    coverageExclude = DEFAULT_COVERAGE_EXCLUDE,
  } = options;

  return {
    environment: 'jsdom',
    setupFiles,
    globals: false,
    css: false,
    include,
    exclude,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: coverageInclude,
      exclude: coverageExclude,
    },
  };
}

export default vitestReactConfig;
