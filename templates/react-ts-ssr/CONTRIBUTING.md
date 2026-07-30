# Contributing

Thanks for your interest.

## Ground rules

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/). enforced by commitlint on `commit-msg`.
- CI must be green on `main`. Don't batch broken intermediate states.
- Prefer the smallest dependency that does the job.
- Every component ships with `.tsx` + `.stories.tsx` + `.test.tsx` + `index.ts`. no exceptions.

## Local setup

```bash
corepack enable
pnpm install
```

This wires up husky hooks automatically (via the `prepare` script).

Verify:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Commit messages

Format: `type(scope): short description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## Pull requests

- Small and focused.
- Include a test for behavior changes.
- Update the README when user-facing behavior changes.
- Reference issues with `Fixes #123` or `Refs #123`.
