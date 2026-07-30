import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { QueryProvider } from './QueryProvider';

function QueryClientProbe() {
  const client = useQueryClient();
  return <span data-testid="probe">{client ? 'ok' : 'missing'}</span>;
}

describe('QueryProvider', () => {
  it('renders children', () => {
    render(
      <QueryProvider>
        <p>hello</p>
      </QueryProvider>,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('exposes the shared QueryClient to descendants', () => {
    render(
      <QueryProvider>
        <QueryClientProbe />
      </QueryProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('ok');
  });

  it('has no accessibility violations wrapping a landmark child', async () => {
    const { container } = render(
      <QueryProvider>
        <main>
          <h1>hi</h1>
        </main>
      </QueryProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
