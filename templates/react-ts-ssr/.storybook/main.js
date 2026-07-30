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
    const stubUrl = new URL('./stubs/pwa-register.js', import.meta.url);
    viteConfig.plugins = (viteConfig.plugins ?? []).filter((plugin) => {
      const name = Array.isArray(plugin) ? plugin[0]?.name : plugin?.name;
      return !(typeof name === 'string' && name.startsWith('vite-plugin-pwa'));
    });
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias ?? {}),
      'virtual:pwa-register/react': fileURLToPath(stubUrl),
    };
    return viteConfig;
  },
};

export default config;
