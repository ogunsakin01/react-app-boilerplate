import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { useTheme } from './theme-context';
import { AppProviders } from './AppProviders';

function Probe() {
  const client = useQueryClient();
  const { theme } = useTheme();
  return <p data-testid="probe">{`${client ? 'query' : 'no-query'}:${theme}`}</p>;
}

describe('AppProviders', () => {
  it('composes QueryProvider + ThemeProvider so both contexts are available', () => {
    render(
      <AppProviders>
        <Probe />
      </AppProviders>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('query:light');
  });

  it('has no accessibility violations wrapping a landmark child', async () => {
    const { container } = render(
      <AppProviders>
        <main>
          <h1>hello</h1>
        </main>
      </AppProviders>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
