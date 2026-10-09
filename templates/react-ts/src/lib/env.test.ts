import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadEnv() {
  vi.resetModules();
  return (await import('./env')).env;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('env', () => {
  it('treats empty strings from .env.example as unset so defaults apply', async () => {
    vi.stubEnv('VITE_APP_TITLE', '');
    vi.stubEnv('VITE_SENTRY_ENVIRONMENT', '');
    vi.stubEnv('VITE_SENTRY_TRACES_SAMPLE_RATE', '');

    const env = await loadEnv();

    expect(env.VITE_APP_TITLE).toBe('react-app-boilerplate');
    expect(env.VITE_SENTRY_ENVIRONMENT).toBeUndefined();
    expect(env.VITE_SENTRY_TRACES_SAMPLE_RATE).toBe(0.1);
  });

  it('fails fast on an invalid value', async () => {
    vi.stubEnv('VITE_SENTRY_TRACES_SAMPLE_RATE', '5');

    await expect(loadEnv()).rejects.toThrow(/Invalid environment variables/);
  });
});
