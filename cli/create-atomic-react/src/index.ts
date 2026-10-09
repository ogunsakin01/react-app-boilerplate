import * as p from '@clack/prompts';
import pc from 'picocolors';
import { type CliArgs, HELP, parseArgs } from './args.js';
import { runInit } from './init.js';
import { isCancelError } from './prompts.js';
import { runScaffold } from './scaffold.js';

declare const __VERSION__: string;

async function main(): Promise<void> {
  const raw = process.argv.slice(2);

  // `init` subcommand dispatch. everything after `init` goes to the init parser.
  if (raw[0] === 'init') {
    try {
      await runInit(raw.slice(1));
      process.exit(0);
    } catch (err) {
      if (isCancelError(err)) {
        p.cancel('Cancelled.');
        process.exit(0);
      }
      p.cancel(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  }

  let args: CliArgs;
  try {
    args = parseArgs(raw);
  } catch (err) {
    console.error(pc.red(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  }

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }
  if (args.version) {
    console.log(__VERSION__);
    process.exit(0);
  }

  p.intro(pc.bgCyan(pc.black(' create-atomic-react ')));

  try {
    if (!(await runScaffold(args))) process.exitCode = 1;
  } catch (err) {
    if (isCancelError(err)) {
      p.cancel('Cancelled.');
      process.exit(0);
    }
    p.cancel(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

void main();
