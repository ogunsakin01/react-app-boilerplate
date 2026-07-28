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

function main() {
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
  - Deletes example route files (docs.tsx, example.tsx, watch.tsx)
  - Rewrites src/routes/index.tsx to render a minimal Home page
  - Writes src/pages/Home/{Home.tsx,Home.test.tsx,Home.stories.tsx,index.ts}
  - Cleans src/components/{atoms,molecules,organisms,templates}/index.ts barrels
  - Empties src/mocks/handlers.ts
  - Removes VITE_OEMBED_BASE_URL from env schema and .env.example
  - Rewrites e2e/app.spec.ts to a minimal smoke test
  - Simplifies MainLayout nav to just the theme toggle + repo link

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

export function collectActions(root) {
  const actions = [];

  for (const dir of findExampleDirs(join(root, 'src'))) {
    actions.push({
      kind: 'delete-dir',
      path: relative(root, dir),
      apply: () => rmSync(dir, { recursive: true, force: true }),
    });
  }

  for (const name of ['docs.tsx', 'example.tsx', 'watch.tsx']) {
    const p = join(root, 'src', 'routes', name);
    if (existsSync(p)) {
      actions.push({
        kind: 'delete-file',
        path: `src/routes/${name}`,
        apply: () => rmSync(p),
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

  const indexRoute = join(root, 'src', 'routes', 'index.tsx');
  if (existsSync(indexRoute)) {
    actions.push({
      kind: 'rewrite',
      path: 'src/routes/index.tsx',
      apply: () => writeFileSync(indexRoute, INDEX_ROUTE_TSX),
    });
  }

  const handlers = join(root, 'src', 'mocks', 'handlers.ts');
  if (existsSync(handlers)) {
    actions.push({
      kind: 'rewrite',
      path: 'src/mocks/handlers.ts',
      apply: () => writeFileSync(handlers, HANDLERS_TS),
    });
  }

  const envTs = join(root, 'src', 'lib', 'env.ts');
  if (existsSync(envTs)) {
    actions.push({
      kind: 'patch',
      path: 'src/lib/env.ts',
      apply: () => {
        const cleaned = readFileSync(envTs, 'utf8')
          .split('\n')
          .filter(
            (line) =>
              !line.includes('VITE_OEMBED_BASE_URL') && !/EXAMPLE.*used by the \/watch/i.test(line),
          )
          .join('\n');
        writeFileSync(envTs, cleaned);
      },
    });
  }

  const envExample = join(root, '.env.example');
  if (existsSync(envExample)) {
    actions.push({
      kind: 'patch',
      path: '.env.example',
      apply: () => {
        const cleaned = readFileSync(envExample, 'utf8')
          .split('\n')
          .filter((line) => !line.includes('VITE_OEMBED_BASE_URL'))
          .join('\n');
        writeFileSync(envExample, cleaned);
      },
    });
  }

  for (const layer of ['atoms', 'molecules', 'organisms', 'templates']) {
    const p = join(root, 'src', 'components', layer, 'index.ts');
    if (!existsSync(p)) continue;
    actions.push({
      kind: 'patch',
      path: `src/components/${layer}/index.ts`,
      apply: () => {
        const cleaned = readFileSync(p, 'utf8')
          .split('\n')
          .filter(
            (line) => !line.includes("'./example'") && !line.includes('// Delete the following'),
          )
          .join('\n');
        writeFileSync(p, cleaned);
      },
    });
  }

  const mainLayout = join(root, 'src', 'components', 'templates', 'MainLayout', 'MainLayout.tsx');
  if (existsSync(mainLayout)) {
    actions.push({
      kind: 'rewrite',
      path: 'src/components/templates/MainLayout/MainLayout.tsx',
      apply: () => writeFileSync(mainLayout, MAIN_LAYOUT_TSX),
    });
  }

  actions.push({
    kind: 'write',
    path: 'e2e/smoke.spec.ts',
    apply: () => {
      mkdirSync(join(root, 'e2e'), { recursive: true });
      writeFileSync(join(root, 'e2e', 'smoke.spec.ts'), SMOKE_SPEC_TS);
    },
  });

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

const HOME_TSX = `import { Seo } from '@/components/atoms/Seo';

export function Home() {
  return (
    <section className="flex flex-col gap-4">
      <Seo title="Home" description="Your new React app." />
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
    expect(screen.getByRole('heading', { level: 1, name: /your app starts here/i })).toBeInTheDocument();
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

const INDEX_ROUTE_TSX = `import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@/pages/Home';

export const Route = createFileRoute('/')({
  component: Home,
});
`;

const HANDLERS_TS = `import type { HttpHandler } from 'msw';

// Add your MSW handlers here. This one file is picked up by Vitest, Storybook,
// the dev browser, and Playwright. See .claude/skills/add-msw-handler for examples.
export const handlers: HttpHandler[] = [];
`;

const MAIN_LAYOUT_TSX = `import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { PwaUpdate } from '@/components/molecules/PwaUpdate';
import { env } from '@/lib/env';
import { useTheme } from '@/providers/theme-context';

export function MainLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="text-sm font-semibold tracking-tight hover:text-primary">
            {env.VITE_APP_TITLE}
          </Link>

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

      <PwaUpdate />
    </div>
  );
}
`;

const SMOKE_SPEC_TS = `import { expect, test } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
`;

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) main();
