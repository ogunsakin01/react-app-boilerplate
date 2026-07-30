import type { Meta, StoryObj } from '@storybook/react-vite';
import { UrlInput } from './UrlInput';

const meta: Meta<typeof UrlInput> = {
  title: 'Example/Atoms/UrlInput',
  component: UrlInput,
  tags: ['autodocs'],
  args: {
    placeholder: 'https://www.youtube.com/watch?v=…',
    'aria-label': 'YouTube URL',
  },
  argTypes: { hasError: { control: 'boolean' } },
};

export default meta;

type Story = StoryObj<typeof UrlInput>;

export const Default: Story = {};
export const WithError: Story = { args: { hasError: true } };
