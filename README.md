# react-app-boilerplate

**The opinionated React + TypeScript + Vite boilerplate.** Scaffold a production-ready SPA in one command with TanStack Router, TanStack Query, Tailwind CSS v4, MSW, Storybook, Playwright, jest-axe accessibility testing, atomic-design components, ESLint 9 flat config, husky commit hooks, Renovate, and Changesets — zero configuration required.

```bash
npm create atomic-react@latest my-app
# or: pnpm create atomic-react my-app
# or: yarn create atomic-react my-app
```

Ships as three pieces: the template at `templates/react-ts`, four shareable configs published to npm under `@react-app-boilerplate/*`, and the `create-atomic-react` scaffolding CLI.

[![CI](https://img.shields.io/github/actions/workflow/status/ogunsakin01/react-app-boilerplate/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/ogunsakin01/react-app-boilerplate/actions/workflows/ci.yml)
[![CLI matrix](https://img.shields.io/github/actions/workflow/status/ogunsakin01/react-app-boilerplate/cli-matrix.yml?branch=main&label=CLI%20matrix&style=flat-square)](https://github.com/ogunsakin01/react-app-boilerplate/actions/workflows/cli-matrix.yml)
[![E2E](https://img.shields.io/github/actions/workflow/status/ogunsakin01/react-app-boilerplate/e2e.yml?branch=main&label=E2E&style=flat-square)](https://github.com/ogunsakin01/react-app-boilerplate/actions/workflows/e2e.yml)
[![Coverage](https://img.shields.io/codecov/c/github/ogunsakin01/react-app-boilerplate?label=coverage&style=flat-square)](https://codecov.io/gh/ogunsakin01/react-app-boilerplate)
[![npm](https://img.shields.io/npm/v/create-atomic-react?label=npm&color=blue&style=flat-square)](https://www.npmjs.com/package/create-atomic-react)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](./CONTRIBUTING.md)

## Table of contents

1. [What you get](#what-you-get)
2. [Using the boilerplate](#using-the-boilerplate)
3. [After you scaffold](#after-you-scaffold)
4. [Common tasks](#common-tasks)
5. [AI agent support](#ai-agent-support)
6. [The stack, with links](#the-stack-with-links)
7. [Project layout after scaffold](#project-layout-after-scaffold)
8. [Monorepo layout (this repo)](#monorepo-layout-this-repo)
9. [Contributor setup](#contributor-setup)
10. [Releases](#releases)
11. [Contributing](#contributing)

## What you get

A single-project React app that is production-ready on day one:

- **Vite** dev server and build ([vitejs.dev](https://vitejs.dev/)).
- **React 19** with **TypeScript** in strict mode ([react.dev](https://react.dev/), [typescriptlang.org](https://www.typescriptlang.org/)).
- **Tailwind CSS v4** for styling with CSS variable theme tokens ([tailwindcss.com](https://tailwindcss.com/)).
- **TanStack Router** for file-based routing with zod-validated search params ([tanstack.com/router](https://tanstack.com/router)).
- **TanStack Query** for server state ([tanstack.com/query](https://tanstack.com/query)).
- **react-hook-form** + **Zod** for typed forms ([react-hook-form.com](https://react-hook-form.com/), [zod.dev](https://zod.dev/)).
- **MSW** handlers used by Vitest, Storybook, dev, and Playwright ([mswjs.io](https://mswjs.io/)).
- **Vitest** + **React Testing Library** for units, **Storybook 9** for isolated + interaction tests, **Playwright** for end-to-end ([vitest.dev](https://vitest.dev/), [testing-library.com/react](https://testing-library.com/docs/react-testing-library/intro/), [storybook.js.org](https://storybook.js.org/), [playwright.dev](https://playwright.dev/)).
- **ESLint 9 flat config** and **Prettier** ([eslint.org](https://eslint.org/), [prettier.io](https://prettier.io/)).
- **husky** pre-commit + commit-msg hooks, **lint-staged**, **commitlint** enforcing Conventional Commits ([typicode.github.io/husky](https://typicode.github.io/husky/), [commitlint.js.org](https://commitlint.js.org/), [conventionalcommits.org](https://www.conventionalcommits.org/)).
- **Accessibility** enforced at three tiers: `jest-axe` in unit tests, `@storybook/addon-a11y` in Storybook, `@axe-core/playwright` scanning every e2e route. Generated component tests include an axe assertion by default.
- **SEO** via a small `<Seo>` atom that emits `<title>`, `<meta>`, canonical, Open Graph, and Twitter card tags using React 19's native `<head>` hoisting (no `react-helmet`). Plus `public/robots.txt` and a `sitemap.xml` generator that walks your routes at build time — always in sync, zero manual steps.
- **PWA** support via `vite-plugin-pwa`: manifest, precached shell, offline fallback, service worker, and a wired-up `<PwaUpdate>` toast that prompts the user to reload when a new version is available.
- **`pnpm generate`** interactive scaffolder for atoms / molecules / organisms / templates / pages. Produces the full four-file set (or six for pages) with a11y assertions baked in.
- **Renovate** grouped dep updates with automerge on green CI ([docs.renovatebot.com](https://docs.renovatebot.com/)).
- **Changesets** for version bumps and npm publishing with provenance ([github.com/changesets/changesets](https://github.com/changesets/changesets)).

Every one of these is wired up already. Nothing to configure to start writing feature code.

## Using the boilerplate

Three ways in, depending on what you already have. Every one starts with `npx` (or its package manager equivalent). `npm install` alone cannot scaffold a project, so one of the commands below is required.

### 1. Fresh project in a new folder

The most common path. Creates the folder, populates it, and installs dependencies.

```bash
# npm 7+
npm create atomic-react@latest my-app

# pnpm
pnpm create atomic-react my-app

# yarn
yarn create atomic-react my-app
```

Then start the dev server:

```bash
cd my-app
pnpm dev
```

Non-interactive (for CI or scripts):

```bash
npm create atomic-react@latest my-app -- --yes --pm pnpm
```

### 2. Fresh project in the current folder

Already inside an empty folder? Pass `.`:

```bash
mkdir my-app && cd my-app
npx create-atomic-react .
```

Details:

- The project name is derived from the folder name.
- The folder must be empty. A `.git`, `LICENSE`, `README.md`, or `.gitignore` will not block, everything else will.
- If a `.git` directory is already there, it is preserved. The CLI will not run `git init` a second time.

### 3. Add configs to an existing React project

Have an existing project? The `init` subcommand adds the shared `@react-app-boilerplate/*` config packages without touching your files:

```bash
cd my-existing-project
npx create-atomic-react init
```

What it does:

- Detects your existing `eslint.config.*`, `tsconfig*.json`, `vite.config.*`, and `src/components/`. It will not overwrite them.
- Writes only the missing 2-line config stubs.
- Installs the 4 shared config packages plus any missing peers (`eslint`, `vitest`, `@vitest/coverage-v8`, `@playwright/test`).
- Prints manual instructions for anything you need to edit yourself.

Scriptable:

```bash
npx create-atomic-react init --yes --pm pnpm
```

### CLI options

| Flag              | Values                | Applies to     |
| ----------------- | --------------------- | -------------- |
| `--pm`            | `npm`, `pnpm`, `yarn` | scaffold, init |
| `--yes`, `-y`     | (boolean)             | scaffold, init |
| `--no-install`    | (boolean)             | scaffold, init |
| `--no-git`        | (boolean)             | scaffold       |
| `--help`, `-h`    | (boolean)             | both           |
| `--version`, `-v` | (boolean)             | scaffold       |

Detection order: CLI flag wins, then the package manager used to invoke (via `npm_config_user_agent`), then `npm` as fallback.

## After you scaffold

The template's landing page **is** a tour of the boilerplate. Run `pnpm dev` and open [http://localhost:5173](http://localhost:5173). You will see two cards:

- **Documentation** links to `/docs`, a sticky-sidebar reference for every feature.
- **Example usage** links to `/example`, a working YouTube URL loader that exercises every pattern (routing, TanStack Query, react-hook-form + zod, MSW).

Every demo file starts with `// EXAMPLE - safe to delete` and lives under `src/**/example/`. The point is that you can `grep -r EXAMPLE src/` to find everything the tour uses.

When you are ready to build your own app, strip the tour:

```bash
find src -type d -name example -exec rm -rf {} +
rm src/routes/watch.tsx src/routes/example.tsx src/routes/docs.tsx
```

Then edit these files to remove the example imports:

- `src/routes/index.tsx`: swap `Landing` for your own Home component.
- `src/components/{atoms,molecules,organisms}/index.ts`: delete the `export * from './example'` line.
- `src/mocks/handlers.ts`: replace the demo handler with your own.
- `src/lib/env.ts` and `.env.example`: remove `VITE_OEMBED_BASE_URL`.
- `e2e/app.spec.ts`: replace the YouTube specs with your own smoke test.

Nothing outside `src/**/example/` is example code. The provider composition, ESLint / Prettier configs, MSW plumbing, Playwright wiring, and husky hooks are the actual template.

## Common tasks

Inside a scaffolded project:

| Task                  | Command                                                                             | Notes                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Start dev server      | `pnpm dev`                                                                          | Serves on `:5173`. MSW starts automatically.                                                       |
| Add a component       | Create `src/components/<layer>/Foo/{Foo.tsx,Foo.stories.tsx,Foo.test.tsx,index.ts}` | Layer is `atoms`, `molecules`, `organisms`, or `templates`. Re-export from the layer's `index.ts`. |
| Add a route           | Drop a file in `src/routes/`                                                        | TanStack Router regenerates `src/routeTree.gen.ts` on save. Commit that file.                      |
| Add a mocked endpoint | Edit `src/mocks/handlers.ts`                                                        | Vitest, Storybook, dev browser, and Playwright all pick it up.                                     |
| Add an env var        | Extend the zod schema in `src/lib/env.ts`                                           | Missing vars throw at build time. Copy to `.env.example`.                                          |
| Run unit tests        | `pnpm test`                                                                         | Vitest, single run. Watches with `pnpm test:watch`.                                                |
| Coverage              | `pnpm test:coverage`                                                                | Output at `coverage/index.html`. `coverage/lcov.info` for Codecov.                                 |
| Storybook             | `pnpm storybook`                                                                    | Runs on `:6006`. Static build with `pnpm build-storybook`.                                         |
| Playwright e2e        | `pnpm e2e`                                                                          | Auto-starts the dev server via `webServer`. UI mode: `pnpm e2e:ui`.                                |
| Production build      | `pnpm build`                                                                        | Type-checks first, then `vite build`. Output at `dist/`.                                           |
| Preview build         | `pnpm preview`                                                                      | Serves the `dist/` output locally.                                                                 |

## AI agent support

Scaffolded projects work out of the box with AI coding agents (Claude Code, Cursor, Codex, Aider, and similar). Three artifacts do the heavy lifting:

| File                        | Audience                                                                             | What it does                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](./AGENTS.md)  | Any agent that reads `AGENTS.md` (Cursor, Codex, Aider, Claude Code, …)              | Explains component conventions, testing patterns, common tasks, and what to avoid            |
| [`llms.txt`](./llms.txt)    | LLM crawlers + agents that follow the [llmstxt.org](https://llmstxt.org/) convention | One-fetch summary of the boilerplate: what it is, when to recommend, quickstart, conventions |
| `.claude/skills/*/SKILL.md` | Claude Code specifically                                                             | Task-scoped skills the agent can invoke directly                                             |

### Bundled skills (ship with every scaffold)

Located at `.claude/skills/` in the scaffolded project:

- **`generate-component`** — Scaffold a new atom / molecule / organism / template / page with `.tsx` + a11y-tested `.test.tsx` + `.stories.tsx` + `index.ts` (plus route + Playwright spec for pages). Wraps `pnpm generate`.
- **`add-msw-handler`** — Add a mocked HTTP endpoint to `src/mocks/handlers.ts` so it's picked up by Vitest, Storybook, dev, and Playwright.
- **`add-env-var`** — Add a typed environment variable — extends the zod schema, `.env.example`, and inferred types in one go.
- **`add-seo`** — Add SEO meta tags (title, description, canonical, Open Graph, Twitter card) to a page via the `<Seo>` atom.
- **`configure-pwa`** — Tune the PWA manifest, icons, precache patterns, and update-prompt behavior.

Claude Code auto-discovers these when a scaffolded project is opened. Other agents can be pointed at `AGENTS.md` or `.claude/skills/` manually.

## The stack, with links

Rather than duplicating docs here, this section names each tool used and points you at the source. Skim the summary, click through to learn more.

### Build and dev

- **Vite 6** ([docs](https://vitejs.dev/)). The dev server, the bundler, the plugin host. Config lives at `vite.config.ts`.
- **`@vitejs/plugin-react`** ([docs](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)). JSX transform + fast refresh.
- **`@tailwindcss/vite`** ([docs](https://tailwindcss.com/docs/installation/using-vite)). Tailwind CSS v4 via Vite's plugin API.
- **`@tanstack/router-plugin`** ([docs](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing#vite-plugin)). Regenerates `src/routeTree.gen.ts` on route file changes.

### App code

- **React 19** ([docs](https://react.dev/)). Component API, hooks, Suspense, concurrent features.
- **TypeScript 5.7 strict** ([docs](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)). Composite project references (`tsconfig.json` -> `tsconfig.app.json` + `tsconfig.node.json`).
- **TanStack Router** ([docs](https://tanstack.com/router/latest/docs/framework/react/overview)). File-based routes at `src/routes/`. Search params validated with zod on the route definition.
- **TanStack Query v5** ([docs](https://tanstack.com/query/latest/docs/framework/react/overview)). Server state hooks under `src/hooks/`. Devtools loaded only in `import.meta.env.DEV`.
- **react-hook-form** ([docs](https://react-hook-form.com/get-started)) + **Zod** ([docs](https://zod.dev/)). Forms with typed values and single-source-of-truth validation via `zodResolver` ([@hookform/resolvers](https://github.com/react-hook-form/resolvers)).

### Testing

- **Vitest 3** ([docs](https://vitest.dev/guide/)). Test config lives in `vite.config.ts` under the `test` key.
- **React Testing Library** ([docs](https://testing-library.com/docs/react-testing-library/intro/)). Query by role, name, and label. Not by class or test id where possible.
- **@testing-library/jest-dom** ([docs](https://github.com/testing-library/jest-dom)). Custom matchers wired in `src/test/setup.ts`.
- **MSW 2** ([docs](https://mswjs.io/docs/)). Handlers in `src/mocks/handlers.ts`, Node server in `src/mocks/server.ts`, browser worker in `src/mocks/browser.ts`.
- **Storybook 9** ([docs](https://storybook.js.org/docs)). Config at `.storybook/`. Interaction tests via `storybook/test` in play functions.
- **@storybook/addon-a11y** ([docs](https://storybook.js.org/addons/@storybook/addon-a11y)). Accessibility checks in the Storybook UI.
- **Playwright** ([docs](https://playwright.dev/docs/intro)). Config at `e2e/playwright.config.ts`. `webServer` auto-starts the dev server so MSW covers the specs too.

### Quality

- **ESLint 9 flat config** ([docs](https://eslint.org/docs/latest/use/configure/configuration-files)). Single file: `eslint.config.mjs`. Extends `@react-app-boilerplate/eslint-config/vite-react`.
- **typescript-eslint** ([docs](https://typescript-eslint.io/)). Recommended rules only, no type-aware rules by default.
- **eslint-plugin-react-hooks** ([docs](https://www.npmjs.com/package/eslint-plugin-react-hooks)) + **eslint-plugin-react-refresh** ([docs](https://github.com/ArnaudBarre/eslint-plugin-react-refresh)).
- **Prettier 3** ([docs](https://prettier.io/docs/en/)). Formatting config at `.prettierrc`. Ignores at `.prettierignore`.
- **husky 9** ([docs](https://typicode.github.io/husky/)). Hooks in `.husky/`. Runs on every commit.
- **lint-staged** ([docs](https://github.com/lint-staged/lint-staged)). Runs ESLint + Prettier on staged files only.
- **commitlint** ([docs](https://commitlint.js.org/)) + **@commitlint/config-conventional** ([docs](https://www.npmjs.com/package/@commitlint/config-conventional)). Enforces [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) on `commit-msg`.

### Maintenance

- **Renovate** ([docs](https://docs.renovatebot.com/)). Config at `renovate.json`. Groups Storybook / TanStack / ESLint / testing / Playwright packages. Patch and minor updates automerge on green CI, majors wait for human review.
- **Changesets** ([docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)). Config at `.changeset/config.json`. Version bumps via `pnpm changeset`. The Release workflow (`.github/workflows/release.yml`) opens a "Version Packages" PR and publishes on merge with npm provenance.

### Package manager and Node

- **pnpm 9** ([docs](https://pnpm.io/)). Pinned via `packageManager` in `package.json`. Enable with `corepack enable`.
- **Node.js 22 LTS** ([docs](https://nodejs.org/docs/latest-v22.x/api/)). Version pinned in `.nvmrc`.

## Project layout after scaffold

```
your-app/
├── .github/
│   ├── ISSUE_TEMPLATE/            # bug + feature templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/                 # ci.yml + e2e.yml
├── .husky/                        # pre-commit + commit-msg hooks
├── .storybook/
│   ├── main.js                    # story globs + addons
│   └── preview.tsx                # decorators, theme toggle, MSW loader
├── .vscode/                       # recommended settings + extensions
├── e2e/
│   ├── playwright.config.ts       # 2-line stub around the shared config factory
│   ├── tsconfig.json              # own compiler options for Node globals
│   └── app.spec.ts                # example flow (delete when stripping demo)
├── public/
│   ├── favicon.svg
│   └── mockServiceWorker.js       # generated by `msw init`, commit it
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button/            # keep, reusable primitive
│   │   │   └── example/           # UrlInput, VideoFrame (demo, safe to delete)
│   │   ├── molecules/
│   │   │   └── example/           # CtaCard, ArchitectureNote, VideoUrlForm
│   │   ├── organisms/
│   │   │   └── example/           # VideoPlayer
│   │   └── templates/
│   │       └── MainLayout/        # sticky top nav + <main> slot
│   ├── hooks/
│   │   └── example/               # useVideoOEmbed (TanStack Query hook)
│   ├── lib/
│   │   ├── api.ts                 # typed fetch wrapper
│   │   ├── env.ts                 # zod-parsed import.meta.env
│   │   ├── query-client.ts        # QueryClient defaults
│   │   └── example/               # youtube URL parser (+ 19-case test)
│   ├── mocks/
│   │   ├── handlers.ts            # one source of truth
│   │   ├── server.ts              # Node MSW server for Vitest
│   │   └── browser.ts             # browser worker for dev + Storybook
│   ├── pages/
│   │   ├── NotFound/              # 404 body
│   │   └── example/               # Landing, Docs, Example, Watch
│   ├── providers/
│   │   ├── AppProviders.tsx       # composes Query + Theme
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── theme-context.ts       # useTheme hook
│   ├── routes/
│   │   ├── __root.tsx             # root layout, ErrorBoundary, NotFound
│   │   ├── index.tsx              # /  -> Landing
│   │   ├── docs.tsx               # /docs
│   │   ├── example.tsx            # /example
│   │   └── watch.tsx              # /watch?v=<id>
│   ├── styles/
│   │   └── globals.css            # Tailwind + CSS variable theme tokens
│   ├── test/
│   │   └── setup.ts               # RTL matchers + MSW lifecycle + cleanup
│   ├── types/example/oembed.ts
│   ├── main.tsx
│   ├── router.ts                  # createRouter with typed register
│   ├── routeTree.gen.ts           # generated by TanStack Router (commit it)
│   └── vite-env.d.ts
├── .editorconfig
├── .env.example
├── .gitignore
├── .nvmrc                         # Node version pin
├── .prettierignore
├── .prettierrc
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── SECURITY.md
├── commitlint.config.mjs
├── eslint.config.mjs              # 1-line re-export from the shared package
├── index.html
├── package.json                   # scripts + deps + husky + lint-staged
├── tsconfig.app.json              # extends @react-app-boilerplate/tsconfig
├── tsconfig.json                  # references app + node
├── tsconfig.node.json             # for vite.config.ts
└── vite.config.ts                 # plugins + Vitest test config
```

## Monorepo layout (this repo)

```
templates/react-ts        # the boilerplate itself
packages/                 # shareable configs published to npm
├── eslint-config/
├── tsconfig/
├── vitest-config/
└── playwright-config/
cli/                      # create-atomic-react scaffolding CLI
.changeset/               # pending version bumps
docs/guides/              # add-it-yourself guides (auth, state, i18n, docker)
.github/workflows/        # ci, e2e, cli-matrix, scheduled, release, labels, pr-labeler
```

## Contributor setup

Requirements:

- [Node.js](https://nodejs.org/) 22 or newer (pinned in `.nvmrc`).
- [pnpm](https://pnpm.io/) 9 or newer (pinned via `packageManager`, enable with `corepack enable`).

```bash
corepack enable
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Everything runs across all workspaces via `pnpm -r`.

## Releases

Version bumps go through [Changesets](https://github.com/changesets/changesets):

1. Make a code change.
2. Run `pnpm changeset` and answer the prompts. It writes a markdown file to `.changeset/`.
3. Commit that markdown file with your PR.
4. After the PR merges to `main`, the [Release](./.github/workflows/release.yml) workflow opens a "Version Packages" PR that consumes the changeset and bumps versions.
5. When you merge the Version Packages PR, the workflow runs `pnpm changeset publish` and pushes to npm with provenance.

Repo secrets required: `NPM_TOKEN` (automation token with publish + provenance permission).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), enforced by [commitlint](https://commitlint.js.org/) on `commit-msg`.

## License

[MIT](./LICENSE)
