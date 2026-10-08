import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  minify: false,
  splitting: false,
  banner: { js: '#!/usr/bin/env node' },
  define: { __VERSION__: JSON.stringify(version) },
});
