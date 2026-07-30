import type { Meta, StoryObj } from '@storybook/react-vite';
import { Landing } from './Landing';

const meta: Meta<typeof Landing> = {
  title: 'Pages/Example/Landing',
  component: Landing,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Landing>;

export const Default: Story = {};
