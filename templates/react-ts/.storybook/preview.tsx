import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { useTheme } from '../src/providers/theme-context';
import '../src/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function ThemeSync({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);
  return <>{children}</>;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  loaders: [
    async () => {
      const w = window as unknown as { __mswStarted?: boolean };
      if (!w.__mswStarted) {
        const { worker } = await import('../src/mocks/browser');
        await worker.start({ onUnhandledRequest: 'bypass' });
        w.__mswStarted = true;
      }
    },
  ],
  globalTypes: {
    theme: {
      description: 'Theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemeSync theme={context.globals.theme as 'light' | 'dark'}>
            <Story />
          </ThemeSync>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
