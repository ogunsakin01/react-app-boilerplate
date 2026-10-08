import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const MUI_DEPS: Record<string, string> = {
  '@mui/material': '^6.1.0',
  '@emotion/react': '^11.13.0',
  '@emotion/styled': '^11.13.0',
};

const REACT_ARIA_DEPS: Record<string, string> = {
  'react-aria-components': '^1.5.0',
};

async function addDeps(targetDir: string, deps: Record<string, string>): Promise<void> {
  const pkgPath = resolve(targetDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  pkg.dependencies = { ...(pkg.dependencies ?? {}), ...deps };
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

async function writeFileEnsuringDir(path: string, contents: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

// Adds the atom to src/components/atoms/index.ts so it's importable from
// '@/components/atoms' like the template's own atoms. Inserted above the
// example re-export so strip-example's barrel rewrite stays simple.
export async function registerAtom(targetDir: string, name: string): Promise<void> {
  const path = resolve(targetDir, 'src/components/atoms/index.ts');
  let barrel: string;
  try {
    barrel = await readFile(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw err;
  }
  const line = `export * from './${name}';\n`;
  if (barrel.includes(line)) return;
  const marker = barrel.indexOf('// Delete the following line');
  const next =
    marker === -1 ? barrel + line : barrel.slice(0, marker) + line + barrel.slice(marker);
  await writeFile(path, next);
}

// Agents read AGENTS.md before touching code, so each addon records how it
// should be used there instead of leaving the wrapper atom to be discovered.
export async function appendAgentsNote(targetDir: string, section: string): Promise<void> {
  const path = resolve(targetDir, 'AGENTS.md');
  let existing: string;
  try {
    existing = await readFile(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw err;
  }
  await writeFile(path, `${existing.trimEnd()}\n\n${section.trim()}\n`);
}

export async function applyMuiAddon(targetDir: string): Promise<void> {
  await addDeps(targetDir, MUI_DEPS);

  const dir = resolve(targetDir, 'src/components/atoms/MuiButton');
  await writeFileEnsuringDir(
    resolve(dir, 'MuiButton.tsx'),
    `import { Button as MuiButtonBase, type ButtonProps } from '@mui/material';

// Thin wrapper so MUI defaults are set once and the rest of the app imports
// this file (not @mui/material directly). Swap variant / disableRipple to taste.
export type MuiButtonProps = ButtonProps;

export function MuiButton(props: MuiButtonProps) {
  return <MuiButtonBase variant="contained" disableRipple {...props} />;
}
`,
  );

  await writeFileEnsuringDir(
    resolve(dir, 'MuiButton.test.tsx'),
    `import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { MuiButton } from './MuiButton';

describe('MuiButton', () => {
  it('renders the label', () => {
    render(<MuiButton>Save</MuiButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MuiButton>Save</MuiButton>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`,
  );

  await writeFileEnsuringDir(
    resolve(dir, 'MuiButton.stories.tsx'),
    `import type { Meta, StoryObj } from '@storybook/react-vite';
import { MuiButton } from './MuiButton';

const meta: Meta<typeof MuiButton> = {
  title: 'Atoms/MuiButton',
  component: MuiButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MuiButton>;

export const Default: Story = { args: { children: 'Save' } };
`,
  );

  await writeFileEnsuringDir(
    resolve(dir, 'index.ts'),
    `export { MuiButton } from './MuiButton';\nexport type { MuiButtonProps } from './MuiButton';\n`,
  );
  await registerAtom(targetDir, 'MuiButton');

  await appendAgentsNote(
    targetDir,
    `## Material UI (added by --mui)

- \`@mui/material\` + emotion are installed. Import MUI through wrapper atoms like \`src/components/atoms/MuiButton/\`, never from \`@mui/material\` directly in molecules, organisms or pages - set MUI defaults once in the wrapper.
- New MUI wrappers follow the same four-file convention (component, axe test, story, barrel).
- Tailwind still owns layout and spacing; use MUI for the component itself.`,
  );
}

export async function applyReactAriaAddon(targetDir: string): Promise<void> {
  await addDeps(targetDir, REACT_ARIA_DEPS);

  const dir = resolve(targetDir, 'src/components/atoms/AriaButton');
  await writeFileEnsuringDir(
    resolve(dir, 'AriaButton.tsx'),
    `import { Button, type ButtonProps } from 'react-aria-components';

// react-aria-components ships unstyled, accessibility-first primitives. Wrap
// them with Tailwind utility classes (or your own) to fit the design system.
export type AriaButtonProps = ButtonProps;

export function AriaButton(props: AriaButtonProps) {
  return (
    <Button
      {...props}
      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary/40"
    />
  );
}
`,
  );

  await writeFileEnsuringDir(
    resolve(dir, 'AriaButton.test.tsx'),
    `import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { AriaButton } from './AriaButton';

describe('AriaButton', () => {
  it('renders the label', () => {
    render(<AriaButton>Save</AriaButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AriaButton>Save</AriaButton>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
`,
  );

  await writeFileEnsuringDir(
    resolve(dir, 'AriaButton.stories.tsx'),
    `import type { Meta, StoryObj } from '@storybook/react-vite';
import { AriaButton } from './AriaButton';

const meta: Meta<typeof AriaButton> = {
  title: 'Atoms/AriaButton',
  component: AriaButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AriaButton>;

export const Default: Story = { args: { children: 'Save' } };
`,
  );

  await writeFileEnsuringDir(
    resolve(dir, 'index.ts'),
    `export { AriaButton } from './AriaButton';\nexport type { AriaButtonProps } from './AriaButton';\n`,
  );
  await registerAtom(targetDir, 'AriaButton');

  await appendAgentsNote(
    targetDir,
    `## React Aria Components (added by --react-aria)

- \`react-aria-components\` is installed. Its primitives are unstyled and handle keyboard, focus and ARIA behaviour - wrap them in atoms styled with Tailwind, like \`src/components/atoms/AriaButton/\`.
- Style interaction states with React Aria's data attributes (\`data-[focus-visible]\`, \`data-[pressed]\`, \`data-[disabled]\`), not \`:focus\` / \`:active\`.
- New wrappers follow the same four-file convention (component, axe test, story, barrel).`,
  );
}
