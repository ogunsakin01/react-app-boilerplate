#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

async function main() {
  const { values } = parseArgs({
    options: {
      cwd: { type: 'string' },
      'dry-run': { type: 'boolean' },
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    console.log(`Usage: node scripts/strip-example.mjs [options]

Removes the boilerplate's example tour so you can start on your own app:
  - Deletes every src/**/example directory
  - Deletes example page dirs (pages/docs, pages/example, pages/watch)
  - Rewrites pages/index/+Page.tsx to render a minimal Home page
  - Writes src/pages/Home/{Home.tsx,Home.test.tsx,Home.stories.tsx,index.ts}
  - Cleans src/components/{atoms,molecules,organisms,templates}/index.ts barrels
  - Empties src/mocks/handlers.ts
  - Removes VITE_OEMBED_BASE_URL from the env schema, its test and .env.example
  - Replaces e2e/app.spec.ts with e2e/smoke.spec.ts and trims e2e/a11y.spec.ts and
    e2e/prerender.spec.ts to /
  - Simplifies MainLayout nav to just the theme toggle, and rewrites its test

Options:
      --cwd <path>   Run against this directory (default: cwd)
      --dry-run      Print planned actions without touching files
`);
    process.exit(0);
  }

  const root = resolve(values.cwd ?? process.cwd());
  const dryRun = values['dry-run'] === true;

  const actions = collectActions(root);
  if (actions.length === 0) {
    console.log('strip-example: nothing to do (already stripped?)');
    return;
  }

  for (const action of actions) {
    console.log(`  ${action.kind.padEnd(12)} ${action.path}`);
    if (!dryRun) action.apply();
  }

  console.log(
    `strip-example: ${actions.length} change${actions.length === 1 ? '' : 's'}${dryRun ? ' (dry-run)' : ''}`,
  );
}

// Rewrites are skipped when the file already has the target content, so a
// second run reports "nothing to do".
function differs(file, content) {
  return !existsSync(file) || readFileSync(file, 'utf8') !== content;
}

// Plans an in-place edit only when it would change the file.
function patch(actions, root, rel, transform) {
  const file = join(root, rel);
  if (!existsSync(file)) return;
  const next = transform(readFileSync(file, 'utf8'));
  if (!differs(file, next)) return;
  actions.push({ kind: 'patch', path: rel, apply: () => writeFileSync(file, next) });
}

export function collectActions(root) {
  const actions = [];

  for (const dir of findExampleDirs(join(root, 'src'))) {
    actions.push({
      kind: 'delete-dir',
      path: relative(root, dir),
      apply: () => rmSync(dir, { recursive: true, force: true }),
    });
  }

  for (const name of ['docs', 'example', 'watch']) {
    const p = join(root, 'pages', name);
    if (existsSync(p)) {
      actions.push({
        kind: 'delete-dir',
        path: `pages/${name}`,
        apply: () => rmSync(p, { recursive: true, force: true }),
      });
    }
  }

  const appSpec = join(root, 'e2e', 'app.spec.ts');
  if (existsSync(appSpec)) {
    actions.push({
      kind: 'delete-file',
      path: 'e2e/app.spec.ts',
      apply: () => rmSync(appSpec),
    });
  }

  // Never replace a Home page that already exists - it may have been edited.
  if (!existsSync(join(root, 'src', 'pages', 'Home'))) {
    actions.push({
      kind: 'write',
      path: 'src/pages/Home/',
      apply: () => {
        const dir = join(root, 'src', 'pages', 'Home');
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'Home.tsx'), HOME_TSX);
        writeFileSync(join(dir, 'Home.test.tsx'), HOME_TEST_TSX);
        writeFileSync(join(dir, 'Home.stories.tsx'), HOME_STORIES_TSX);
        writeFileSync(join(dir, 'index.ts'), "export { Home } from './Home';\n");
      },
    });
  }

  const indexPage = join(root, 'pages', 'index', '+Page.tsx');
  if (existsSync(indexPage) && differs(indexPage, INDEX_PAGE_TSX)) {
    actions.push({
      kind: 'rewrite',
      path: 'pages/index/+Page.tsx',
      apply: () => writeFileSync(indexPage, INDEX_PAGE_TSX),
    });
  }

  const indexTitle = join(root, 'pages', 'index', '+title.ts');
  if (existsSync(indexTitle) && differs(indexTitle, INDEX_TITLE_TS)) {
    actions.push({
      kind: 'rewrite',
      path: 'pages/index/+title.ts',
      apply: () => writeFileSync(indexTitle, INDEX_TITLE_TS),
    });
  }

  const handlers = join(root, 'src', 'mocks', 'handlers.ts');
  if (existsSync(handlers) && differs(handlers, HANDLERS_TS)) {
    actions.push({
      kind: 'rewrite',
      path: 'src/mocks/handlers.ts',
      apply: () => writeFileSync(handlers, HANDLERS_TS),
    });
  }

  const dropLines = (predicate) => (text) =>
    text
      .split('\n')
      .filter((line) => !predicate(line))
      .join('\n');

  patch(
    actions,
    root,
    'src/lib/env.ts',
    dropLines(
      (line) => line.includes('VITE_OEMBED_BASE_URL') || /EXAMPLE.*used by the \/watch/i.test(line),
    ),
  );
  patch(
    actions,
    root,
    '.env.example',
    dropLines((line) => line.includes('VITE_OEMBED_BASE_URL')),
  );
  patch(
    actions,
    root,
    'src/lib/env.test.ts',
    dropLines((line) => line.includes('VITE_OEMBED_BASE_URL')),
  );
  for (const layer of ['atoms', 'molecules', 'organisms', 'templates']) {
    patch(
      actions,
      root,
      `src/components/${layer}/index.ts`,
      dropLines((line) => line.includes("'./example'") || line.includes('// Delete the following')),
    );
  }

  const mainLayout = join(root, 'src', 'components', 'templates', 'MainLayout', 'MainLayout.tsx');
  if (existsSync(mainLayout) && differs(mainLayout, MAIN_LAYOUT_TSX)) {
    actions.push({
      kind: 'rewrite',
      path: 'src/components/templates/MainLayout/MainLayout.tsx',
      apply: () => writeFileSync(mainLayout, MAIN_LAYOUT_TSX),
    });
  }

  const mainLayoutTest = join(
    root,
    'src',
    'components',
    'templates',
    'MainLayout',
    'MainLayout.test.tsx',
  );
  if (existsSync(mainLayoutTest) && differs(mainLayoutTest, MAIN_LAYOUT_TEST_TSX)) {
    actions.push({
      kind: 'rewrite',
      path: 'src/components/templates/MainLayout/MainLayout.test.tsx',
      apply: () => writeFileSync(mainLayoutTest, MAIN_LAYOUT_TEST_TSX),
    });
  }

  const prerenderSpec = join(root, 'e2e', 'prerender.spec.ts');
  if (existsSync(prerenderSpec) && differs(prerenderSpec, PRERENDER_SPEC_TS)) {
    actions.push({
      kind: 'rewrite',
      path: 'e2e/prerender.spec.ts',
      apply: () => writeFileSync(prerenderSpec, PRERENDER_SPEC_TS),
    });
  }

  const a11ySpec = join(root, 'e2e', 'a11y.spec.ts');
  if (existsSync(a11ySpec) && differs(a11ySpec, A11Y_SPEC_TS)) {
    actions.push({
      kind: 'rewrite',
      path: 'e2e/a11y.spec.ts',
      apply: () => writeFileSync(a11ySpec, A11Y_SPEC_TS),
    });
  }

  if (differs(join(root, 'e2e', 'smoke.spec.ts'), SMOKE_SPEC_TS)) {
    actions.push({
      kind: 'write',
      path: 'e2e/smoke.spec.ts',
      apply: () => {
        mkdirSync(join(root, 'e2e'), { recursive: true });
        writeFileSync(join(root, 'e2e', 'smoke.spec.ts'), SMOKE_SPEC_TS);
      },
    });
  }

  return actions;
}

function findExampleDirs(startDir) {
  const found = [];
  if (!existsSync(startDir)) return found;
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      let stat;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (!stat.isDirectory()) continue;
      if (entry === 'example') {
        found.push(full);
        continue;
      }
      if (entry === 'node_modules') continue;
      walk(full);
    }
  };
  walk(startDir);
  return found;
}

const HOME_TSX = `export function Home() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Your app starts here</h1>
      <p className="text-muted">
        Replace this page with your own content. Scaffold new components and pages with{' '}
        <code>pnpm generate</code>.
      </p>
    </section>
  );
}
`;

const HOME_TEST_TSX = `import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Home } from './Home';

describe('Home', () => {
  it('renders the page heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1, name: /your app starts here/i }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Home />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`;

const HOME_STORIES_TSX = `import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home } from './Home';

const meta: Meta<typeof Home> = {
  title: 'Pages/Home',
  component: Home,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Home>;

export const Default: Story = {};
`;

const INDEX_PAGE_TSX = `import { Home } from '@/pages/Home';

export default function Page() {
  return <Home />;
}
`;

const INDEX_TITLE_TS = `import { env } from '@/lib/env';

export const title = \`Home · \${env.VITE_APP_TITLE}\`;
`;

const HANDLERS_TS = `import type { HttpHandler } from 'msw';

// Add your MSW handlers here. This one file is picked up by Vitest, Storybook,
// the dev browser, and Playwright. See .claude/skills/add-msw-handler for examples.
export const handlers: HttpHandler[] = [];
`;

const MAIN_LAYOUT_TSX = `import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { env } from '@/lib/env';
import { useTheme } from '@/providers/theme-context';

export function MainLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <a href="/" className="text-sm font-semibold tracking-tight hover:text-primary">
            {env.VITE_APP_TITLE}
          </a>

          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            <Button
              variant="ghost"
              onClick={toggle}
              aria-label={\`Switch to \${theme === 'light' ? 'dark' : 'light'} theme\`}
              className="ml-1"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
`;

const MAIN_LAYOUT_TEST_TSX = `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => ({ urlPathname: '/' }),
}));

import { ThemeProvider } from '@/providers/ThemeProvider';
import { MainLayout } from './MainLayout';

function renderLayout() {
  return render(
    <ThemeProvider>
      <MainLayout>
        <p>page body</p>
      </MainLayout>
    </ThemeProvider>,
  );
}

describe('MainLayout', () => {
  it('renders the primary nav and children', () => {
    renderLayout();
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByText('page body')).toBeInTheDocument();
  });

  it('toggles the theme via the header button', async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }));

    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderLayout();
    expect(await axe(container)).toHaveNoViolations();
  });
});
`;

const A11Y_SPEC_TS = `import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Add each new route here so it gets the same WCAG scan.
const routes: { name: string; path: string }[] = [{ name: 'home', path: '/' }];

for (const { name, path } of routes) {
  test(\`\${name} has no detectable accessibility violations\`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
`;

const PRERENDER_SPEC_TS = `import { expect, test } from '@playwright/test';
import { PREVIEW_URL } from './playwright.config';

// What a crawler or link-preview bot gets: the prerendered HTML, no JavaScript.
// Add each new page here.
for (const path of ['/']) {
  test(\`\${path} ships its title and description in the static HTML\`, async ({ request }) => {
    const res = await request.get(\`\${PREVIEW_URL}\${path}\`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<title>[^<]+<\\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
  });
}

test('unknown paths get the prerendered 404 page', async ({ request }) => {
  const res = await request.get(\`\${PREVIEW_URL}/definitely-not-a-page\`);
  expect(await res.text()).toContain('Not found');
});
`;

const SMOKE_SPEC_TS = `import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
`;

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) await main();
