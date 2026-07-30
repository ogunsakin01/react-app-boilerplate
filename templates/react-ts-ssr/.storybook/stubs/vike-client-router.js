// Storybook stub for vike/client/router. Real module wires up client-side
// routing at runtime; in Storybook there is no router, so navigate becomes a no-op.
export function navigate(url) {
  console.info('[storybook] navigate ->', url);
  return Promise.resolve();
}

export function reload() {
  return Promise.resolve();
}

export function prefetch() {
  return Promise.resolve();
}
