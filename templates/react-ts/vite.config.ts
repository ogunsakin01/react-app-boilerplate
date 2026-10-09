/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { vitestReactConfig } from '@react-app-boilerplate/vitest-config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appTitle = env.VITE_APP_TITLE || 'react-app-boilerplate';
  const shortName = env.VITE_APP_SHORT_NAME || appTitle;

  // VITE_BASE_URL is either a sub-path ("/app/", e.g. GitHub Pages) or a CDN
  // origin ("https://cdn.example.com/app/"). A service worker must be served
  // from the page's own origin, so for a CDN the app stays on "/" and only the
  // built JS/CSS URLs point at the CDN.
  const baseUrl = env.VITE_BASE_URL || '/';
  const cdn = /^https?:\/\//.test(baseUrl) ? baseUrl.replace(/\/?$/, '/') : null;
  const base = cdn ? '/' : baseUrl;

  return {
    base,
    experimental: cdn
      ? {
          renderBuiltUrl: (filename: string) =>
            /\.(js|css)$/.test(filename) ? `${cdn}${filename}` : { relative: true },
        }
      : undefined,
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'robots.txt'],
        manifest: {
          name: appTitle,
          short_name: shortName,
          description: env.VITE_APP_DESCRIPTION || 'React + TypeScript + Vite app',
          theme_color: '#0f172a',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}favicon.svg`,
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: `${base}favicon.svg`,
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          // MSW's worker is only started in dev; don't ship it in the precache.
          globIgnores: ['**/mockServiceWorker.js'],
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/^\/api\//],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: vitestReactConfig(),
  };
});
