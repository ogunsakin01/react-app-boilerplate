import { devices } from '@playwright/test';

/**
 * @param {import('./index').PlaywrightViteConfigOptions} [options]
 * @returns {import('@playwright/test').PlaywrightTestConfig}
 */
export function playwrightViteConfig(options = {}) {
  const CI = !!process.env.CI;
  const {
    baseURL = 'http://localhost:5173',
    webServerCommand = 'pnpm dev',
    webServerCwd = '..',
    webServerUrl = baseURL,
    webServerTimeout = 120_000,
    testDir = '.',
    projects = [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  } = options;

  return {
    testDir,
    fullyParallel: true,
    forbidOnly: CI,
    retries: CI ? 2 : 0,
    workers: CI ? 1 : undefined,
    reporter: CI ? [['html', { open: 'never' }], ['github']] : 'list',
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
    projects,
    webServer: {
      command: webServerCommand,
      cwd: webServerCwd,
      url: webServerUrl,
      reuseExistingServer: !CI,
      timeout: webServerTimeout,
    },
  };
}

export default playwrightViteConfig;
