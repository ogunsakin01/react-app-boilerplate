# @react-app-boilerplate/tsconfig

Shared TypeScript configurations.

## Variants

- `base.json`. strict foundation, no environment-specific settings.
- `vite-react.json`. Vite + React app (composite, `jsx: react-jsx`, `@/*` path alias).
- `node.json`. Vite/Vitest configs and other Node-side tooling.

## Usage

```jsonc
// tsconfig.json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}

// tsconfig.app.json
{
  "extends": "@react-app-boilerplate/tsconfig/vite-react.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    // Path aliases must be defined here (not in the shared config).     // TypeScript resolves `paths` relative to the tsconfig that declares them.
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}

// tsconfig.node.json
{
  "extends": "@react-app-boilerplate/tsconfig/node.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo"
  },
  "include": ["vite.config.ts"]
}
```
