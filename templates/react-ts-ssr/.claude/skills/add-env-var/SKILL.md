---
name: add-env-var
description: Add a typed environment variable to this Vike SSR project. Use when the user asks to add an API base URL, feature flag, or any VITE_ variable. Ensures the zod schema, the explicit import.meta.env read that Vike requires, .env.example, and TypeScript types stay in sync so the app fails fast at build time if the value is missing or malformed.
---

# add-env-var

Four edits, in this order. Step 2 is specific to Vike - skip it and the value is silently `undefined`.

## 1. Extend the zod schema at `src/lib/env.ts`

```ts
const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),
  // add here:
  VITE_API_BASE_URL: z.string().url(),
  VITE_ENABLE_BETA: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});
```

## 2. Read the key explicitly in the `parseEnv({ ... })` call

At the bottom of `src/lib/env.ts`, every key is read one by one:

```ts
export const env: Env = parseEnv({
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  // add here:
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_ENABLE_BETA: import.meta.env.VITE_ENABLE_BETA,
});
```

Vike replaces the bare `import.meta.env` expression with `null` (https://vike.dev/env), so `parseEnv(import.meta.env)` or spreading it would see nothing. Each `import.meta.env.VITE_X` must appear literally so Vite can inline it.

The schema is parsed at module load - during `pnpm build` (prerender) and again in the browser. Missing or malformed values fail the build with the zod error path.

## 3. Document in `.env.example`

```
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_BETA=false
```

Anyone cloning the repo copies `.env.example` → `.env.local` and edits. `.env` and `.env.*` are gitignored; `.env.example` is not.

## 4. Consume via the typed export

```ts
import { env } from '@/lib/env';

fetch(`${env.VITE_API_BASE_URL}/users`);
if (env.VITE_ENABLE_BETA) {
  /* ... */
}
```

TypeScript infers each field's type from the schema - no manual `.d.ts` needed.

## Rules

- **Only `VITE_`-prefixed vars reach the code** (Vite convention). There is no server at runtime - pages are prerendered - so every var the app reads must be `VITE_`.
- **Values are baked in at build time.** Prerendered HTML and the JS bundle both contain them; changing a value means rebuilding.
- **Never** hard-code URLs, keys, or feature flags. If it changes per environment, it's an env var.
- **Secrets don't belong in `VITE_*`.** They end up in the shipped HTML and JS. If it must be secret from the user, it doesn't belong in this app.
- **Booleans:** env values arrive as strings, and `z.coerce.boolean()` turns `"false"` into `true`. Use the `z.enum(['true', 'false']).transform(...)` pattern above.
- **Empty strings:** copying `.env.example` with `KEY=""` passes an empty string, not `undefined`, so `.default()` won't apply. Use `.optional().or(z.literal(''))` for optional values and handle `''` where you read them.

## Verify

Run `pnpm typecheck && pnpm build`. If the new var is missing or malformed, the build fails with the exact zod error path. Grep the output to confirm the value was inlined:

```bash
grep -r "api.example.com" dist/client/assets | head -1
```
