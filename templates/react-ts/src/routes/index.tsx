import { createFileRoute } from '@tanstack/react-router';
// EXAMPLE - swap this import for your own Home page when you strip the example.
import { Landing } from '@/pages/example/Landing';

export const Route = createFileRoute('/')({
  component: Landing,
});
