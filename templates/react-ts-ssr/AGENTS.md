# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Codex, Aider, and similar) working in this project. It was scaffolded with [`create-atomic-react --ssr`](https://www.npmjs.com/package/create-atomic-react) (SSR variant): React 19 + TypeScript + Vite, [Vike](https://vike.dev/) with every route prerendered to static HTML, TanStack Query, Tailwind CSS v4, MSW, Storybook, Vitest + jest-axe, Playwright and Sentry.

This variant does **not** use TanStack Router and has no PWA. Never import `@tanstack/react-router` or `virtual:pwa-register` - they aren't installed.

Commands below use `pnpm`. If the project was scaffolded with npm or yarn, substitute it - `create-atomic-react` already adapted the git hooks, CI workflows, the Playwright web server and `netlify.toml`.

## Component conventions

Every component lives at `src/components/{atoms,molecules,organisms,templates}/<Name>/` and ships four files:

```
<Name>.tsx           the component
<Name>.test.tsx      Vitest + RTL, MUST include an axe assertion
<Name>.stories.tsx   Storybook story with autodocs tag
index.ts             barrel: export { <Name> } + export type { <Name>Props }
```

Page components live at `src/pages/<Name>/` and additionally ship:

```
e2e/<Name>.spec.ts         Playwright spec with axe scan
pages/<slug>/+Page.tsx     Vike page that renders the page component
pages/<slug>/+title.ts     prerendered <title>
```

**Never hand-scaffold.** Use the generator:

```bash
pnpm generate                              # interactive
pnpm generate --kind atom --name Badge     # non-interactive
pnpm generate --kind page --name Dashboard
```

The generator writes all files with an axe assertion in the test template so accessibility never regresses. It does not check for collisions with existing pages - pick a page name that isn't already a route. Add `+description.ts` (and `+Head.tsx` if needed) to the new `pages/<slug>/` yourself.

## Routing and rendering (Vike)

- Filesystem routing: `pages/<slug>/+Page.tsx` is the route `/<slug>`; `pages/index/+Page.tsx` is `/`. Keep `+Page.tsx` thin - it renders a component from `src/pages/`.
- `pages/+config.ts` sets `prerender: true`, so every page is rendered to `.html` at build time. There is no Node server in production. Set `prerender: false` on a page's own `+config.ts` only if you add a server to run it.
- Global wiring: `pages/+Wrapper.tsx` wraps every page in `AppProviders` + `MainLayout`; `pages/+client.ts` initialises Sentry and starts MSW in dev; `pages/+Head.tsx` holds site-wide head tags; `pages/_error/+Page.tsx` renders the error page (currently always `NotFound`; branch on `usePageContext().is404` to show a real error state).
- Links: plain `<a href="/docs">` - Vike intercepts them for client-side navigation. Navigate in code with `navigate()` from `vike/client/router`.
- Current URL: `usePageContext()` from `vike-react/usePageContext` (`urlPathname`, `urlParsed.search`).
- Query-string values are empty when the HTML is prerendered, so reading `urlParsed.search` during render causes a hydration mismatch on direct loads. Read per-visit values in an effect.
- Anything that touches `window`, `document` or `localStorage` must run in an effect or event handler - components also render at build time in Node.

## SEO and page metadata

Metadata is baked into the prerendered HTML, so link-preview bots and crawlers see it without running JavaScript.

- `pages/<slug>/+title.ts` - `export const title = '…'`
- `pages/<slug>/+description.ts` - `export const description = '…'`
- `pages/<slug>/+Head.tsx` - extra tags for that page (`og:*`, `twitter:*`, canonical). See `pages/index/+Head.tsx`.

Do NOT install `react-helmet-async`, and don't render `<title>` / `<meta>` from components.

## Testing patterns

- Unit tests: import `axe` from `jest-axe`, assert `expect(await axe(container)).toHaveNoViolations()`. The matcher is registered globally in `src/test/setup.ts` and typed in `src/test/a11y.d.ts`.
- To test a component that uses Vike hooks, mock them at the top of the file (see `MainLayout.test.tsx` and `Watch.test.tsx`):

  ```ts
  vi.mock('vike-react/usePageContext', () => ({
    usePageContext: () => ({ urlPathname: '/', urlParsed: { search: {} } }),
  }));
  vi.mock('vike/client/router', () => ({ navigate: vi.fn() }));
  ```

  Storybook stubs the same modules in `.storybook/stubs/`.

- E2E: use `AxeBuilder` from `@axe-core/playwright` with the standard WCAG tag set - see `e2e/a11y.spec.ts` for the loop pattern. Wait for hydration before interacting - `await page.waitForLoadState('networkidle')`, as in `e2e/app.spec.ts`.
- MSW handlers in `src/mocks/handlers.ts` are the single source of truth for Vitest, Storybook, dev, and Playwright. MSW only starts in dev (`pages/+client.ts`), never during prerender.

## Where things live

- Providers: `src/providers/` - wrapper providers get unit tests, no stories (a wrapper story teaches nothing).
- Context modules like `theme-context.ts`: exercised through the provider that consumes them, no standalone test.
- Data fetching: TanStack Query, client in `src/lib/query-client.ts`; HTTP helper in `src/lib/api.ts`. Queries run in the browser after hydration, not at prerender time.
- Env parsing: `src/lib/env.ts` - extend the zod schema, copy the new var into `.env.example`, **and** add an explicit `VITE_X: import.meta.env.VITE_X` line to the object passed to `parseEnv`. Vike replaces bare `import.meta.env` with `null`, so spreading it doesn't work. Only `VITE_*` vars reach the browser; never put secrets in them.
- The docs page at `/docs` uses `?raw` imports so its code snippets are always in sync with the actual source. Follow the same pattern if you extend it.
- Sitemap: `scripts/generate-sitemap.mjs` runs as part of `pnpm build` and writes `sitemap.xml` derived from `pages/`. Set `VITE_SITE_URL` in the shell environment for the build, otherwise URLs default to `https://example.com`. Folders starting with `_` are skipped. Robots at `public/robots.txt`.
- Sentry: init helper at `src/lib/sentry.ts`, called from `pages/+client.ts`. No-op unless `VITE_SENTRY_DSN` is set, and always inert in dev (`enabled: !import.meta.env.DEV`). To capture render errors, import `Sentry` from `@/lib/sentry` and call `Sentry.captureException(error)` from `pages/_error/+Page.tsx`.
- Build output: `pnpm build` writes the static site to `dist/client/` (one `.html` per route).
- Deploy: `pnpm deploy` uploads `dist/client/` with `aws s3 sync` - needs the AWS CLI on PATH. Hashed files under `assets/` get `max-age=31536000,immutable` and are uploaded first; everything else (HTML at every depth, `robots.txt`, `sitemap.xml`, favicon, service workers) gets `max-age=0,must-revalidate`. Old assets are kept so open tabs can still lazy-load their chunks - pass `--prune-assets` to delete them. `--cloudfront-id` invalidates `/*`. For S3-compatible providers, pass `--endpoint <url>` or set `DEPLOY_ENDPOINT`. Netlify (`netlify.toml`) and Vercel (`vercel.json`) configs are included.
- Shared configs: ESLint, tsconfig, Vitest and Playwright extend the `@react-app-boilerplate/*` packages. Override locally in the project's own config files rather than forking the packages.
- Task skills for Claude Code: `.claude/skills/`. Where a skill disagrees with this file, follow this file.

## Demo code

Every example file starts with `// EXAMPLE - safe to delete` and lives under `src/**/example/` (plus the `docs`, `example` and `watch` pages). Run `pnpm strip-example` (preview with `--dry-run`) to remove it all before building the real app. Don't model new features on the demo's file layout - use the generator.

## Commit + PR style

- Conventional Commits enforced by commitlint on `commit-msg`. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- Keep subject lines short (under ~70 chars). Put detail in the body.
- Do not skip hooks (`--no-verify`) - the pre-commit runs lint-staged (ESLint + Prettier) on staged files only.

## Common tasks

| Task                      | Command              |
| ------------------------- | -------------------- |
| Dev (Vite + Storybook)    | `pnpm dev`           |
| Just the app              | `pnpm dev:app`       |
| Just Storybook            | `pnpm storybook`     |
| Unit tests                | `pnpm test`          |
| Coverage                  | `pnpm test:coverage` |
| E2E                       | `pnpm e2e`           |
| Generate a component/page | `pnpm generate`      |
| Remove the demo code      | `pnpm strip-example` |
| Lint                      | `pnpm lint`          |
| Type check                | `pnpm typecheck`     |
| Build (prerender)         | `pnpm build`         |
| Preview the build         | `pnpm preview`       |
| Deploy to S3-compatible   | `pnpm deploy`        |

## What to avoid

- Importing `@tanstack/react-router`, `<Link>`, or the SPA's `Seo` / `PwaUpdate` components - they don't exist in this variant
- Touching `window` / `document` / `localStorage` during render
- Hand-scaffolding components without the four-file set
- Skipping the axe assertion in generated tests
- Installing `react-helmet-async` - use `+title` / `+description` / `+Head`
- Committing `.env` files (only `.env.example` is committed)
- Adding a comment that explains WHAT code does - only WHY, when non-obvious
