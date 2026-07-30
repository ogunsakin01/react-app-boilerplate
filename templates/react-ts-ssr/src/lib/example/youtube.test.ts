import { describe, expect, it } from 'vitest';
import { parseYouTubeUrl } from './youtube';

describe('parseYouTubeUrl', () => {
  const ID = 'dQw4w9WgXcQ';

  it.each([
    [`https://www.youtube.com/watch?v=${ID}`, ID],
    [`https://youtube.com/watch?v=${ID}`, ID],
    [`https://www.youtube.com/watch?v=${ID}&t=42s`, ID],
    [`https://m.youtube.com/watch?v=${ID}`, ID],
    [`https://youtu.be/${ID}`, ID],
    [`https://youtu.be/${ID}?t=42`, ID],
    [`https://www.youtube.com/embed/${ID}`, ID],
    [`https://www.youtube.com/shorts/${ID}`, ID],
    [`https://www.youtube.com/live/${ID}`, ID],
    [`https://youtube-nocookie.com/embed/${ID}`, ID],
    [`  ${ID}  `, ID],
    [ID, ID],
  ])('extracts %s → %s', (input, expected) => {
    expect(parseYouTubeUrl(input)).toBe(expected);
  });

  it.each([
    '',
    'not a url',
    'https://vimeo.com/12345',
    'https://youtube.com/watch',
    'https://youtu.be/tooshort',
    'https://youtube.com/watch?v=tooshort',
    'https://example.com/watch?v=' + ID,
  ])('rejects %s', (input) => {
    expect(parseYouTubeUrl(input)).toBeNull();
  });
});
