import { createRootRoute, Outlet, type ErrorComponentProps } from '@tanstack/react-router';
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

// Newer router versions type `error` as `unknown` (anything can be thrown),
// so narrow it rather than assuming an Error.
function ErrorComponent({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <MainLayout>
      <div role="alert" className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Something went wrong</h2>
        <pre className="rounded-md border border-border p-3 text-sm text-muted">{message}</pre>
      </div>
    </MainLayout>
  );
}
