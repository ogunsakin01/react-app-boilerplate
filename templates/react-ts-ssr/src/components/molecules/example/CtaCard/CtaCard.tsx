// EXAMPLE - safe to delete.
import type { ReactNode } from 'react';

export type CtaCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export function CtaCard({ icon, title, description, href, ctaLabel }: CtaCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-md border border-border p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <a
        href={href}
        className="mt-auto inline-flex w-fit items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:opacity-90"
      >
        {ctaLabel} <span aria-hidden>→</span>
      </a>
    </article>
  );
}
