import type { Config } from 'vike/types';
import vikeReact from 'vike-react/config';

export default {
  extends: vikeReact,
  prerender: true,
  lang: 'en',
  title: 'react-app-boilerplate',
} satisfies Config;
