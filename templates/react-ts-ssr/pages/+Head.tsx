import { THEME_BOOT_SCRIPT } from '@/providers/theme-context';

export default function Head() {
  return (
    <>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.svg" />
      <meta name="theme-color" content="#0f172a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      {/* Sets data-theme before first paint so a saved or system dark theme never flashes light. */}
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
    </>
  );
}
