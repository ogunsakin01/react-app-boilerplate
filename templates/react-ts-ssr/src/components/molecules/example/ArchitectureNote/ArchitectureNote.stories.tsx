import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchitectureNote } from './ArchitectureNote';

const meta: Meta<typeof ArchitectureNote> = {
  title: 'Example/Molecules/ArchitectureNote',
  component: ArchitectureNote,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    layers: [
      { layer: 'Template', components: ['MainLayout'], purpose: 'Page skeleton with header' },
      { layer: 'Organisms', components: ['VideoPlayer'] },
      { layer: 'Molecules', components: ['VideoUrlForm'] },
      { layer: 'Atoms', components: ['UrlInput', 'VideoFrame', 'Button'] },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof ArchitectureNote>;

export const Default: Story = {};
