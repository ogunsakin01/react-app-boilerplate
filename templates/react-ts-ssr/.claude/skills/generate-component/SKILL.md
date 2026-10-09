---
name: generate-component
description: Scaffold a new React component (atom, molecule, organism, template) or page in this Vike SSR project. Use when the user asks to add / create / make a new component, page, atom, molecule, organism, or template. The generator writes .tsx, .test.tsx (with an axe accessibility assertion baked in), .stories.tsx, index.ts, and - for pages - the Vike +Page.tsx / +title.ts files and a Playwright spec.
---

# generate-component

The template ships a generator at `scripts/generate.mjs`. Always use it - never hand-scaffold - because the generated test file contains the accessibility assertion (`expect(await axe(container)).toHaveNoViolations()`) that keeps the a11y floor from dropping.

## Interactive

```bash
pnpm generate
```

Prompts for `kind` then `name`.

## Non-interactive

```bash
pnpm generate --kind atom --name Badge
pnpm generate --kind molecule --name UserAvatar
pnpm generate --kind organism --name UserProfile
pnpm generate --kind template --name DashboardLayout
pnpm generate --kind page --name Dashboard
```

`--name` must be PascalCase. `--dir` overrides the default location.

## What each kind produces

| kind     | folder                             | files                                                                                  |
| -------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| atom     | `src/components/atoms/<Name>/`     | `<Name>.tsx`, `<Name>.test.tsx`, `<Name>.stories.tsx`, `index.ts`                      |
| molecule | `src/components/molecules/<Name>/` | same four                                                                              |
| organism | `src/components/organisms/<Name>/` | same four                                                                              |
| template | `src/components/templates/<Name>/` | same four                                                                              |
| page     | `src/pages/<Name>/`                | same four + `pages/<slug>/+Page.tsx` + `pages/<slug>/+title.ts` + `e2e/<Name>.spec.ts` |

Slug for pages is the kebab-case of `<Name>` (e.g. `UserDashboard` → `pages/user-dashboard/` → `/user-dashboard`).

The generator does not check for collisions - `--name Docs` would overwrite the existing `pages/docs/` files. Pick a name that isn't already a route.

## After generating

For non-page kinds, re-export from the layer's barrel so the component is importable from `@/components/<layer>`:

```ts
// src/components/atoms/index.ts
export * from './Badge';
```

For pages:

- `pages/<slug>/+Page.tsx` stays a thin wrapper that renders the component from `src/pages/<Name>`. Put the real UI in the component so it can be unit-tested and storied.
- Edit `pages/<slug>/+title.ts` and add a `+description.ts` - see the `add-seo` skill.
- The page is prerendered at build time. Don't read `window`, `document`, `localStorage` or query-string values during render; do it in an effect.
- Components that use `usePageContext` or `navigate` need Vike mocked in their tests:

  ```ts
  vi.mock('vike-react/usePageContext', () => ({
    usePageContext: () => ({ urlPathname: '/dashboard', urlParsed: { search: {} } }),
  }));
  vi.mock('vike/client/router', () => ({ navigate: vi.fn() }));
  ```

Link to the new page with a plain `<a href="/dashboard">` - Vike handles client-side navigation. The sitemap picks it up automatically on the next build.

## Verify

```bash
pnpm test <Name>
pnpm typecheck
pnpm e2e e2e/<Name>.spec.ts   # pages only
```
