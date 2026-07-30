# create-atomic-react

Scaffold a new project from the [react-app-boilerplate](../../) template.

## Usage

```bash
# SPA (default): TanStack Router, PWA, everything client-side
npm create atomic-react@latest my-app
# or: pnpm create atomic-react my-app
# or: yarn create atomic-react my-app

# SSR: Vike + prerender per route -> social crawlers see real <head> meta
npm create atomic-react@latest my-app -- --ssr

# Add Material UI or React Aria as extra libraries (opt-in)
npm create atomic-react@latest my-app -- --mui
npm create atomic-react@latest my-app -- --react-aria
npm create atomic-react@latest my-app -- --ssr --mui --react-aria
```

Without `--yes`, the CLI also prompts interactively for MUI and React Aria after picking the template.

## Non-interactive (scriptable)

```bash
npm create atomic-react@latest my-app -- --yes --pm pnpm
npm create atomic-react@latest my-app -- --yes --pm pnpm --ssr
npm create atomic-react@latest my-app -- --yes --pm pnpm --mui --react-aria
```

## Options

| Flag              | Values                | Default                  |
| ----------------- | --------------------- | ------------------------ |
| `--ssr`           | .                     | off (SPA template)       |
| `--mui`           | .                     | off; prompts if omitted  |
| `--react-aria`    | .                     | off; prompts if omitted  |
| `--pm`            | `npm`, `pnpm`, `yarn` | detected from invocation |
| `--yes`, `-y`     | .                     | prompts if omitted       |
| `--no-install`    | .                     | installs by default      |
| `--no-git`        | .                     | inits git by default     |
| `--help`, `-h`    | .                     | .                        |
| `--version`, `-v` | .                     | .                        |

## `init`. add to an existing project

Adds the shared `@react-app-boilerplate/*` config packages to an existing project without clobbering your files. Detects what you already have and only writes missing 2-line config stubs.

```bash
# In an existing project's directory
npx create-atomic-react init --yes
```

## What you get

Two templates. Pick at scaffold time - you cannot flip between them later without rewriting routes.

- **Default (`templates/react-ts`)** - SPA. Vite + React + TS strict, Tailwind v4, TanStack Router + Query, react-hook-form + zod, MSW handlers shared across Vitest / Storybook / Playwright, atomic component structure, PWA via `vite-plugin-pwa`.
- **`--ssr` (`templates/react-ts-ssr`)** - SSR. Same stack minus TanStack Router and PWA; routing + SSR via [Vike](https://vike.dev/) with `prerender: true`. Every route (`/`, `/docs`, `/example`, `/watch`) is prerendered to a real static `.html` file with `<title>` / `<meta>` / `og:*` tags in `<head>`. Deploys to static hosting (no server). Requires Node 22.13+ or 20.19+ (Vike + downstream ESLint deps).

Opt-in library addons (both templates):

- **`--mui`** - installs `@mui/material` + `@emotion/react` + `@emotion/styled` and drops a `MuiButton` atom (tsx + test + story + barrel) as a starting point.
- **`--react-aria`** - installs `react-aria-components` and drops an `AriaButton` atom.

Both compose. They add deps + one example atom each, and do not change the default Tailwind primitives; use them alongside the existing `Button` atom or replace it in your own code.

See the [SPA template README](../../templates/react-ts/README.md) or the [SSR template](../../templates/react-ts-ssr/) for what's inside each.
