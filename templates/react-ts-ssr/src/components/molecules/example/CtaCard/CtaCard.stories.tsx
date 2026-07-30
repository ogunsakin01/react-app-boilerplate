import type { Meta, StoryObj } from '@storybook/react-vite';
import { CtaCard } from './CtaCard';

const meta: Meta<typeof CtaCard> = {
  title: 'Example/Molecules/CtaCard',
  component: CtaCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Documentation',
    description: 'Every pattern this boilerplate ships, explained.',
    href: '/docs',
    ctaLabel: 'Browse docs',
  },
};

export default meta;

type Story = StoryObj<typeof CtaCard>;

export const Default: Story = {};
