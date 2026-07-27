// EXAMPLE landing page - safe to delete once you build your own.
import { Seo } from '@/components/atoms/Seo';
import { ArchitectureNote } from '@/components/molecules/example/ArchitectureNote';
import { CtaCard } from '@/components/molecules/example/CtaCard';

const BookIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const PlayIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

export function Landing() {
  return (
    <section className="flex flex-col gap-6">
      <Seo
        title="Welcome"
        siteName="react-app-boilerplate"
        description="Opinionated React + TypeScript + Vite boilerplate with accessibility testing, atomic-design components, TanStack Router, and MSW mocks."
      />
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Boilerplate tour</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to your React + TypeScript starter
        </h1>
        <p className="text-sm text-muted">
          Pick a path: read the docs to learn what each piece does, or jump into the working example
          to see them wired up.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CtaCard
          icon={BookIcon}
          title="Documentation"
          description="Every feature this boilerplate ships (routing, data fetching, forms, mocks, theming, testing) explained with code from the running app."
          to="/docs"
          ctaLabel="Browse docs"
        />
        <CtaCard
          icon={PlayIcon}
          title="Example usage"
          description="A working YouTube URL loader. Paste any URL, watch it play. Every component, hook, and test is real code you can copy."
          to="/example"
          ctaLabel="Try the example"
        />
      </div>

      <ArchitectureNote
        layers={[
          { layer: 'Template', components: ['MainLayout'], purpose: 'Header + main content slot' },
          {
            layer: 'Molecules',
            components: ['CtaCard', 'ArchitectureNote'],
            purpose: 'Group of atoms; CtaCard uses TanStack Router Link',
          },
          {
            layer: 'Route',
            components: ['routes/index.tsx'],
            purpose: 'File-based route rendering this page',
          },
        ]}
      />
    </section>
  );
}
