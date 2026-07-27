import type { Meta, StoryObj } from '@storybook/react-vite';
import { Docs } from './Docs';

const meta: Meta<typeof Docs> = {
  title: 'Pages/Example/Docs',
  component: Docs,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Docs>;

export const Default: Story = {};
