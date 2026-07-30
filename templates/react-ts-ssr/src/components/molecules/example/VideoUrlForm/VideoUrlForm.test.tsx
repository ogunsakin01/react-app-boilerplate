import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { VideoUrlForm } from './VideoUrlForm';

describe('VideoUrlForm', () => {
  it('has no accessibility violations in its idle state', async () => {
    const { container } = render(<VideoUrlForm onSubmit={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations while showing a validation error', async () => {
    const user = userEvent.setup();
    const { container } = render(<VideoUrlForm onSubmit={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'https://vimeo.com/12345');
    await user.click(screen.getByRole('button', { name: /load video/i }));
    await screen.findByRole('alert');

    expect(await axe(container)).toHaveNoViolations();
  });

  it('rejects a non-YouTube URL', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<VideoUrlForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), 'https://vimeo.com/12345');
    await user.click(screen.getByRole('button', { name: /load video/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/YouTube URL/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the extracted video ID for a valid YouTube URL', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<VideoUrlForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await user.click(screen.getByRole('button', { name: /load video/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('dQw4w9WgXcQ'));
  });

  it('accepts a youtu.be short URL', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<VideoUrlForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), 'https://youtu.be/dQw4w9WgXcQ');
    await user.click(screen.getByRole('button', { name: /load video/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('dQw4w9WgXcQ'));
  });
});
