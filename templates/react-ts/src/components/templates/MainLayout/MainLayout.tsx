import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { PwaUpdate } from '@/components/molecules/PwaUpdate';
import { env } from '@/lib/env';
import { useTheme } from '@/providers/theme-context';

const NAV_LINKS = [
  { to: '/docs', label: 'Docs' },
  { to: '/example', label: 'Example' },
] as const;

export function MainLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="text-sm font-semibold tracking-tight hover:text-primary">
            {env.VITE_APP_TITLE}
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-md px-3 py-1.5 text-muted hover:bg-border hover:text-fg"
                activeProps={{ className: 'rounded-md px-3 py-1.5 text-fg font-medium' }}
              >
                {label}
              </Link>
            ))}
            <a
              href="https://github.com/OWNER/REPO"
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-1.5 text-muted hover:bg-border hover:text-fg"
            >
              GitHub
            </a>
            <Button
              variant="ghost"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              className="ml-1"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        {children}
      </main>

      <PwaUpdate />
    </div>
  );
}
