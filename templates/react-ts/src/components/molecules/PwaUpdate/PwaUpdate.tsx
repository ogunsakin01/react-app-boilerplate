import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/atoms/Button';

export function PwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      console.error('PWA service worker registration failed', err);
    },
  });

  if (!needRefresh && !offlineReady) return null;

  const dismiss = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 rounded-md border border-border bg-bg p-4 shadow-lg"
    >
      <p className="text-sm font-medium">
        {needRefresh ? 'A new version is available.' : 'App ready to work offline.'}
      </p>
      <div className="flex justify-end gap-2">
        {needRefresh ? (
          <Button variant="primary" onClick={() => updateServiceWorker(true)}>
            Reload
          </Button>
        ) : null}
        <Button variant="ghost" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
