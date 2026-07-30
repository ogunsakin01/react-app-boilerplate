import * as Sentry from '@sentry/react';
import { env } from './env';

export function initSentry(): boolean {
  const dsn = env.VITE_SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    tracesSampleRate: env.VITE_SENTRY_TRACES_SAMPLE_RATE,
    integrations: [Sentry.browserTracingIntegration()],
    enabled: !import.meta.env.DEV,
  });

  return true;
}

export { Sentry };
