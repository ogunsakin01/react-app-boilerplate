import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { readPreferredTheme, THEME_STORAGE_KEY, ThemeContext, type Theme } from './theme-context';

const DEFAULT_THEME: Theme = 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start from the default and read the real preference after mount: the
  // server-rendered (SSR) markup can't know it, and rendering it during
  // hydration would mismatch. The boot script has already set data-theme,
  // so there's no visible flash while this catches up.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(readPreferredTheme());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) document.documentElement.dataset.theme = theme;
  }, [theme, ready]);

  // Only an explicit choice is saved; until then the system preference wins.
  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice still applies for this visit.
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}
