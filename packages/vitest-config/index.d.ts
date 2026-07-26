import type { UserConfig } from 'vitest/config';

export interface VitestReactConfigOptions {
  include?: string[];
  exclude?: string[];
  setupFiles?: string[];
  coverageInclude?: string[];
  coverageExclude?: string[];
}

export function vitestReactConfig(options?: VitestReactConfigOptions): UserConfig['test'];

export default vitestReactConfig;
