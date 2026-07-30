import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { VideoUrlForm } from './VideoUrlForm';

const meta: Meta<typeof VideoUrlForm> = {
  title: 'Example/Molecules/VideoUrlForm',
  component: VideoUrlForm,
  tags: ['autodocs'],
  args: { onSubmit: fn() },
};

export default meta;

type Story = StoryObj<typeof VideoUrlForm>;

export const Default: Story = {};

export const RejectsNonYouTubeUrl: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'https://vimeo.com/12345');
    await userEvent.click(canvas.getByRole('button', { name: /load video/i }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent(/YouTube URL/i);
  },
};

export const AcceptsValidUrl: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox'),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
    await userEvent.click(canvas.getByRole('button', { name: /load video/i }));
    await expect(args.onSubmit).toHaveBeenCalledWith('dQw4w9WgXcQ');
  },
};
