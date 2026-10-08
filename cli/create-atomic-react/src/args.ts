import yargsParser from 'yargs-parser';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export type TemplateVariant = 'react-ts' | 'react-ts-ssr';

export interface CliArgs {
  projectName?: string;
  pm?: PackageManager;
  variant: TemplateVariant;
  mui: boolean;
  reactAria: boolean;
  yes: boolean;
  install: boolean;
  git: boolean;
  help: boolean;
  version: boolean;
}

export interface InitArgs {
  dir?: string;
  pm?: PackageManager;
  yes: boolean;
  install: boolean;
  help: boolean;
}

const VALID_PMS: readonly PackageManager[] = ['npm', 'pnpm', 'yarn'];

function parsePm(pm: unknown): PackageManager | undefined {
  if (pm == null) return undefined;
  const val = String(pm);
  if (!VALID_PMS.includes(val as PackageManager)) {
    throw new Error(`--pm must be one of ${VALID_PMS.join(', ')} (got "${val}")`);
  }
  return val as PackageManager;
}

// yargs-parser accepts any flag, so a typo like `--react-area` would be
// silently ignored and the user would get a project without the add-on.
function assertKnownFlags(parsed: Record<string, unknown>, known: readonly string[]): void {
  const allowed = new Set(['_', '--', ...known]);
  const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const keys = Object.keys(parsed).filter((key) => !allowed.has(key));
  // yargs adds a camelCase copy of every dashed flag; report each typo once.
  const unknown = keys.filter((key) => key === kebab(key) || !keys.includes(kebab(key)));
  if (unknown.length > 0) {
    const flags = unknown.map((key) => (key.length === 1 ? `-${key}` : `--${key}`)).join(', ');
    throw new Error(
      `Unknown option${unknown.length > 1 ? 's' : ''}: ${flags}. Run with --help to see all options.`,
    );
  }
}

const SCAFFOLD_FLAGS = [
  'pm',
  'yes',
  'y',
  'install',
  'git',
  'help',
  'h',
  'version',
  'v',
  'ssr',
  'mui',
  'react-aria',
  'reactAria',
] as const;
const INIT_FLAGS = ['pm', 'yes', 'y', 'install', 'help', 'h'] as const;

export function parseArgs(argv: string[]): CliArgs {
  const parsed = yargsParser(argv, {
    string: ['pm'],
    boolean: ['yes', 'install', 'git', 'help', 'version', 'ssr', 'mui', 'react-aria'],
    alias: { y: 'yes', h: 'help', v: 'version' },
    default: { yes: false, install: true, git: true, ssr: false, mui: false, 'react-aria': false },
    configuration: { 'boolean-negation': true, 'camel-case-expansion': true },
  });

  assertKnownFlags(parsed, SCAFFOLD_FLAGS);
  const projectName = parsed._[0] ? String(parsed._[0]) : undefined;

  return {
    projectName,
    pm: parsePm(parsed.pm),
    variant: parsed.ssr ? 'react-ts-ssr' : 'react-ts',
    mui: Boolean(parsed.mui),
    reactAria: Boolean(parsed.reactAria ?? parsed['react-aria']),
    yes: Boolean(parsed.yes),
    install: parsed.install !== false,
    git: parsed.git !== false,
    help: Boolean(parsed.help),
    version: Boolean(parsed.version),
  };
}

export function parseInitArgs(argv: string[]): InitArgs {
  const parsed = yargsParser(argv, {
    string: ['pm'],
    boolean: ['yes', 'install', 'help'],
    alias: { y: 'yes', h: 'help' },
    default: { yes: false, install: true },
    configuration: { 'boolean-negation': true },
  });

  assertKnownFlags(parsed, INIT_FLAGS);
  const dir = parsed._[0] ? String(parsed._[0]) : undefined;

  return {
    dir,
    pm: parsePm(parsed.pm),
    yes: Boolean(parsed.yes),
    install: parsed.install !== false,
    help: Boolean(parsed.help),
  };
}

export const HELP = `
Usage: create-atomic-react [project-name|.] [options]
       create-atomic-react init [dir] [options]

Scaffold (default). create a new project from the template.
                     Pass a name for a new subfolder, or "." to populate the current directory.
Init. add the shared @react-app-boilerplate/* configs to an existing project
                     without overwriting your files.

Scaffold options:
  --ssr                         Use the SSR (Vike + prerender) variant. Default is SPA (TanStack Router).
  --mui                         Add Material UI (@mui/material + emotion) and a MuiButton example atom
  --react-aria                  Add React Aria Components and an AriaButton example atom
  --pm <npm|pnpm|yarn>          Package manager to use for install
  --yes, -y                     Skip prompts; use defaults for missing values
  --no-install                  Skip dependency install
  --no-git                      Skip git init

Init options:
  --pm <npm|pnpm|yarn>          Package manager to use for install
  --yes, -y                     Skip prompts; proceed with detected plan
  --no-install                  Skip installing shared config packages

Common:
  --help, -h                    Show this help
  --version, -v                 Show version

Examples:
  # Fresh SPA project (default)
  npm create atomic-react@latest my-app

  # Fresh project with SSR (Vike + prerender per route → SEO/social previews work)
  npm create atomic-react@latest my-app -- --ssr

  # Fresh project in the current folder (must be empty)
  mkdir my-app && cd my-app
  npx create-atomic-react .

  # Add shared configs to an existing React project
  cd my-existing-app
  npx create-atomic-react init

  # Scriptable (no prompts)
  npx create-atomic-react my-app --yes --pm pnpm
`.trim();
