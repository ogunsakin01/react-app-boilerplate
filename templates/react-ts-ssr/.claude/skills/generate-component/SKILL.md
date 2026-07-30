---
name: generate-component
description: Scaffold a new React component (atom, molecule, organism, template) or page in this boilerplate. Use when the user asks to add / create / make a new component, page, atom, molecule, organism, or template. The generator writes .tsx, .test.tsx (with an axe accessibility assertion baked in), .stories.tsx, index.ts, and - for pages - the Playwright spec and TanStack Router file route.
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

| kind     | folder                             | files                                                             |
| -------- | ---------------------------------- | ----------------------------------------------------------------- |
| atom     | `src/components/atoms/<Name>/`     | `<Name>.tsx`, `<Name>.test.tsx`, `<Name>.stories.tsx`, `index.ts` |
| molecule | `src/components/molecules/<Name>/` | same four                                                         |
| organism | `src/components/organisms/<Name>/` | same four                                                         |
| template | `src/components/templates/<Name>/` | same four                                                         |
| page     | `src/pages/<Name>/`                | same four + `src/routes/<slug>.tsx` + `e2e/<Name>.spec.ts`        |

Slug for pages is the kebab-case of `<Name>` (e.g. `UserDashboard` → `/user-dashboard`).

## After generating

For non-page kinds, re-export from the layer's barrel so the component is importable from `@/components/<layer>`:

```ts
// src/components/atoms/index.ts
export * from './Badge';
```

Pages don't need a barrel edit - the route file imports the page directly.

## Verify

Run the tests to prove the new file passes lint, type-check, and the axe assertion:

```bash
pnpm test <Name>
```
