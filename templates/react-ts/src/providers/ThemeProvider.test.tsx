import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it } from 'vitest';
import { THEME_BOOT_SCRIPT, THEME_STORAGE_KEY, useTheme } from './theme-context';
import { ThemeProvider } from './ThemeProvider';

function ThemeReadout() {
  const { theme, toggle, setTheme } = useTheme();
  return (
    <div>
      <p data-testid="value">{theme}</p>
      <button type="button" onClick={toggle}>
        toggle
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        force dark
      </button>
    </div>
  );
}

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('ThemeProvider', () => {
  it('defaults to light and mirrors it onto the <html data-theme>', () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('value')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('toggle flips between light and dark and syncs the data attribute', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('value')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('value')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('setTheme jumps directly to a theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'force dark' }));
    expect(screen.getByTestId('value')).toHaveTextContent('dark');
  });

  it('useTheme throws when used outside the provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/useTheme/);
  });

  it('has no accessibility violations wrapping a landmark child', async () => {
    const { container } = render(
      <ThemeProvider>
        <main>
          <h1>themed page</h1>
        </main>
      </ThemeProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ThemeProvider preferences', () => {
  const originalMatchMedia = window.matchMedia;

  function mockSystemTheme(dark: boolean) {
    window.matchMedia = ((query: string) => ({
      matches: dark && query.includes('dark'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
  }

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('follows the system dark preference when nothing is saved', async () => {
    mockSystemTheme(true);
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(await screen.findByText('dark')).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('restores a saved choice over the system preference', async () => {
    mockSystemTheme(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );
    expect(await screen.findByText('light')).toBeInTheDocument();
  });

  it('saves an explicit choice', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'force dark' }));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });
});

describe('theme boot script', () => {
  it('index.html inlines the same script as THEME_BOOT_SCRIPT', () => {
    // Prettier reformats the inline copy, so compare without whitespace.
    const squash = (code: string) => code.replace(/\s+/g, '');
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    expect(squash(html)).toContain(squash(THEME_BOOT_SCRIPT));
  });
});
