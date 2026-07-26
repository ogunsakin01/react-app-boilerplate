import { createRootRoute, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { NotFound } from '@/pages/NotFound';

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : null;

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: () => (
    <MainLayout>
      <NotFound />
    </MainLayout>
  ),
});

function RootComponent() {
  return (
    <MainLayout>
      <Outlet />
      {TanStackRouterDevtools ? (
        <Suspense fallback={null}>
          <TanStackRouterDevtools />
        </Suspense>
      ) : null}
    </MainLayout>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <MainLayout>
      <div role="alert" className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Something went wrong</h2>
        <pre className="rounded-md border border-border p-3 text-sm text-muted">
          {error.message}
        </pre>
      </div>
    </MainLayout>
  );
}
