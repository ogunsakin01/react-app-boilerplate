import type { Meta, StoryObj } from '@storybook/react-vite';
import { VideoFrame } from './VideoFrame';

const meta: Meta<typeof VideoFrame> = {
  title: 'Example/Atoms/VideoFrame',
  component: VideoFrame,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
};

export default meta;

type Story = StoryObj<typeof VideoFrame>;

export const Default: Story = {};
