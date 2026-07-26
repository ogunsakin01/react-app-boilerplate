// EXAMPLE route - delete this file when you strip the example.
import { createFileRoute } from '@tanstack/react-router';
import { Example } from '@/pages/example/Example';

export const Route = createFileRoute('/example')({
  component: Example,
});
