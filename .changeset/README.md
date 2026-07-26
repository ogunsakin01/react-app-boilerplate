# Changesets

This folder holds pending version bumps for packages under `packages/`.

## Adding a changeset

When you make a user-facing change to any published package, run:

```bash
pnpm changeset
```

Pick the affected package(s), choose `patch` / `minor` / `major`, and write a short summary. A markdown file is written to this directory. commit it with your PR.

## What happens on merge to main

The **Release** workflow runs `changesets/action`:

- If there are pending changesets, it opens/updates a "Version Packages" PR that consumes the changesets, bumps versions, and updates `CHANGELOG.md` files.
- When that PR is merged, the workflow runs `pnpm changeset publish`. publishing to npm with provenance.

## Editing this config

`config.json` controls scope, changelog format, and which packages are ignored. The template (`@react-app-boilerplate/template-react-ts`) is explicitly ignored. it's marked `private: true` and not published.
