import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VideoFrame } from './VideoFrame';

describe('VideoFrame', () => {
  it('embeds the given videoId via youtube-nocookie', () => {
    render(<VideoFrame videoId="dQw4w9WgXcQ" title="Rickroll" />);
    expect(screen.getByTitle('Rickroll')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });
});
