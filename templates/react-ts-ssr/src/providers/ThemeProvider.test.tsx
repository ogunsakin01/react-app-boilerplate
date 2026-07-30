import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it } from 'vitest';
import { useTheme } from './theme-context';
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
