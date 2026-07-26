import { http, HttpResponse } from 'msw';
import type { OEmbed } from '@/types/example/oembed';

// EXAMPLE - safe to delete.
export const OEMBED_FIXTURE: OEmbed = {
  title: 'Never Gonna Give You Up',
  author_name: 'Rick Astley',
  author_url: 'https://www.youtube.com/@RickAstleyYT',
  thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  provider_name: 'YouTube',
  html: '<iframe width="480" height="270" src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>',
};

export const handlers = [
  http.get('https://noembed.com/embed', () => HttpResponse.json(OEMBED_FIXTURE)),
];
