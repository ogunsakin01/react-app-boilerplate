// Storybook stub for `virtual:pwa-register/react`. The real virtual module is
// provided by vite-plugin-pwa which we strip from the Storybook build.
export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}],
    offlineReady: [false, () => {}],
    updateServiceWorker: () => Promise.resolve(),
  };
}
