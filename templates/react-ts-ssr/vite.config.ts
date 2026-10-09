/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import vike from 'vike/plugin';
import { vitestReactConfig } from '@react-app-boilerplate/vitest-config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_URL || '/',
    server: { port: 5173, strictPort: false },
    // strictPort: e2e/playwright.config.ts waits on exactly this port.
    preview: { port: 4173, strictPort: true },
    plugins: [vike(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: vitestReactConfig(),
  };
});
