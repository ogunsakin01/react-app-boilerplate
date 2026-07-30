import type { Meta, StoryObj } from '@storybook/react-vite';
import { Watch } from './Watch';

const meta: Meta<typeof Watch> = {
  title: 'Pages/Example/Watch',
  component: Watch,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Watch>;

export const Empty: Story = {
  args: { videoId: null },
};

export const WithVideo: Story = {
  args: { videoId: 'dQw4w9WgXcQ' },
};
