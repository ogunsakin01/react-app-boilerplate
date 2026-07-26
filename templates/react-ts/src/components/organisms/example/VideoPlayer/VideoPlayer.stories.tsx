import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { VideoPlayer } from './VideoPlayer';

const meta: Meta<typeof VideoPlayer> = {
  title: 'Example/Organisms/VideoPlayer',
  component: VideoPlayer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { videoId: 'dQw4w9WgXcQ' },
};

export default meta;

type Story = StoryObj<typeof VideoPlayer>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { level: 2 })).toHaveTextContent(
      'Never Gonna Give You Up',
    );
  },
};
