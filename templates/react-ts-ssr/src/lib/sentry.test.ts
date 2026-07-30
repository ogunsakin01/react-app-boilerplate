import { beforeEach, describe, expect, it, vi } from 'vitest';

const sentryInit = vi.fn();
const browserTracing = vi.fn(() => ({ name: 'browserTracing' }));

vi.mock('@sentry/react', () => ({
  init: sentryInit,
  browserTracingIntegration: browserTracing,
}));

const envMock = {
  VITE_SENTRY_DSN: '' as string | undefined,
  VITE_SENTRY_ENVIRONMENT: undefined as string | undefined,
  VITE_SENTRY_TRACES_SAMPLE_RATE: 0.1 as number,
};

vi.mock('./env', () => ({
  get env() {
    return envMock;
  },
}));

beforeEach(() => {
  sentryInit.mockReset();
  envMock.VITE_SENTRY_DSN = '';
  envMock.VITE_SENTRY_ENVIRONMENT = undefined;
  envMock.VITE_SENTRY_TRACES_SAMPLE_RATE = 0.1;
});

describe('initSentry', () => {
  it('is a no-op when VITE_SENTRY_DSN is empty', async () => {
    const { initSentry } = await import('./sentry');
    expect(initSentry()).toBe(false);
    expect(sentryInit).not.toHaveBeenCalled();
  });

  it('initializes Sentry when a DSN is present', async () => {
    envMock.VITE_SENTRY_DSN = 'https://public@sentry.example.com/1';
    envMock.VITE_SENTRY_ENVIRONMENT = 'staging';
    envMock.VITE_SENTRY_TRACES_SAMPLE_RATE = 0.5;

    vi.resetModules();
    const { initSentry } = await import('./sentry');
    expect(initSentry()).toBe(true);
    expect(sentryInit).toHaveBeenCalledTimes(1);

    const opts = sentryInit.mock.calls[0][0];
    expect(opts.dsn).toBe('https://public@sentry.example.com/1');
    expect(opts.environment).toBe('staging');
    expect(opts.tracesSampleRate).toBe(0.5);
    expect(opts.integrations).toHaveLength(1);
    expect(opts.enabled).toBe(false);
  });

  it('falls back to import.meta.env.MODE when VITE_SENTRY_ENVIRONMENT is unset', async () => {
    envMock.VITE_SENTRY_DSN = 'https://public@sentry.example.com/1';

    vi.resetModules();
    const { initSentry } = await import('./sentry');
    initSentry();

    const opts = sentryInit.mock.calls[0][0];
    expect(opts.environment).toBe(import.meta.env.MODE);
  });
});
