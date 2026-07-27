# Contributing

Thanks for your interest. this boilerplate is deliberately opinionated, and contributions that fit the direction are very welcome.

## Ground rules

- Every commit must follow [Conventional Commits](https://www.conventionalcommits.org/). `commitlint` enforces this on `commit-msg`.
- CI must stay green on `main` at all times. Don't batch broken intermediate states.
- Prefer the smallest dependency that does the job. every dep is a permanent maintenance cost.
- Follow the component convention in `templates/react-ts` exactly: every component folder ships `.tsx`, `.stories.tsx`, `.test.tsx`, and `index.ts`. Pages additionally ship a Playwright spec (`e2e/<Name>.spec.ts`) and a route file (`src/routes/<slug>.tsx`). Every test — including generated ones — asserts `expect(await axe(container)).toHaveNoViolations()` so a11y regressions fail the same run. No exceptions.
- Don't hand-roll the boilerplate. Run `pnpm generate` (or `yarn generate`) inside the template to scaffold the full set. Non-interactive: `pnpm generate --kind atom --name Badge`.
- Don't add features that were explicitly excluded (auth, Redux/Zustand, i18n, Docker). Open an issue to discuss first.

## Local setup

```bash
corepack enable
pnpm install
```

This wires up husky hooks automatically (via the `prepare` script). Verify:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

## Commit messages

Format: `type(scope): short description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:

```
feat(template): add SearchForm molecule with zod resolver
fix(ci): pin pnpm version in workflow
docs(readme): explain Renovate grouping
chore(deps): bump vitest to 3.0.0
```

## Pull requests

- Small and focused. Break large changes into a series.
- Reference the plan (Phase / step) in the PR description where relevant.
- Include a test for behavior changes.
- Update docs in the same PR.

## Reporting issues

Use the issue templates. they'll ask for the environment, repro, and expected vs. actual behavior. Bug reports without a repro will be closed.
