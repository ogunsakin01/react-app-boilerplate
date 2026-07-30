import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('react-app-boilerplate'),
  VITE_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  VITE_SENTRY_ENVIRONMENT: z.string().optional(),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  // EXAMPLE - used by the /watch demo. Remove alongside `src/**/example`.
  VITE_OEMBED_BASE_URL: z.string().url().default('https://noembed.com/embed'),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: unknown): Env {
  const source = typeof raw === 'object' && raw !== null ? raw : {};
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = JSON.stringify(parsed.error.flatten(), null, 2);
    throw new Error(`Invalid environment variables:\n${details}`);
  }
  return parsed.data;
}

// Read each key individually. Vike replaces the bare `import.meta.env` expression
// with `null`, so spreading the whole object is a no-op under Vike -- see
// https://vike.dev/env
export const env: Env = parseEnv({
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  VITE_SENTRY_TRACES_SAMPLE_RATE: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
  VITE_OEMBED_BASE_URL: import.meta.env.VITE_OEMBED_BASE_URL,
});
