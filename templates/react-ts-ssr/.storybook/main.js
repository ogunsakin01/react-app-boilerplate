/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  async viteFinal(viteConfig) {
    const { fileURLToPath } = await import('node:url');
    const pageContextStub = new URL('./stubs/vike-react-usePageContext.js', import.meta.url);
    const clientRouterStub = new URL('./stubs/vike-client-router.js', import.meta.url);
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias ?? {}),
      'vike-react/usePageContext': fileURLToPath(pageContextStub),
      'vike/client/router': fileURLToPath(clientRouterStub),
    };
    return viteConfig;
  },
};

export default config;
