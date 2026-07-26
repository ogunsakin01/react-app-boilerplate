# react-app-boilerplate

> Opinionated React + TypeScript starter that ships a full testing pyramid, atomic design, and updates on autopilot.

<!-- BADGES: replace OWNER/REPO with your GitHub owner and repository name. -->

[![CI](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/ci.yml?branch=main&label=CI)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![E2E](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/e2e.yml?branch=main&label=E2E)](https://github.com/OWNER/REPO/actions/workflows/e2e.yml)
[![Coverage](https://img.shields.io/codecov/c/github/OWNER/REPO?label=coverage)](https://codecov.io/gh/OWNER/REPO)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/OWNER/REPO?label=code%20quality)](https://codeclimate.com/github/OWNER/REPO)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../../CONTRIBUTING.md)

## Why this boilerplate

- **Configs don't rot.** Shareable config packages + Renovate keep every project on the latest lint / test / build rules without you re-scaffolding. (Phase 2)
- **Full testing pyramid, one source of truth.** Vitest + React Testing Library, Storybook interaction tests, and Playwright all share the same MSW handlers in `src/mocks/handlers.ts`.
- **Type-safe from routing to data.** TanStack Router (file-based) + TanStack Query, both with generated types, zod-validated env, strict TS.
- **Atomic design, enforced.** Every component ships with `.tsx` + `.stories.tsx` + `.test.tsx` + `index.ts`. no exceptions.
- **Zero bikeshedding.** ESLint flat config, Prettier, Conventional Commits (commitlint), husky + lint-staged, Renovate. all pre-wired.

## Quick start

```bash
# 1. Use this template from GitHub, then clone your new repo
git clone https://github.com/OWNER/REPO.git my-app && cd my-app

# 2. Install
corepack enable
pnpm install

# 3. Run
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The landing page **is** the boilerplate tour. a working YouTube URL loader that exercises every pattern this template ships (routing with search params, TanStack Query, react-hook-form + zod, MSW handlers, atomic components, tests, stories). MSW starts automatically in dev so no backend is needed.

## The `example/` folder pattern

The demo lives in **`example/` sub-folders across the tree**. Every file marked `EXAMPLE - safe to delete` is part of the tour, nothing else:

```
src/components/atoms/example/{UrlInput,VideoFrame}/
src/components/molecules/example/VideoUrlForm/
src/components/organisms/example/VideoPlayer/
src/hooks/example/useVideoOEmbed.ts
src/lib/example/youtube.ts (+ .test.ts)
src/pages/example/{Home,Watch}/
src/types/example/oembed.ts
src/routes/watch.tsx          (also delete)
```

**To strip the example and start your own:**

```bash
find src -type d -name example -exec rm -rf {} +
rm src/routes/watch.tsx
```

Then edit these three spots:

1. `src/routes/index.tsx`. swap the `import { Home } from '@/pages/example/Home'` for your own Home component.
2. `src/components/{atoms,molecules,organisms}/index.ts`. delete the `export * from './example'` line (each file has a comment marking it).
3. `src/mocks/handlers.ts`. replace the `noembed.com` handler with yours.
4. `src/lib/env.ts` + `.env.example`. remove `VITE_OEMBED_BASE_URL`.
5. `e2e/app.spec.ts`. replace the YouTube specs with your own smoke test.

Everything outside `example/` is the actual template surface. provider composition, ESLint/Prettier configs, MSW plumbing, Playwright wiring, husky hooks. Keep it.

## What's inside

```
templates/react-ts/
├── .storybook/         # Storybook config
├── e2e/                # Playwright (own tsconfig, webServer starts vite)
├── public/             # Static assets + mockServiceWorker.js (MSW)
├── src/
│   ├── components/     # atoms / molecules / organisms / templates
│   ├── pages/          # Home, NotFound
│   ├── routes/         # TanStack Router file-based routes
│   ├── providers/      # AppProviders composes Query + Theme
│   ├── hooks/          # typed TanStack Query hooks
│   ├── lib/            # api.ts, query-client.ts, env.ts (zod)
│   ├── mocks/          # MSW handlers, server (Vitest), browser (dev/Storybook)
│   ├── styles/         # Tailwind v4 + CSS variable theme tokens
│   ├── test/           # Vitest setup (RTL matchers, MSW lifecycle)
│   ├── types/
│   ├── router.ts
│   └── main.tsx
├── eslint.config.mjs   # ESLint flat config
├── tsconfig.*.json     # strict TS, @/* path alias
└── vite.config.ts      # Vite + Vitest + TanStack Router plugin
```

## Scripts

| Script                 | What it does                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `pnpm dev`             | Start Vite dev server on `:5173` (starts MSW in the browser) |
| `pnpm build`           | Type-check then produce a production build in `dist/`        |
| `pnpm preview`         | Serve the production build locally                           |
| `pnpm typecheck`       | `tsc -b --noEmit` across all tsconfigs                       |
| `pnpm lint`            | ESLint (flat config)                                         |
| `pnpm test`            | Vitest, single run                                           |
| `pnpm test:watch`      | Vitest, watch mode                                           |
| `pnpm test:coverage`   | Vitest with v8 coverage (lcov + html)                        |
| `pnpm e2e`             | Playwright. auto-starts the dev server                       |
| `pnpm e2e:ui`          | Playwright UI mode                                           |
| `pnpm storybook`       | Storybook dev on `:6006`                                     |
| `pnpm build-storybook` | Static Storybook build in `storybook-static/`                |

## How to use

### Add a component

```bash
mkdir -p src/components/atoms/Badge/
```

Create four files following the convention:

- `Badge.tsx`. the component
- `Badge.stories.tsx`. Storybook stories
- `Badge.test.tsx`. Vitest + RTL tests
- `index.ts`. barrel export

Then re-export from `src/components/atoms/index.ts`.

### Add a route

Create a file in `src/routes/`. TanStack Router's Vite plugin regenerates `src/routeTree.gen.ts` on save.

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: () => <p>About</p>,
});
```

### Add a query hook

```ts
// src/hooks/usePosts.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiGet<Post[]>('/api/posts'),
  });
}
```

Add a matching MSW handler in `src/mocks/handlers.ts`. it'll flow to Vitest, Storybook, and Playwright automatically.

### Add a form

Use `react-hook-form` + `zod` via `zodResolver`. See `src/components/molecules/SearchForm/SearchForm.tsx` for the reference implementation.

### Add an MSW handler

Edit `src/mocks/handlers.ts`. one array, three consumers (Vitest via `server.ts`, dev + Storybook via `browser.ts`, Playwright via the dev server the config starts).

### Add an env var

Edit `src/lib/env.ts`, extend the zod schema. Missing vars throw at import time. build fails fast.

```ts
const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),
  VITE_API_BASE_URL: z.string().url(), // required. no default
});
```

Copy `.env.example` to `.env.local` for local values.

### Write a story

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = { title: 'Atoms/Badge', component: Badge };
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: 'New' } };
```

For interactions:

```tsx
import { expect, userEvent, within } from 'storybook/test';

export const Clicked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByText('Clicked!')).toBeVisible();
  },
};
```

### Write a Playwright test

```ts
// e2e/checkout.spec.ts
import { expect, test } from '@playwright/test';

test('checkout flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Buy' }).click();
  await expect(page).toHaveURL(/checkout/);
});
```

MSW is running against the dev server, so specs get the same fixtures as unit and story tests.

## Deploying

- **Vercel**: import the repo. Vite is detected. Set `pnpm build` / `dist/`.
- **Netlify**: build command `pnpm build`, publish `dist/`.
- **Static host**: `pnpm build` and serve `dist/`.

Set env vars per your host. All `VITE_*` vars are baked into the client bundle.

## Adding what's excluded

Deliberately out of scope. pull one of these in when your project needs it:

- **Auth**: pick an auth provider (Auth0, Clerk, Supabase) and add its React SDK.
- **State manager**: for global state beyond React Query, add Zustand. 1 file for the store.
- **i18n**: `react-i18next` or `lingui`, wire in `AppProviders`.
- **Docker**: multi-stage Dockerfile. Node build stage, nginx serve stage, copy `dist/`.

## License

[MIT](../../LICENSE)
