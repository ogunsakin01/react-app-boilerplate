// EXAMPLE route - delete this file when you strip the example.
import { createFileRoute } from '@tanstack/react-router';
import { Docs } from '@/pages/example/Docs';

export const Route = createFileRoute('/docs')({
  component: Docs,
});
