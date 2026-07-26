# create-atomic-react

Scaffold a new project from the [react-app-boilerplate](../../) template.

## Usage

```bash
# npm (npm 7+)
npm create atomic-react@latest my-app

# pnpm
pnpm create atomic-react my-app

# yarn
yarn create atomic-react my-app
```

## Non-interactive (scriptable)

```bash
npm create atomic-react@latest my-app -- --yes --pm pnpm
```

## Options

| Flag              | Values                | Default                  |
| ----------------- | --------------------- | ------------------------ |
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

The template at `templates/react-ts/`. Vite + React + TS strict, Tailwind v4, TanStack Router + Query, react-hook-form + zod, MSW handlers shared across Vitest / Storybook / Playwright, atomic component structure, and configs pulled from published `@react-app-boilerplate/*` packages so updates flow via Renovate.

See the [template README](../../templates/react-ts/README.md) for what's inside.
