import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),
  // EXAMPLE - used by the /watch demo. Remove alongside `src/**/example`.
  VITE_OEMBED_BASE_URL: z.string().url().default('https://noembed.com/embed'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const details = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
