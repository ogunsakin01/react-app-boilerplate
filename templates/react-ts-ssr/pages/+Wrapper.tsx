import type { ReactNode } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { AppProviders } from '@/providers/AppProviders';

export default function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <MainLayout>{children}</MainLayout>
    </AppProviders>
  );
}
