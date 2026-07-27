import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';

type MockState = 'needRefresh' | 'offlineReady';

function MockPwaUpdate({ state, dismiss }: { state: MockState; dismiss: () => void }): ReactNode {
  const isRefresh = state === 'needRefresh';
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 rounded-md border border-border bg-bg p-4 shadow-lg"
    >
      <p className="text-sm font-medium">
        {isRefresh ? 'A new version is available.' : 'App ready to work offline.'}
      </p>
      <div className="flex justify-end gap-2">
        {isRefresh ? (
          <Button variant="primary" onClick={dismiss}>
            Reload
          </Button>
        ) : null}
        <Button variant="ghost" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

const meta: Meta<typeof MockPwaUpdate> = {
  title: 'Molecules/PwaUpdate',
  component: MockPwaUpdate,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Real PwaUpdate uses `useRegisterSW` from `virtual:pwa-register/react` which requires the vite-plugin-pwa runtime. This story renders the same markup with a stubbed state so the visual can be reviewed in Storybook.',
      },
    },
  },
  args: {
    dismiss: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof MockPwaUpdate>;

export const NeedRefresh: Story = {
  args: { state: 'needRefresh' },
};

export const OfflineReady: Story = {
  args: { state: 'offlineReady' },
};
