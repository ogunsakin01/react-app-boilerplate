# react-app-boilerplate

> Opinionated React + TypeScript open source boilerplate — monorepo hosting the template, shareable configs, and scaffolding CLI.

**Status:** Phase 0 — foundation. The template itself lives at `templates/react-ts` and is under active construction. See `plan/` for the full roadmap.

## Monorepo layout

```
templates/   # the boilerplate itself (Phase 1)
packages/    # shareable configs published to npm (Phase 2)
cli/         # create-yourthing scaffolding CLI (Phase 3)
apps/        # docs site (Phase 4)
```

## Requirements

- Node.js `>=22` (see `.nvmrc`)
- pnpm `>=9` (pinned via `packageManager` in `package.json`; enable with `corepack enable`)

## Local development

```bash
corepack enable
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) spec — enforced by commitlint on `commit-msg`.

## License

[MIT](./LICENSE)
