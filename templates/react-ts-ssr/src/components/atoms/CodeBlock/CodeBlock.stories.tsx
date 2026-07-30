import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Atoms/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  args: {
    code: [
      "import { useState } from 'react';",
      '',
      'export function Counter() {',
      '  const [n, setN] = useState(0);',
      '  return <button onClick={() => setN((v) => v + 1)}>{n}</button>;',
      '}',
    ].join('\n'),
    filePath: 'src/components/atoms/Counter/Counter.tsx',
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const Default: Story = {};

export const WithoutFilePath: Story = {
  args: { filePath: undefined },
};

export const LongLine: Story = {
  args: {
    code: `export const veryLongLine = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';`,
  },
};
