# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/`, organized by capability: shared UI in `components/`, end-to-end flows in `features/`, service layers in `services/`, AI helpers in `ai/`, reusable hooks in `hooks/`, and cross-cutting utilities in `utils/`. Project types are defined in `types/`, routing shells in `App*.tsx`, and the entry point is `src/main.jsx`. Tests sit beside code (`*.test.js|*.spec.tsx`) and in `src/__tests__/`; Playwright specs reside in `tests/e2e/`. Static assets belong in `public/`, bundled media in `src/assets/`, and build artifacts land in `dist/`.

## Build, Test, and Development Commands
Run `npm run dev` for the Vite dev server at `http://localhost:5173`. `npm run build` produces a production bundle, while `npm run preview` serves that bundle locally. Linting (including the lazy-loading custom rule) runs via `npm run lint`. Execute Jest once with `npm test` or in watch mode using `npm run test:watch`. Playwright scenarios run through `npm run test:e2e`; add `:ui` to open the inspector and `:clean` to purge previous reports.

## Coding Style & Naming Conventions
Prettier enforces two-space indentation, single quotes, and a 100-character wrap (`.prettierrc.json`). ESLint extends React, TypeScript, and custom rules—note `scripts/eslint-rules/no-nonlazy-jsx-when-lazy-defined.js`. Favor `import type { Foo }` when only consuming types. Components and pages use `PascalCase`, hooks follow the `useThing` pattern, and non-shared files co-locate with their owning feature.

## Testing Guidelines
Unit tests rely on Jest + Testing Library in a JSDOM environment; target 50% line/branch coverage as set in `jest.config.js`. Name specs after the component (`WizardV3.test.tsx`) or behavior under test. For flows and regressions, rely on Playwright specs in `tests/e2e/`, which auto-launch the dev server unless `PLAYWRIGHT_BASE_URL` is set.

## Commit & Pull Request Guidelines
Write imperative commit messages (“Tighten wizard step cards”) and keep each change focused. Before opening a PR, run `npm run lint`, `npm test`, and the relevant Playwright command. PRs should summarize the change, call out the rationale, include screenshots for UI adjustments, list risk/rollback steps, and link any tracked work. Reference verification playbooks in `VERIFY_CHANGES.md` and `COMMIT_VERIFICATION.md` when applicable.

## Security & Configuration Tips
Never commit credentials. Copy `.env.example` locally and supply `VITE_GEMINI_API_KEY` plus Firebase values. Review `firebase.json`, `firestore.rules`, and `netlify.toml` before deployments, and prefer environment overrides to code changes for secrets.
