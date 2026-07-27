---
name: add-msw-handler
description: Add a mocked HTTP endpoint to this boilerplate's MSW handlers. Use when the user asks to mock, stub, fake, or fixture an API endpoint. The handler is picked up automatically by Vitest, Storybook, the dev browser, and Playwright — one file, four consumers.
---

# add-msw-handler

Edit `src/mocks/handlers.ts` — the single source of truth. The same file feeds:

- **Vitest** via `src/mocks/server.ts` (started in `src/test/setup.ts`)
- **Storybook** via `.storybook/preview.tsx` loader (starts the browser worker)
- **Dev browser** via `src/main.tsx` (starts the worker in `import.meta.env.DEV`)
- **Playwright e2e** via the running dev server's worker

## Add a GET

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.example.com/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Ada' });
  }),
];
```

## Add a POST that echoes the body

```ts
http.post('/api/users', async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json({ id: 1, ...body }, { status: 201 });
}),
```

## Return an error

```ts
http.get('/api/broken', () => new HttpResponse(null, { status: 500 })),
```

## Type-safe responses

If the response has a stable shape, declare it in `src/types/` and parameterize:

```ts
import type { User } from '@/types/user';
http.get('/api/me', () => HttpResponse.json<User>({ id: 1, name: 'Ada' }));
```

## Per-test overrides

In a Vitest test, override just for that test with `server.use(...)`:

```ts
import { server } from '@/mocks/server';
server.use(http.get('/api/me', () => new HttpResponse(null, { status: 401 })));
```

The setup file resets handlers after each test, so overrides are isolated.

## Verify

The e2e specs in `e2e/` run against the dev server which uses the browser worker, so if a handler works in Vitest it works everywhere. Run `pnpm test && pnpm e2e` to confirm.
