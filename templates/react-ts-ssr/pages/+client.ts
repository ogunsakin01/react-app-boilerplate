import { initSentry } from '@/lib/sentry';

initSentry();

if (import.meta.env.DEV) {
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
