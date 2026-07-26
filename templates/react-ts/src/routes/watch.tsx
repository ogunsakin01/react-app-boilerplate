// EXAMPLE route - delete this file when you strip the example.
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Watch } from '@/pages/example/Watch';

const searchSchema = z.object({
  v: z.string().optional(),
});

export const Route = createFileRoute('/watch')({
  validateSearch: (search) => searchSchema.parse(search),
  component: WatchRoute,
});

function WatchRoute() {
  const { v } = Route.useSearch();
  return <Watch videoId={v ?? null} />;
}
