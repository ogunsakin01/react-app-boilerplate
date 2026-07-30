import type { Meta, StoryObj } from '@storybook/react-vite';
import { Seo } from './Seo';

const meta: Meta<typeof Seo> = {
  title: 'Atoms/Seo',
  component: Seo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Emits the standard SEO meta tags (title, description, canonical, Open Graph, Twitter card). React 19 hoists these into <head> automatically - the story canvas is intentionally blank because the component renders no visible UI.',
      },
    },
  },
  args: {
    title: 'Dashboard',
    description: "Your team's dashboard.",
    siteName: 'Acme',
    canonical: 'https://acme.example.com/dashboard',
  },
};

export default meta;
type Story = StoryObj<typeof Seo>;

export const Default: Story = {};

export const Article: Story = {
  args: {
    title: 'How we ship without breaking things',
    type: 'article',
    image: 'https://acme.example.com/og/how-we-ship.png',
  },
};

export const Noindex: Story = {
  args: {
    title: 'Internal preview',
    robots: 'noindex,nofollow',
  },
};
