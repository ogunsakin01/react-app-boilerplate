import { Link } from '@tanstack/react-router';
import { Seo } from '@/components/atoms/Seo';
import { env } from '@/lib/env';

export function NotFound() {
  return (
    <section className="flex flex-col gap-3">
      <Seo title="Not found" siteName={env.VITE_APP_TITLE} robots="noindex" />
      <h2 className="text-lg font-medium">Not found</h2>
      <p className="text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="text-primary hover:underline">
        Back home
      </Link>
    </section>
  );
}
