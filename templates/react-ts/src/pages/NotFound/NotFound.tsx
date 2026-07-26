import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Not found</h2>
      <p className="text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="text-primary hover:underline">
        Back home
      </Link>
    </section>
  );
}
