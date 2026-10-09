# create-atomic-react

## 0.2.0

### Minor Changes

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`85833fc`](https://github.com/ogunsakin01/react-app-boilerplate/commit/85833fce7d69464d82a53f7c9a8c468fa9ddedfb) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - CLI robustness fixes:

  - `--pm npm` / `--pm yarn` now rewrite the husky hooks, CI workflows, Playwright web server and `netlify.toml`, which all called `pnpm` and failed on the first commit or CI run.
  - Works on Windows (package managers are spawned through a shell).
  - A missing `git` or a failed install no longer aborts: the project is kept, the remaining steps are printed, and the exit code is 1.
  - A failed copy removes the half-created folder so you can rerun.
  - Scaffolding into `.` keeps existing files (README.md, `.vscode/`, ...) instead of overwriting them.
  - Unknown flags (e.g. a typo like `--react-area`) are an error instead of being ignored; invalid `--pm` values no longer print a stack trace.
  - Package names are derived from the folder (`My App` → `my-app`) instead of rejected; paths like `apps/web` work.
  - `msw.workerDirectory` is kept, so `mockServiceWorker.js` updates when msw is upgraded.
  - `--mui` / `--react-aria` atoms export their `Props` type and are added to `atoms/index.ts`.
  - `init` no longer copies an unstyled Button without its test and story, installs `vite`, `@vitejs/plugin-react` and `jsdom` when its stubs need them, writes a Vitest stub that doesn't require a missing setup file, and detects more existing config file names.
  - `--version` reads the real package version; the published package contains only git-tracked template files.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`0f2bfe7`](https://github.com/ogunsakin01/react-app-boilerplate/commit/0f2bfe7c13db89ca063deaad160debdcd0b71a7d) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - Scaffolded projects now ship a variant-specific `AGENTS.md` (plus a `CLAUDE.md` that imports it), so Cursor, Codex, Claude Code and other agents pick up the project's conventions - routing, SEO, testing mocks, env handling and deploy - for the SPA or SSR variant. `--mui` and `--react-aria` append a section describing their wrapper atoms.

### Patch Changes

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`3734058`](https://github.com/ogunsakin01/react-app-boilerplate/commit/3734058e8220b42c402ab6a2e9bd9d5c5c76686a) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - `pnpm deploy` now caches only Vite's hashed `assets/` as immutable; every other file (HTML at any depth, favicon, robots.txt, sitemap, service workers, Vike page data) revalidates. Old assets are kept so open tabs can still lazy-load chunks (`--prune-assets` removes them), CloudFront invalidates `/*`, and the SSR variant deploys `dist/client` by default instead of the wrong `dist` folder.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`8389d52`](https://github.com/ogunsakin01/react-app-boilerplate/commit/8389d52cde228f8f70c004357c8806b68cd5592b) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - `pnpm generate` refuses to overwrite existing routes/pages, honours `--dir` in route imports, no longer nests a second `<main>`, and (SPA) regenerates `routeTree.gen.ts` so a new page type-checks immediately; `typecheck`/`build` regenerate it too. SSR pages also get a `+description.ts`. `strip-example` (both variants) now rewrites the MainLayout test and a11y spec, is idempotent, never replaces an edited Home page, and writes Prettier-clean files.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`85b347e`](https://github.com/ogunsakin01/react-app-boilerplate/commit/85b347e6802512d71091ed4aca5a6ee138a1396e) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - Rewrite the npm README (variant picker, add-ons, comparison with create-vite / create-next-app, absolute links that work on npmjs.com) and update the package description and keywords to cover the SSR variant, add-ons and AI-agent support.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`08da768`](https://github.com/ogunsakin01/react-app-boilerplate/commit/08da76815772246ecdf920182c583e498bc0be31) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - Published packages now include the MIT LICENSE file.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`ca383eb`](https://github.com/ogunsakin01/react-app-boilerplate/commit/ca383ebe7a68074b64d3bba9bf0fc77229deaf58) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - SPA: the root route's error component accepts the router's `ErrorComponentProps` and narrows `error` from `unknown`, so new projects type-check with current `@tanstack/react-router` releases (1.170.41+ type thrown errors as `unknown`).

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`a726da7`](https://github.com/ogunsakin01/react-app-boilerplate/commit/a726da752e0baf8740e37a9cbda79c224a988dd7) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - Scaffolded projects now get a `.gitignore`. npm strips `.gitignore` from published tarballs, so the template now ships it as `_gitignore` and the CLI renames it on copy (merging into an existing `.gitignore` when scaffolding into `.`). The template ignore list also covers `.env*` (except `.env.example`), `coverage`, logs and `.DS_Store`.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`d53d0b5`](https://github.com/ogunsakin01/react-app-boilerplate/commit/d53d0b51e626e871c700875d15366c661a0a4585) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - Host configs (Netlify, Vercel, Cloudflare Pages) send baseline security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`). SPA PWA: `mockServiceWorker.js` is no longer precached, a CDN `VITE_BASE_URL` keeps the app and service worker same-origin and points only JS/CSS at the CDN, and a sub-path base moves the manifest scope, icons and offline fallback with it. Storybook a11y violations show as errors instead of todos.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`4d78a87`](https://github.com/ogunsakin01/react-app-boilerplate/commit/4d78a8776da61adbe3b83f2cfe330d603681b6cc) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - SPA: every page renders `<Seo>` with `siteName` from `VITE_APP_TITLE` (NotFound is `noindex`), and `index.html` ships default description / Open Graph tags for link-preview bots that don't run JavaScript; `<Seo>` removes them once per-page tags render. SSR: page titles use `VITE_APP_TITLE` instead of a hardcoded name.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`b31f4c5`](https://github.com/ogunsakin01/react-app-boilerplate/commit/b31f4c538ee1fde549a956da692969e89574d15b) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - Sitemap generation reads `VITE_SITE_URL` from `.env` / `.env.production` (not only the shell) and warns when it falls back to example.com, rewrites the `robots.txt` `Sitemap:` line to an absolute URL, follows TanStack Router's file-routing rules (nested folders, `.` nesting, `_pathless`, `(group)`, `-ignored`, `route.tsx`) in the SPA, and skips Vike `@param` folders in SSR. `VITE_SITE_URL` is now in `.env.example`.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`f4965c2`](https://github.com/ogunsakin01/react-app-boilerplate/commit/f4965c2f10c5e3eb2897fa2284bf5b3d0453344d) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - SSR: `/watch?v=…` no longer hydrates with a mismatch (React [#418](https://github.com/ogunsakin01/react-app-boilerplate/issues/418)) on direct loads. A new `e2e/prerender.spec.ts` checks the built, prerendered HTML through `vite preview` (titles, descriptions, OG tags, the 404 page) and fails on hydration errors, which the dev-server-only e2e never exercised. `strip-example` trims it, and `--pm npm|yarn` rewrites its server command.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`66b893e`](https://github.com/ogunsakin01/react-app-boilerplate/commit/66b893e15b5e2a0097847b2dbdb44fa331d88194) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - The SSR template's Claude Code skills now describe the Vike variant (`+title` / `+description` / `+image` / `+Head` for SEO, `pages/+client.ts`, the `_error` page for Sentry, per-key env reads, `dist/client` deploys) instead of the SPA. The SPA-only `configure-pwa` skill is no longer shipped with `--ssr`. Both `add-env-var` skills now warn that `z.coerce.boolean()` parses `"false"` as `true`.

- [#3](https://github.com/ogunsakin01/react-app-boilerplate/pull/3) [`ff1a7cd`](https://github.com/ogunsakin01/react-app-boilerplate/commit/ff1a7cd9509a0d74ccfba7dc51265037bc78053d) Thanks [@ogunsakin01](https://github.com/ogunsakin01)! - Theme choice is saved and defaults to the system light/dark preference, with an inline boot script so neither variant flashes the wrong theme (SSR hydration still matches). Empty env values copied from `.env.example` (`KEY=""`) now fall back to schema defaults instead of overriding them. Queries no longer retry 4xx `ApiError`s.
