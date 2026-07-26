# Adding auth

There's no built-in auth. pick a provider and add its SDK. This guide uses **Clerk** as a concrete example, but the pattern is the same for Auth0, Supabase, Firebase Auth, Better Auth, etc.: install the SDK, wrap the app in a provider, gate routes.

## Install

```bash
pnpm add @clerk/clerk-react
```

Add the publishable key to `src/lib/env.ts`:

```ts
const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});
```

Copy `.env.example` to `.env.local` and set `VITE_CLERK_PUBLISHABLE_KEY`.

## Wrap the app

Add the provider to `src/providers/AppProviders.tsx`:

```tsx
import { ClerkProvider } from '@clerk/clerk-react';
import { env } from '@/lib/env';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
```

## Gate a route

TanStack Router supports per-route `beforeLoad`:

```tsx
// src/routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Read from Clerk here (or your provider's equivalent).
    const isSignedIn = /* … */;
    if (!isSignedIn) throw redirect({ to: '/' });
  },
  component: Dashboard,
});
```

## Testing

Mock the auth SDK in `src/mocks/handlers.ts` (or a co-located mock module) so Vitest, Storybook, and Playwright don't need real credentials. For Clerk specifically, use `@clerk/testing`.
