---
name: add-env-var
description: Add a typed environment variable to this boilerplate. Use when the user asks to add an API base URL, feature flag, or any VITE_ variable. Ensures the zod schema, .env.example, and TypeScript types stay in sync so the app fails fast at build time if the value is missing or malformed.
---

# add-env-var

Three edits, in this order:

## 1. Extend the zod schema at `src/lib/env.ts`

```ts
const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),
  // add here:
  VITE_API_BASE_URL: z.string().url(),
  VITE_ENABLE_BETA: z.coerce.boolean().default(false),
});
```

The schema is parsed at module load. Missing or malformed values throw before the app renders, so failures are loud and immediate.

## 2. Document in `.env.example`

```
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_BETA=false
```

Anyone cloning the repo copies `.env.example` → `.env.local` and edits.

## 3. Consume via the typed export

```ts
import { env } from '@/lib/env';

fetch(`${env.VITE_API_BASE_URL}/users`);
if (env.VITE_ENABLE_BETA) {
  /* ... */
}
```

TypeScript infers each field's type from the schema - no manual `.d.ts` needed.

## Rules

- **Only `VITE_`-prefixed vars reach the browser bundle** (Vite convention). This boilerplate is client-only, so every var must be `VITE_`.
- **Never** hard-code URLs, keys, or feature flags. If it changes per environment, it's an env var.
- **Secrets belong on the server**, not in `VITE_*`. If it must be secret from the user, it doesn't belong in this app at all.
- For booleans, use `z.coerce.boolean()` because env values arrive as strings.

## Verify

Run `pnpm typecheck && pnpm build`. If the new var is missing from `.env.local`, the build fails with the exact zod error path.
