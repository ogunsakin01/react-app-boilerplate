# create-atomic-react

**Create a production-ready React 19 + TypeScript + Vite app in one command** - as a client-side SPA, or with every page prerendered to static HTML for SEO and link previews. Routing, data fetching, forms, mocks, Storybook, unit + e2e tests and accessibility checks are already wired, and the project ships an `AGENTS.md` so AI coding agents follow its conventions from the first prompt.

```bash
npm create atomic-react@latest my-app
```

[![npm](https://img.shields.io/npm/v/create-atomic-react?style=flat-square)](https://www.npmjs.com/package/create-atomic-react)
[![CLI matrix](https://img.shields.io/github/actions/workflow/status/ogunsakin01/react-app-boilerplate/cli-matrix.yml?branch=main&label=npm%20%C2%B7%20pnpm%20%C2%B7%20yarn&style=flat-square)](https://github.com/ogunsakin01/react-app-boilerplate/actions/workflows/cli-matrix.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](https://github.com/ogunsakin01/react-app-boilerplate/blob/main/LICENSE)

## Quick start

```bash
# SPA (default): TanStack Router, PWA, renders in the browser
npm create atomic-react@latest my-app

# SSR: Vike, every route prerendered to HTML - crawlers and link previews see real <head> tags
npm create atomic-react@latest my-app -- --ssr

# pnpm / yarn
pnpm create atomic-react my-app
yarn create atomic-react my-app
```

Then:

```bash
cd my-app
pnpm dev        # Vite on :5173 + Storybook on :6006
```

Requires Node 22.13+.

## Which variant?

|                             | SPA (default)                                   | SSR (`--ssr`)                                           |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Rendering                   | in the browser                                  | prerendered to static HTML at build time, then hydrated |
| Router                      | [TanStack Router](https://tanstack.com/router)  | [Vike](https://vike.dev/)                               |
| Link previews (X, Slack, …) | no - bots see an empty shell                    | yes - tags are in the HTML                              |
| PWA / offline               | yes                                             | no                                                      |
| Server needed               | no - any static host                            | no - any static host                                    |
| Best for                    | apps behind a login, dashboards, internal tools | marketing sites, blogs, docs, anything shared on social |

Need rendering per request, React Server Components or server actions? Use Next.js, React Router (framework mode) or TanStack Start instead.

## What you get

Both variants:

- **React 19 + TypeScript strict + Vite 6**
- **TanStack Query** for server state, **react-hook-form + Zod** for typed forms
- **Tailwind CSS v4** with CSS-variable theme tokens and dark mode
- **Atomic design** - `atoms / molecules / organisms / templates / pages`, and a generator (`pnpm generate`) that writes every component as four files: component, test, story, barrel
- **Accessibility tested at three layers** - `jest-axe` in every unit test, the Storybook a11y addon, and `@axe-core/playwright` on every e2e route
- **MSW** - one `handlers.ts` mocks your API for Vitest, Storybook, dev and Playwright
- **Vitest + React Testing Library**, **Storybook 9**, **Playwright**
- **SEO** - page titles, descriptions, Open Graph tags, `robots.txt` and a sitemap generated from your routes
- **Sentry**, opt-in via one env var
- **Deploy configs** for Vercel, Netlify and Cloudflare Pages, plus a script for S3 / R2 / Spaces / MinIO
- **ESLint 9 flat config, Prettier, husky, lint-staged, commitlint**, and GitHub Actions CI
- **AI-agent ready** - `AGENTS.md` written for your variant, a `CLAUDE.md` that imports it, and Claude Code skills in `.claude/skills/` for common tasks
- **Demo app** you can delete in one command: `pnpm strip-example`

## Add-ons

```bash
npm create atomic-react@latest my-app -- --mui          # Material UI + emotion, MuiButton wrapper atom
npm create atomic-react@latest my-app -- --react-aria   # React Aria Components, AriaButton wrapper atom
npm create atomic-react@latest my-app -- --ssr --mui --react-aria
```

Each add-on installs the library, adds an example atom (with test, story and barrel), and records how to use it in the project's `AGENTS.md`. Without `--yes`, the CLI asks about both interactively.

## Compared with

|                     | create-atomic-react                      | `create-vite` (react-ts) | `create-next-app`    |
| ------------------- | ---------------------------------------- | ------------------------ | -------------------- |
| Output              | static files (SPA or prerendered)        | static files (SPA)       | Next.js app (server) |
| Router, data, forms | included                                 | bring your own           | Next.js router       |
| Tests + a11y checks | unit, Storybook, e2e, axe at every layer | none                     | none by default      |
| API mocking         | MSW, shared across all test layers       | none                     | none                 |
| Component structure | enforced (atomic design + generator)     | none                     | none                 |

Pick `create-vite` if you want a blank slate, Next.js if you need a server. Pick this if you want a static React app with the decisions already made and tested.

## Non-interactive (CI, scripts, agents)

```bash
npm create atomic-react@latest my-app -- --yes --pm pnpm
npm create atomic-react@latest my-app -- --yes --pm pnpm --ssr --no-git
```

## Options

| Flag              | Values                | Default                  |
| ----------------- | --------------------- | ------------------------ |
| `--ssr`           | -                     | off (SPA template)       |
| `--mui`           | -                     | off; prompts if omitted  |
| `--react-aria`    | -                     | off; prompts if omitted  |
| `--pm`            | `npm`, `pnpm`, `yarn` | detected from invocation |
| `--yes`, `-y`     | -                     | prompts if omitted       |
| `--no-install`    | -                     | installs by default      |
| `--no-git`        | -                     | inits git by default     |
| `--help`, `-h`    | -                     | -                        |
| `--version`, `-v` | -                     | -                        |

Pass `.` as the project name to scaffold into the current (empty) folder.

## `init`: add the shared configs to an existing project

```bash
cd my-existing-app
npx create-atomic-react init --yes
```

Adds the `@react-app-boilerplate/*` ESLint, tsconfig, Vitest and Playwright config packages without overwriting your files. It detects what you already have and only writes missing two-line config stubs.

## Links

- Source, issues and docs: [github.com/ogunsakin01/react-app-boilerplate](https://github.com/ogunsakin01/react-app-boilerplate)
- FAQ and design decisions: [docs/FAQ.md](https://github.com/ogunsakin01/react-app-boilerplate/blob/main/docs/FAQ.md)
- Guides for auth, i18n, state and Docker: [docs/guides](https://github.com/ogunsakin01/react-app-boilerplate/tree/main/docs/guides)
- SPA template: [templates/react-ts](https://github.com/ogunsakin01/react-app-boilerplate/tree/main/templates/react-ts) · SSR template: [templates/react-ts-ssr](https://github.com/ogunsakin01/react-app-boilerplate/tree/main/templates/react-ts-ssr)

MIT © Damilola Ogunsakin
