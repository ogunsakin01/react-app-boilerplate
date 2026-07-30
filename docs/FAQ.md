# FAQ

Design decisions and predictable bikeshedding, answered up front. If you're about to open an issue titled "why not `<library>`", start here.

## Why not Next.js (or Remix, or TanStack Start)?

This is a **client-rendered SPA** boilerplate, not a meta-framework. If you need SSR, ISR, server components, edge functions, or server actions, use Next.js / Remix / TanStack Start. This boilerplate optimizes for the case where you have a real backend (or none) and want a Vite + React app that ships to any static host, works offline as a PWA, and doesn't ship a Node server. If you don't need SSR, the SPA path is faster to build, faster to deploy, cheaper to host, and easier to reason about.

## Why atomic design?

Because component structure needs to be enforced or it drifts. Vue's Single-File Component enforces a shape by design; React doesn't. Atomic design (atoms / molecules / organisms / templates) gives every component an unambiguous home and a consistent set of siblings, which the generator can then produce mechanically.

You don't have to like the terminology. If you'd rather rename to `primitives / composites / features / layouts`, do a global find-replace. What matters is that every component has a designated layer and the four-file shape (`.tsx + .test.tsx + .stories.tsx + index.ts`) is non-negotiable. The generator enforces the shape; the layer name is cosmetic.

## Why Tailwind CSS?

Because pairing a shared design-token system (CSS variables in `styles/globals.css`) with utility classes gives you speed without giving up theming. `data-theme="dark"` on `<html>` swaps the whole app's tokens in one place.

If you'd rather use CSS Modules, vanilla-extract, or styled-components, you can swap Tailwind out. It's one Vite plugin + one CSS import. That said: the boilerplate ships Tailwind-only for scope reasons. Supporting three styling options triples the test matrix without proportionally more value.

## Why TanStack Router over React Router?

Two reasons: file-based routing that regenerates a typed route tree on save, and zod-validated search params attached to the route definition. Once you've had `link.to('/typo')` fail to compile, you don't go back. React Router 7 is fine and more mainstream, so if that's what your team knows, swap it. The routing surface is small enough to change.

## Why TanStack Query and not Redux / Zustand / Context / Jotai?

Because most React state is **server state**, not client state. TanStack Query gives you caching, deduplication, background revalidation, mutations, and devtools out of the box. Everything else stays in `useState` where it belongs. If you find yourself reaching for a global state manager, ask first whether you're just building an ad hoc cache for server data that Query already handles.

That said, if you have genuinely global client state (a wizard across three pages, a shopping cart, complex undo/redo), add Zustand. It's four lines. This boilerplate doesn't preclude it; it just doesn't ship it.

## Why `react-hook-form` + Zod?

One schema is the validator (`schema.parse`), the resolver (`zodResolver(schema)`), and the TypeScript type (`z.infer<typeof schema>`). No duplicate shape definitions, no runtime/type drift. `react-hook-form` gives you uncontrolled inputs with minimal re-renders. Formik works too; it just re-renders more.

## What SPA SEO can and can't do

Modern Googlebot executes JavaScript, so the `<Seo>` atom's tags and the generated `dist/sitemap.xml` cover Google and Bing indexing. **What SPAs cannot do**: serve populated `<meta>` tags to social preview crawlers (X, LinkedIn, Slack, Discord, iMessage). Those bots don't run JS, so they see the empty `index.html` shell and no `og:image` / `og:title`.

**If link previews matter to your product** (marketing pages, blog posts, share-to-social flows), scaffold with the SSR variant instead of the default SPA:

```bash
npm create atomic-react@latest my-app -- --ssr
```

The SSR variant swaps TanStack Router for **[Vike](https://vike.dev/) with prerender enabled**. Every route (`/`, `/docs`, `/example`, `/watch`) is compiled to a real static `.html` file at build time, with `<title>` / `<meta>` / `og:*` tags baked into `<head>`. Social crawlers see them because they're right there in the HTML. Deployment stays static - no server, no serverless functions - the same Vercel / Netlify / Cloudflare Pages configs work. Flip `prerender: false` on a specific page's `+config.ts` if you need per-request SSR later.

## Why not include auth?

Because auth is deployment-specific. Clerk, Auth0, WorkOS, Supabase, Firebase, custom JWT, custom sessions - every choice has different integration shapes. Locking one in would either force it on you or ship boilerplate you'd rip out. Add whichever fits your stack. The provider composition in `src/providers/AppProviders.tsx` is the natural spot.

## Why not i18n, Docker?

Explicit non-goals, documented in `CONTRIBUTING.md`. Both defensible as separate concerns:

- **i18n**: use `react-i18next` or `LinguiJS` when you actually need translations; premature setup ages badly.
- **Docker**: `dist/` is a folder of static files. Any container base with `nginx` works. No boilerplate needed.

SSR is now supported as a first-class opt-in variant - see [What SPA SEO can and can't do](#what-spa-seo-can-and-cant-do) above.

## Why so many pieces at once? (PWA, Sentry, deploy, sitemap, generator...)

Because each of those is a decision that would otherwise happen ten times across your projects. Renovate keeps the deps current and CI runs across npm/pnpm/yarn on every commit, so drift is caught fast. If you don't use PWA or Sentry, they're both opt-in via env or config and add zero runtime cost.

## How do I remove the demo?

```bash
pnpm strip-example
```

Removes every `src/**/example` directory, deletes the example routes and specs, writes a minimal Home page, and rewrites the barrels + env schema + MSW handlers to their post-demo shape. Idempotent; safe to run twice.

## Can I use this with an AI coding agent?

Yes, on purpose. Three artifacts make it fluent:

- **`AGENTS.md`** at the root - conventions, testing patterns, mock recipes.
- **`llms.txt`** - [llmstxt.org](https://llmstxt.org/) convention, retrievable in one fetch.
- **`.claude/skills/`** - task-scoped skills bundled with the template. Claude Code discovers them automatically.

Cursor, Codex, Aider, and any agent that reads `AGENTS.md` work out of the box.

## Why do you keep bringing up Vue?

Because I wrote Vue for a decade before touching React, and most of the strong opinions here (single mock source, enforced component shape, three-tier a11y) are patterns I brought over. See the launch posts under `plan/marketing/` (local only) for the full framing.

## I disagree with `<opinion>`. Can I still use this?

Probably. The pieces are loosely coupled. Swap TanStack Router for React Router, Tailwind for CSS Modules, jest-axe for something else - the rest keeps working. The generator, atomic layers, MSW single source, and CI matrix survive most substitutions.

If a swap turns out to be genuinely painful, open an issue. That's useful signal.
