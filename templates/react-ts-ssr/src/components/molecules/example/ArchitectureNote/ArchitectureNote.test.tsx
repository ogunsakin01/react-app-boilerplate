import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArchitectureNote } from './ArchitectureNote';

describe('ArchitectureNote', () => {
  it('renders each layer with its components and purpose', () => {
    render(
      <ArchitectureNote
        layers={[
          { layer: 'Atoms', components: ['Button'], purpose: 'Reusable primitives' },
          { layer: 'Molecules', components: ['SearchForm'] },
        ]}
      />,
    );
    expect(
      screen.getByRole('contentinfo', { name: /how this page is built/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('Reusable primitives')).toBeInTheDocument();
    expect(screen.getByText('SearchForm')).toBeInTheDocument();
  });
});
