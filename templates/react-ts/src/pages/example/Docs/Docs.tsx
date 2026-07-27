// EXAMPLE - safe to delete.
import { Link } from '@tanstack/react-router';
import a11yPreviewSource from '../../../../.storybook/preview.tsx?raw';
import a11yE2eSource from '../../../../e2e/a11y.spec.ts?raw';
import generateScriptSource from '../../../../scripts/generate.mjs?raw';
import { CodeBlock } from '@/components/atoms/CodeBlock';
import { ArchitectureNote } from '@/components/molecules/example/ArchitectureNote';
import videoFormSource from '@/components/molecules/example/VideoUrlForm/VideoUrlForm.tsx?raw';
import videoFormTestSource from '@/components/molecules/example/VideoUrlForm/VideoUrlForm.test.tsx?raw';
import setupSource from '@/test/setup.ts?raw';

type LearnMoreLink = { label: string; href: string };

type Section = {
  id: string;
  title: string;
  summary: string;
  usage: string;
  files: string[];
  learnMore: LearnMoreLink[];
};

const SECTIONS: Section[] = [
  {
    id: 'why',
    title: 'Why this boilerplate',
    summary:
      'A modern React app needs routing, forms, data fetching, mocked APIs, three tiers of tests, linting, formatting, git hooks, dependency updates, and a release pipeline before you write a single line of feature code. This boilerplate wires all of it once, uses one file for network fixtures across every environment, and keeps configs fresh through Renovate so your project never fossilizes at scaffold time. It is opinionated on purpose: routing is TanStack Router, server state is TanStack Query, forms are react-hook-form + zod, tests are Vitest + Storybook + Playwright, and mocks are MSW. Fewer decisions, more shipping.',
    usage: `Configs don't rot: Renovate keeps the shared @react-app-boilerplate/* packages current.
One mock source of truth: src/mocks/handlers.ts feeds Vitest, Storybook, dev, and Playwright.
Type-safe end to end: zod validates env, search params, and forms; TanStack Router types routes.
Atomic design, enforced: every component ships tsx + stories + test + index.
Zero bikeshedding: ESLint flat config, Prettier, husky, lint-staged, commitlint, all pre-wired.`,
    files: [
      'renovate.json',
      'packages/eslint-config',
      'packages/tsconfig',
      'packages/vitest-config',
      'packages/playwright-config',
    ],
    learnMore: [
      {
        label: 'Atomic Design (Brad Frost)',
        href: 'https://bradfrost.com/blog/post/atomic-web-design/',
      },
      { label: 'Renovate docs', href: 'https://docs.renovatebot.com/' },
      { label: 'Changesets', href: 'https://github.com/changesets/changesets' },
    ],
  },
  {
    id: 'getting-started',
    title: 'Get started',
    summary:
      'Requirements: Node 22 or newer (see .nvmrc) and pnpm 9 or newer (enable with corepack enable). To scaffold a new project, run npm create atomic-react@latest my-app (or the equivalent for pnpm / yarn). To scaffold into the current empty folder, run npx create-atomic-react followed by a single dot as the argument. To add the shared configs to an existing React project without touching your files, run npx create-atomic-react init. Then cd into the folder and run pnpm dev. The landing page you see is a live tour: two cards linking to this docs page and to the example implementation. When you are ready to build your own app, remove everything under src/**/example and swap the imports listed in the template README.',
    usage: `# Prerequisites
node --version   # 22+
corepack enable  # activates pnpm

# 1. Scaffold a new project
npm create atomic-react@latest my-app
cd my-app

# OR scaffold into the current empty folder
mkdir my-app && cd my-app
npx create-atomic-react .

# OR add configs to an existing project (no clobber)
cd my-existing-project
npx create-atomic-react init

# Then, in any of the above:
pnpm dev            # http://localhost:5173`,
    files: ['README.md', 'package.json', '.env.example', '.nvmrc'],
    learnMore: [
      { label: 'pnpm install', href: 'https://pnpm.io/installation' },
      { label: 'Node.js downloads', href: 'https://nodejs.org/en/download' },
      { label: 'corepack', href: 'https://nodejs.org/api/corepack.html' },
      { label: 'Vite guide', href: 'https://vitejs.dev/guide/' },
    ],
  },
  {
    id: 'atomic',
    title: 'Atomic component structure',
    summary:
      'Every component lives in one of atoms, molecules, organisms, or templates. Each folder ships four files: .tsx (the component), .stories.tsx (Storybook), .test.tsx (Vitest + RTL), and index.ts (barrel export). Layer meaning: atoms are primitives, molecules group atoms, organisms are feature-scoped and may fetch data, templates are page skeletons. Pages are separate and live in src/pages.',
    usage: `mkdir src/components/atoms/Badge
# create Badge.tsx, Badge.stories.tsx, Badge.test.tsx, index.ts
# re-export from src/components/atoms/index.ts`,
    files: [
      'src/components/atoms/Button/Button.tsx',
      'src/components/atoms/example/UrlInput/UrlInput.tsx',
      'src/components/molecules/example/VideoUrlForm/VideoUrlForm.tsx',
      'src/components/organisms/example/VideoPlayer/VideoPlayer.tsx',
      'src/components/templates/MainLayout/MainLayout.tsx',
    ],
    learnMore: [
      {
        label: 'Atomic Design (Brad Frost)',
        href: 'https://bradfrost.com/blog/post/atomic-web-design/',
      },
    ],
  },
  {
    id: 'routing',
    title: 'File-based routing',
    summary:
      'TanStack Router. Drop a file in src/routes and it becomes a route. The Vite plugin regenerates src/routeTree.gen.ts on save (commit that file). Search params are validated with zod at the route definition, so useSearch() returns typed data.',
    usage: `// src/routes/watch.tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({ v: z.string().optional() });

export const Route = createFileRoute('/watch')({
  validateSearch: (s) => searchSchema.parse(s),
  component: () => { /* … */ },
});`,
    files: [
      'src/routes/__root.tsx',
      'src/routes/index.tsx',
      'src/routes/watch.tsx',
      'src/router.ts',
      'src/routeTree.gen.ts',
    ],
    learnMore: [
      {
        label: 'TanStack Router overview',
        href: 'https://tanstack.com/router/latest/docs/framework/react/overview',
      },
      {
        label: 'File-based routing guide',
        href: 'https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing',
      },
      {
        label: 'Search params + zod',
        href: 'https://tanstack.com/router/latest/docs/framework/react/guide/search-params',
      },
    ],
  },
  {
    id: 'query',
    title: 'Data fetching',
    summary:
      'TanStack Query. Typed hooks live in src/hooks. Server state stays in the query cache. Never mirror it into local state. Use the enabled option to gate a query on an input. Devtools load only when import.meta.env.DEV is true, so they never ship to production.',
    usage: `// src/hooks/example/useVideoOEmbed.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export function useVideoOEmbed(videoId: string | null) {
  return useQuery({
    queryKey: ['oembed', videoId],
    enabled: !!videoId,
    queryFn: () => apiGet<OEmbed>(url),
  });
}`,
    files: [
      'src/hooks/example/useVideoOEmbed.ts',
      'src/lib/api.ts',
      'src/lib/query-client.ts',
      'src/providers/QueryProvider.tsx',
      'src/providers/AppProviders.tsx',
    ],
    learnMore: [
      {
        label: 'TanStack Query overview',
        href: 'https://tanstack.com/query/latest/docs/framework/react/overview',
      },
      {
        label: 'Queries',
        href: 'https://tanstack.com/query/latest/docs/framework/react/guides/queries',
      },
      {
        label: 'Mutations',
        href: 'https://tanstack.com/query/latest/docs/framework/react/guides/mutations',
      },
      {
        label: 'Query invalidation',
        href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation',
      },
    ],
  },
  {
    id: 'forms',
    title: 'Forms',
    summary:
      'react-hook-form for the form state, zod for the schema, @hookform/resolvers/zod as the bridge. One zod object is your validator, your TypeScript type (via z.infer), and your form resolver. errors is typed, register is typed, and no FormData shapes are hand-written.',
    usage: `import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  url: z.string().min(1).refine((v) => parseYouTubeUrl(v) !== null, 'Not a YouTube URL'),
});

const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});`,
    files: [
      'src/components/molecules/example/VideoUrlForm/VideoUrlForm.tsx',
      'src/lib/example/youtube.ts',
    ],
    learnMore: [
      { label: 'react-hook-form get started', href: 'https://react-hook-form.com/get-started' },
      { label: 'Zod docs', href: 'https://zod.dev/' },
      { label: '@hookform/resolvers', href: 'https://github.com/react-hook-form/resolvers' },
    ],
  },
  {
    id: 'mocks',
    title: 'API mocking',
    summary:
      'MSW. One handlers file drives four consumers: Vitest tests (via src/mocks/server.ts), Storybook (via .storybook/preview.tsx loader), the dev browser (started in src/main.tsx when import.meta.env.DEV), and Playwright (which talks to the dev server). Add a handler once and every environment picks it up. The mockServiceWorker.js in public/ is generated by msw init and must be committed.',
    usage: `// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Ada' }])),
];`,
    files: [
      'src/mocks/handlers.ts',
      'src/mocks/server.ts',
      'src/mocks/browser.ts',
      'src/test/setup.ts',
      'src/main.tsx',
      '.storybook/preview.tsx',
      'public/mockServiceWorker.js',
    ],
    learnMore: [
      { label: 'MSW docs', href: 'https://mswjs.io/docs/' },
      { label: 'REST API mocking', href: 'https://mswjs.io/docs/network-behavior/rest' },
      {
        label: 'Integrations (Vitest, Storybook, Playwright)',
        href: 'https://mswjs.io/docs/integrations/',
      },
    ],
  },
  {
    id: 'env',
    title: 'Env vars',
    summary:
      'src/lib/env.ts parses import.meta.env through a zod schema at import time. If a required VITE_* variable is missing or malformed, the app throws before it renders. Copy .env.example to .env.local for local development. Only VITE_-prefixed variables reach the client bundle.',
    usage: `// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1),
  VITE_API_BASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) throw new Error('Invalid env');
export const env = parsed.data;`,
    files: ['src/lib/env.ts', '.env.example'],
    learnMore: [
      { label: 'Vite env variables', href: 'https://vitejs.dev/guide/env-and-mode' },
      { label: 'Zod docs', href: 'https://zod.dev/' },
    ],
  },
  {
    id: 'theme',
    title: 'Theming',
    summary:
      'ThemeProvider (src/providers/ThemeProvider.tsx) picks the initial theme from prefers-color-scheme and sets a data-theme attribute on <html>. Design tokens live in src/styles/globals.css as CSS variables, mapped into Tailwind via @theme. Swap the variable values to re-skin the whole app. useTheme (src/providers/theme-context.ts) exposes the current theme and a toggle.',
    usage: `// Anywhere in the app
import { useTheme } from '@/providers/theme-context';

function ModeBadge() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>{theme}</button>;
}`,
    files: [
      'src/providers/ThemeProvider.tsx',
      'src/providers/theme-context.ts',
      'src/styles/globals.css',
      'src/components/templates/MainLayout/MainLayout.tsx',
    ],
    learnMore: [
      { label: 'Tailwind v4 theme variables', href: 'https://tailwindcss.com/docs/theme' },
      {
        label: 'CSS custom properties (MDN)',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties',
      },
      {
        label: 'prefers-color-scheme (MDN)',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme',
      },
    ],
  },
  {
    id: 'testing',
    title: 'Testing pyramid',
    summary:
      'Three tiers, one set of mocks. Vitest + React Testing Library for units and components. Storybook play functions for interaction tests. Playwright for end-to-end. All three read the same MSW handlers so fixtures never drift. Test setup (src/test/setup.ts) starts the MSW server, resets handlers after each test, and cleans up RTL renders.',
    usage: `pnpm test              # vitest run
pnpm test:watch        # vitest --watch
pnpm test:coverage     # v8 coverage → coverage/index.html + coverage/lcov.info
pnpm storybook         # dev server + interaction tests in the Docs tab
pnpm build-storybook   # static build → storybook-static/
pnpm e2e               # playwright, dev server auto-starts
pnpm e2e:ui            # playwright in UI mode`,
    files: [
      'src/test/setup.ts',
      'src/components/atoms/Button/Button.test.tsx',
      'src/components/molecules/example/VideoUrlForm/VideoUrlForm.test.tsx',
      'e2e/app.spec.ts',
      'e2e/playwright.config.ts',
      '.storybook/main.js',
      '.storybook/preview.tsx',
    ],
    learnMore: [
      { label: 'Vitest guide', href: 'https://vitest.dev/guide/' },
      {
        label: 'React Testing Library',
        href: 'https://testing-library.com/docs/react-testing-library/intro/',
      },
      {
        label: 'Which query? (RTL priority)',
        href: 'https://testing-library.com/docs/queries/about#priority',
      },
      { label: 'Storybook 9 docs', href: 'https://storybook.js.org/docs' },
      {
        label: 'Storybook play + interactions',
        href: 'https://storybook.js.org/docs/writing-tests/component-testing',
      },
      { label: 'Playwright docs', href: 'https://playwright.dev/docs/intro' },
    ],
  },
  {
    id: 'configs',
    title: 'Shared configs',
    summary:
      'ESLint, TypeScript, Vitest, and Playwright configs are published as small packages under @react-app-boilerplate/*. Your local config files are 2-line stubs that re-export the shared version. When we ship an upstream improvement, Renovate opens a PR to bump your dep and CI proves it works. Your projects never fossilize at scaffold time.',
    usage: `// eslint.config.mjs
export { default } from '@react-app-boilerplate/eslint-config/vite-react';

// tsconfig.app.json
{
  "extends": "@react-app-boilerplate/tsconfig/vite-react.json",
  "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } },
  "include": ["src"]
}

// vite.config.ts (Vitest section)
import { vitestReactConfig } from '@react-app-boilerplate/vitest-config';
export default defineConfig({ /* ... */, test: vitestReactConfig() });

// e2e/playwright.config.ts
import { playwrightViteConfig } from '@react-app-boilerplate/playwright-config';
export default defineConfig(playwrightViteConfig());`,
    files: [
      'eslint.config.mjs',
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json',
      'vite.config.ts',
      'e2e/playwright.config.ts',
    ],
    learnMore: [
      {
        label: 'ESLint flat config',
        href: 'https://eslint.org/docs/latest/use/configure/configuration-files',
      },
      {
        label: 'TypeScript project references',
        href: 'https://www.typescriptlang.org/docs/handbook/project-references.html',
      },
      { label: 'Vitest config', href: 'https://vitest.dev/config/' },
      { label: 'Playwright config', href: 'https://playwright.dev/docs/test-configuration' },
    ],
  },
  {
    id: 'git-hooks',
    title: 'Git hooks and commit messages',
    summary:
      'husky wires pre-commit and commit-msg hooks. pre-commit runs lint-staged, which lints and formats only the files you touched. commit-msg runs commitlint against the Conventional Commits spec. A malformed commit is rejected before it enters history.',
    usage: `# format: type(scope?): message
git commit -m "feat(auth): add magic-link sign in"

# valid types
feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`,
    files: ['.husky/pre-commit', '.husky/commit-msg', 'commitlint.config.mjs', 'package.json'],
    learnMore: [
      { label: 'husky', href: 'https://typicode.github.io/husky/' },
      { label: 'lint-staged', href: 'https://github.com/lint-staged/lint-staged' },
      { label: 'commitlint', href: 'https://commitlint.js.org/' },
      {
        label: 'Conventional Commits v1.0',
        href: 'https://www.conventionalcommits.org/en/v1.0.0/',
      },
    ],
  },
  {
    id: 'deployment',
    title: 'Deploying',
    summary:
      'Any static host works. Vite outputs to dist/. Because the app uses client-side routing (TanStack Router), unknown paths must fall back to index.html. Most platforms handle this automatically for SPAs; nginx needs try_files. Only VITE_* env vars are baked into the client bundle at build time. MSW does not run in production, so your prod host needs a real backend or a proxy.',
    usage: `# Vercel and Netlify: import repo, defaults work.
# Static host: build and upload dist/.
pnpm build && ls dist/

# Docker (nginx): see docs/guides/docker.md in the parent repo.`,
    files: ['vite.config.ts', 'index.html', 'src/lib/env.ts'],
    learnMore: [
      { label: 'Vite deployment guide', href: 'https://vitejs.dev/guide/static-deploy' },
      { label: 'Vercel + Vite', href: 'https://vercel.com/docs/frameworks/vite' },
      { label: 'Netlify + Vite', href: 'https://docs.netlify.com/frameworks/vite/' },
    ],
  },
];

const EXTRA_NAV: { id: string; title: string }[] = [
  { id: 'accessibility', title: 'Accessibility' },
  { id: 'conventions', title: 'Conventions' },
];

export function Docs() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <aside className="lg:sticky lg:top-20 lg:h-fit lg:w-56 lg:shrink-0">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          On this page
        </p>
        <nav aria-label="Docs sections" className="flex flex-col gap-0.5 text-sm">
          {[...SECTIONS, ...EXTRA_NAV].map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-md px-3 py-1.5 text-muted hover:bg-border hover:text-fg"
            >
              {s.title}
            </a>
          ))}
        </nav>
      </aside>

      <article className="flex min-w-0 flex-1 flex-col gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Documentation</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Every feature this boilerplate ships
          </h1>
          <p className="max-w-2xl text-muted">
            Each section names the exact files that implement the feature and links to the upstream
            project so you can learn more. For a working demo see{' '}
            <Link to="/example" className="text-primary hover:underline">
              example usage
            </Link>
            .
          </p>
        </header>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="flex scroll-mt-20 flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
            <p className="max-w-2xl text-muted">{s.summary}</p>
            <pre className="overflow-x-auto rounded-md border border-border bg-transparent p-4 text-xs leading-relaxed">
              <code>{s.usage}</code>
            </pre>
            <div className="flex flex-col gap-2 text-xs text-muted">
              <p className="font-semibold uppercase tracking-wide">Reference files</p>
              <ul className="flex flex-col gap-0.5 font-mono">
                {s.files.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted">
              <p className="font-semibold uppercase tracking-wide">Learn more</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {s.learnMore.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section id="accessibility" className="flex scroll-mt-20 flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Accessibility</h2>
          <p className="max-w-2xl text-muted">
            Accessibility is wired at three tiers so violations are caught wherever they show up.
            Unit tests use{' '}
            <a
              href="https://github.com/nickcolley/jest-axe"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              jest-axe
            </a>{' '}
            against the rendered DOM. Storybook renders the{' '}
            <a
              href="https://storybook.js.org/addons/@storybook/addon-a11y"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              addon-a11y
            </a>{' '}
            panel on every story. End-to-end tests use{' '}
            <a
              href="https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              @axe-core/playwright
            </a>{' '}
            to scan real navigations. All three run the same axe-core rule set.
          </p>

          <h3 className="text-base font-semibold">1. Register the matcher once</h3>
          <p className="max-w-2xl text-muted">
            The vitest setup file extends <code>expect</code> with <code>toHaveNoViolations</code>,
            so every test can assert against axe results without re-importing the matcher. The typed
            augmentation lives in <code>src/test/a11y.d.ts</code>.
          </p>
          <CodeBlock code={setupSource} filePath="src/test/setup.ts" language="ts" />

          <h3 className="text-base font-semibold">2. Write the component accessibly</h3>
          <p className="max-w-2xl text-muted">
            The example form pairs the input with a visible label, ties its error message to the
            input via <code>aria-describedby</code>, flips <code>aria-invalid</code> on validation
            failure, and exposes the error text as an <code>role=&quot;alert&quot;</code> live
            region so screen readers announce it. The form itself gets an <code>aria-label</code> so
            it&apos;s reachable as a landmark.
          </p>
          <CodeBlock
            code={videoFormSource}
            filePath="src/components/molecules/example/VideoUrlForm/VideoUrlForm.tsx"
            language="tsx"
          />

          <h3 className="text-base font-semibold">3. Assert no violations in unit tests</h3>
          <p className="max-w-2xl text-muted">
            Render the component, capture the container, and hand it to <code>axe</code>. Repeat the
            check after triggering a validation error so the accessible name / live-region behaviour
            is covered too.
          </p>
          <CodeBlock
            code={videoFormTestSource}
            filePath="src/components/molecules/example/VideoUrlForm/VideoUrlForm.test.tsx"
            language="tsx"
          />

          <h3 className="text-base font-semibold">4. Scan real pages in e2e</h3>
          <p className="max-w-2xl text-muted">
            The Playwright spec loops through the top-level routes, injects axe, and asserts zero
            violations. A separate case exercises the error state — because a real screen-reader
            user hits validation errors just as often as the happy path.
          </p>
          <CodeBlock code={a11yE2eSource} filePath="e2e/a11y.spec.ts" language="ts" />

          <h3 className="text-base font-semibold">5. Surface violations in Storybook</h3>
          <p className="max-w-2xl text-muted">
            Storybook&apos;s a11y addon runs axe on the story you&apos;re viewing and shows the
            report in a side panel. It ships in <code>todo</code> mode by default so runs don&apos;t
            fail CI while you triage — flip to <code>error</code> once your baseline is clean.
          </p>
          <CodeBlock code={a11yPreviewSource} filePath=".storybook/preview.tsx" language="tsx" />

          <div className="flex flex-col gap-2 text-xs text-muted">
            <p className="font-semibold uppercase tracking-wide">Learn more</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              <li>
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  WCAG 2.1 quick reference ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/WAI/ARIA/apg/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  ARIA Authoring Practices ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  axe-core rule list ↗
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section id="conventions" className="flex scroll-mt-20 flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Conventions</h2>
          <p className="max-w-2xl text-muted">
            Every component ships four files: <code>.tsx</code>, <code>.test.tsx</code>,{' '}
            <code>.stories.tsx</code>, and <code>index.ts</code>. Pages add a Playwright spec and a
            TanStack Router file route. The generated tests include an axe assertion so the a11y
            floor never drops. Follow the same shape for anything you add by hand, or let the
            generator do it for you.
          </p>

          <h3 className="text-base font-semibold">Generate a component or page</h3>
          <p className="max-w-2xl text-muted">
            Run <code>pnpm generate</code> (or <code>yarn generate</code>) and answer the two
            prompts. Non-interactive form: <code>pnpm generate --kind atom --name Badge</code>.
          </p>
          <CodeBlock
            code={`# interactive
pnpm generate

# non-interactive: atom / molecule / organism / template / page
pnpm generate --kind molecule --name UserAvatar
pnpm generate --kind page --name Dashboard`}
            filePath="terminal"
          />

          <h3 className="text-base font-semibold">What the generator writes</h3>
          <p className="max-w-2xl text-muted">
            The generator is a single script with no framework-specific magic. Each kind maps to a
            folder, and the templates are inline string builders — fork them freely.
          </p>
          <CodeBlock code={generateScriptSource} filePath="scripts/generate.mjs" language="js" />

          <div className="flex flex-col gap-2 text-xs text-muted">
            <p className="font-semibold uppercase tracking-wide">Rule of thumb</p>
            <ul className="flex flex-col gap-0.5">
              <li>Atoms / molecules / organisms / templates → tsx + test + story + index.</li>
              <li>Pages → also ship a Playwright spec and a route file.</li>
              <li>
                Every test includes an axe check so accessibility regressions fail the same run.
              </li>
            </ul>
          </div>
        </section>

        <ArchitectureNote
          layers={[
            { layer: 'Template', components: ['MainLayout'] },
            {
              layer: 'Molecules',
              components: ['ArchitectureNote'],
              purpose: 'Same footer as every other example page',
            },
            {
              layer: 'Atoms',
              components: ['CodeBlock'],
              purpose: 'Renders each source snippet with a file-path caption',
            },
            {
              layer: 'Route',
              components: ['routes/docs.tsx'],
              purpose: 'Simple file-based route with a static component',
            },
          ]}
        />
      </article>
    </div>
  );
}
