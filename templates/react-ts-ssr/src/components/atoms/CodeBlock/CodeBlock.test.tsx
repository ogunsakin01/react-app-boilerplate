import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('renders the code and the file path caption', () => {
    render(<CodeBlock code={'export const x = 1;\n'} filePath="src/lib/example.ts" />);
    expect(screen.getByText('export const x = 1;')).toBeInTheDocument();
    expect(screen.getByText('src/lib/example.ts')).toBeInTheDocument();
  });

  it('associates the pre with the caption via aria-describedby', () => {
    render(<CodeBlock code="const a = 1;" filePath="src/a.ts" />);
    const pre = screen.getByText('const a = 1;').closest('pre');
    const caption = screen.getByText('src/a.ts');
    expect(pre).toHaveAttribute('aria-describedby', caption.id);
  });

  it('omits the caption when no filePath is given', () => {
    render(<CodeBlock code="noop" />);
    expect(screen.queryByRole('figure')).toBeInTheDocument();
    expect(screen.getByText('noop').closest('pre')).not.toHaveAttribute('aria-describedby');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CodeBlock code={"import x from 'y';\nexport { x };\n"} filePath="src/x.ts" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
