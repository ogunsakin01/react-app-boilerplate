---
'create-atomic-react': minor
---

CLI robustness fixes:

- `--pm npm` / `--pm yarn` now rewrite the husky hooks, CI workflows, Playwright web server and `netlify.toml`, which all called `pnpm` and failed on the first commit or CI run.
- Works on Windows (package managers are spawned through a shell).
- A missing `git` or a failed install no longer aborts: the project is kept, the remaining steps are printed, and the exit code is 1.
- A failed copy removes the half-created folder so you can rerun.
- Scaffolding into `.` keeps existing files (README.md, `.vscode/`, ...) instead of overwriting them.
- Unknown flags (e.g. a typo like `--react-area`) are an error instead of being ignored; invalid `--pm` values no longer print a stack trace.
- Package names are derived from the folder (`My App` → `my-app`) instead of rejected; paths like `apps/web` work.
- `msw.workerDirectory` is kept, so `mockServiceWorker.js` updates when msw is upgraded.
- `--mui` / `--react-aria` atoms export their `Props` type and are added to `atoms/index.ts`.
- `init` no longer copies an unstyled Button without its test and story, installs `vite`, `@vitejs/plugin-react` and `jsdom` when its stubs need them, writes a Vitest stub that doesn't require a missing setup file, and detects more existing config file names.
- `--version` reads the real package version; the published package contains only git-tracked template files.
