import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotFound } from './NotFound';

const meta: Meta<typeof NotFound> = {
  title: 'Pages/NotFound',
  component: NotFound,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotFound>;

export const Default: Story = {};
