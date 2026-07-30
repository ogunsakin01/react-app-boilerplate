// Storybook stub for vike-react/usePageContext. Real hook requires PageContext
// to be provided by Vike's renderer; in Storybook there is no renderer, so we
// return a static context so stories that read urlPathname etc. render.
export function usePageContext() {
  return {
    urlPathname: '/',
    urlOriginal: '/',
    urlParsed: { search: {}, hash: '', origin: null },
    routeParams: {},
  };
}
