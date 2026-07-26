import type { PlaywrightTestConfig, Project } from '@playwright/test';

export interface PlaywrightViteConfigOptions {
  baseURL?: string;
  webServerCommand?: string;
  webServerCwd?: string;
  webServerUrl?: string;
  webServerTimeout?: number;
  testDir?: string;
  projects?: Project[];
}

export function playwrightViteConfig(options?: PlaywrightViteConfigOptions): PlaywrightTestConfig;

export default playwrightViteConfig;
