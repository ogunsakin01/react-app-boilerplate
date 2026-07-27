#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import * as p from '@clack/prompts';
import pc from 'picocolors';

const KINDS = /** @type {const} */ (['atom', 'molecule', 'organism', 'template', 'page']);
const COMPONENT_KINDS = KINDS.filter((k) => k !== 'page');

const ROOT = resolve(process.cwd());

const KIND_DIRS = {
  atom: 'src/components/atoms',
  molecule: 'src/components/molecules',
  organism: 'src/components/organisms',
  template: 'src/components/templates',
  page: 'src/pages',
};

const { values } = parseArgs({
  options: {
    kind: { type: 'string', short: 'k' },
    name: { type: 'string', short: 'n' },
    dir: { type: 'string', short: 'd' },
    help: { type: 'boolean' },
  },
});

if (values.help) {
  console.log(`Usage: pnpm generate [--kind <${KINDS.join('|')}>] [--name <PascalName>] [--dir <path>]

Scaffolds a component or page with:
  - <Name>.tsx           the component
  - <Name>.test.tsx      Vitest + RTL + jest-axe a11y check
  - <Name>.stories.tsx   Storybook story
  - index.ts             barrel export
  - <Name>.spec.ts       Playwright e2e (pages only)
  - src/routes/<slug>.tsx  TanStack Router file route (pages only)

Prompts for anything not passed as a flag.`);
  process.exit(0);
}

p.intro(pc.bgCyan(pc.black(' generate ')));

const kind = await resolveKind(values.kind);
const name = await resolveName(values.name);
const baseDir = values.dir?.trim() || KIND_DIRS[kind];
const targetDir = join(ROOT, baseDir, name);

if (existsSync(targetDir)) {
  p.cancel(`Target already exists: ${relative(ROOT, targetDir)}`);
  process.exit(1);
}

const files = buildFiles({ kind, name, baseDir });

for (const [path, contents] of Object.entries(files)) {
  const full = join(ROOT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
}

p.outro(
  pc.green('Created:') +
    '\n  ' +
    Object.keys(files)
      .map((f) => pc.dim(f))
      .join('\n  '),
);

async function resolveKind(preset) {
  if (preset && KINDS.includes(preset)) return preset;
  if (preset) {
    p.cancel(`Unknown --kind "${preset}". Expected one of: ${KINDS.join(', ')}`);
    process.exit(1);
  }
  const answer = await p.select({
    message: 'What are you generating?',
    options: KINDS.map((k) => ({
      value: k,
      label: k[0].toUpperCase() + k.slice(1),
      hint: kindHint(k),
    })),
  });
  if (p.isCancel(answer)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return answer;
}

async function resolveName(preset) {
  if (preset) {
    if (!isPascalCase(preset)) {
      p.cancel(`Name must be PascalCase (got "${preset}"). Example: UserAvatar`);
      process.exit(1);
    }
    return preset;
  }
  const answer = await p.text({
    message: 'Name (PascalCase)',
    placeholder: 'UserAvatar',
    validate: (v) => (isPascalCase(v) ? undefined : 'Use PascalCase, e.g. UserAvatar'),
  });
  if (p.isCancel(answer)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return answer;
}

function isPascalCase(v) {
  return /^[A-Z][A-Za-z0-9]*$/.test(v);
}

function kebab(v) {
  return v.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function kindHint(k) {
  return {
    atom: 'primitive: button, input, badge',
    molecule: 'group of atoms: form field, card',
    organism: 'feature-scoped, may fetch data',
    template: 'page skeleton / layout',
    page: 'route + page component + e2e spec',
  }[k];
}

function buildFiles({ kind, name, baseDir }) {
  if (kind === 'page') return pageFiles({ name, baseDir });
  return componentFiles({ kind, name, baseDir });
}

function componentFiles({ kind, name, baseDir }) {
  const dir = `${baseDir}/${name}`;
  const storyGroup = COMPONENT_KINDS.includes(kind)
    ? `${kind[0].toUpperCase() + kind.slice(1)}s`
    : 'Components';

  return {
    [`${dir}/${name}.tsx`]: componentSource(name),
    [`${dir}/${name}.test.tsx`]: componentTest(name),
    [`${dir}/${name}.stories.tsx`]: componentStory({ name, group: storyGroup }),
    [`${dir}/index.ts`]: barrel(name),
  };
}

function pageFiles({ name, baseDir }) {
  const dir = `${baseDir}/${name}`;
  const slug = kebab(name);
  return {
    [`${dir}/${name}.tsx`]: pageSource(name),
    [`${dir}/${name}.test.tsx`]: pageTest(name),
    [`${dir}/${name}.stories.tsx`]: componentStory({ name, group: 'Pages' }),
    [`${dir}/index.ts`]: pageBarrel(name),
    [`src/routes/${slug}.tsx`]: routeSource({ name, slug }),
    [`e2e/${name}.spec.ts`]: playwrightSource({ name, slug }),
  };
}

function componentSource(name) {
  return `export type ${name}Props = {
  title?: string;
};

export function ${name}({ title = '${name}' }: ${name}Props) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted">Replace me with real content.</p>
    </section>
  );
}
`;
}

function pageSource(name) {
  return `export function ${name}() {
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">${name}</h1>
      <p className="text-muted">This page was scaffolded by \`pnpm generate\`. Replace me.</p>
    </main>
  );
}
`;
}

function componentTest(name) {
  return `import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders', () => {
    render(<${name} />);
    expect(screen.getByRole('heading', { name: /${name}/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<${name} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`;
}

function componentStory({ name, group }) {
  return `import type { Meta, StoryObj } from '@storybook/react-vite';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: '${group}/${name}',
  component: ${name},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {};
`;
}

function barrel(name) {
  return `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;
}

function pageBarrel(name) {
  return `export { ${name} } from './${name}';
`;
}

function pageTest(name) {
  return `import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders the page heading', () => {
    render(<${name} />);
    expect(screen.getByRole('heading', { level: 1, name: /${name}/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<${name} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`;
}

function routeSource({ name, slug }) {
  return `import { createFileRoute } from '@tanstack/react-router';
import { ${name} } from '@/pages/${name}';

export const Route = createFileRoute('/${slug}')({
  component: ${name},
});
`;
}

function playwrightSource({ name, slug }) {
  return `import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('${name} page renders', async ({ page }) => {
  await page.goto('/${slug}');
  await expect(page.getByRole('heading', { level: 1, name: /${name}/i })).toBeVisible();
});

test('${name} page has no detectable accessibility violations', async ({ page }) => {
  await page.goto('/${slug}');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
`;
}
