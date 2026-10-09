import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),
  VITE_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  VITE_SENTRY_ENVIRONMENT: z.string().optional(),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  // EXAMPLE - used by the /watch demo. Remove alongside `src/**/example`.
  VITE_OEMBED_BASE_URL: z.string().url().default('https://noembed.com/embed'),
});

// `KEY=""` (as copied from .env.example) means "not set": drop it so the
// schema's defaults apply instead of validating an empty string.
const defined = Object.fromEntries(
  Object.entries(import.meta.env).filter(([, value]) => value !== ''),
);

const parsed = envSchema.safeParse(defined);

if (!parsed.success) {
  const details = JSON.stringify(parsed.error.flatten().fieldErrors, null, 2);
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
