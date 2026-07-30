import yargsParser from 'yargs-parser';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';
export type TemplateVariant = 'react-ts' | 'react-ts-ssr';

export interface CliArgs {
  projectName?: string;
  pm?: PackageManager;
  variant: TemplateVariant;
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

export function parseArgs(argv: string[]): CliArgs {
  const parsed = yargsParser(argv, {
    string: ['pm'],
    boolean: ['yes', 'install', 'git', 'help', 'version', 'ssr'],
    alias: { y: 'yes', h: 'help', v: 'version' },
    default: { yes: false, install: true, git: true, ssr: false },
    configuration: { 'boolean-negation': true },
  });

  const projectName = parsed._[0] ? String(parsed._[0]) : undefined;

  return {
    projectName,
    pm: parsePm(parsed.pm),
    variant: parsed.ssr ? 'react-ts-ssr' : 'react-ts',
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
