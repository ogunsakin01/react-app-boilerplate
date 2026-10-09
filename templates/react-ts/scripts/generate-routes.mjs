#!/usr/bin/env node
// Regenerates src/routeTree.gen.ts from src/routes/ without starting Vite.
//
// The TanStack Router Vite plugin only writes the route tree while Vite runs,
// so a route added by `pnpm generate`, `pnpm strip-example` or by hand made
// `tsc -b` fail until someone ran the dev server. `typecheck` and `build` run
// this first. It resolves the generator through the plugin so both always use
// the same version, and the options must match the plugin's in vite.config.ts.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function generateRoutes(root = process.cwd()) {
  const requireFromPlugin = createRequire(
    createRequire(import.meta.url).resolve('@tanstack/router-plugin/package.json'),
  );
  const { Generator, getConfig } = await import(
    requireFromPlugin.resolve('@tanstack/router-generator')
  );
  const config = getConfig({ target: 'react', autoCodeSplitting: true }, root);
  await new Generator({ config, root }).run();
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) await generateRoutes();
