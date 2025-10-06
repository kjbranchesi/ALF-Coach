# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/`, separated by capability: shared UI in `src/components/`, features in `src/features/`, services in `src/services/`, hooks in `src/hooks/`, AI helpers in `src/ai/`, and utilities in `src/utils/`.
- Entry point is `src/main.jsx`; routing shells stay in `App*.tsx`.
- Tests sit beside their subjects (`Button.test.tsx`) or under `src/__tests__/`; Playwright specs live in `tests/e2e/`.
- Static assets belong in `public/`; bundled media belong in `src/assets/`; build artifacts land in `dist/`.

## Build, Test, and Development Commands
- `npm run dev` — start the Vite dev server at http://localhost:5173.
- `npm run build` — produce the optimized production bundle.
- `npm run preview` — serve the production bundle locally for spot checks.
- `npm run lint` — run ESLint with the custom lazy-loading rule.
- `npm test` / `npm run test:watch` — execute Jest suites once or in watch mode.
- `npm run test:e2e` (`:ui`, `:clean`) — run Playwright scenarios, optionally with inspector or cleanup.

## Coding Style & Naming Conventions
- Prettier enforces two-space indentation, single quotes, and 100-character wrap (`.prettierrc.json`).
- Prefer `import type` when only consuming TypeScript types.
- Components and pages use `PascalCase`; hooks follow `useThing`; feature-specific files stay co-located with their feature.
- Respect ESLint warnings, especially `no-nonlazy-jsx-when-lazy-defined` in `scripts/eslint-rules/`.

## Testing Guidelines
- Jest + Testing Library provide unit coverage; target 50% line/branch coverage per `jest.config.js`.
- Name specs after the component or behavior (`WizardV3.test.tsx`).
- Use Playwright for end-to-end flows; set `PLAYWRIGHT_BASE_URL` to reuse an existing server.
- Repair failing snapshots and ensure new features include focused tests.

## Commit & Pull Request Guidelines
- Write imperative commit messages (“Tighten wizard step cards”) and keep each change focused.
- Before opening a PR, run `npm run lint`, `npm test`, and the relevant Playwright command.
- PR descriptions should state the rationale, highlight risks, outline rollback steps, and attach UI screenshots when visuals change.
- Reference `VERIFY_CHANGES.md` and `COMMIT_VERIFICATION.md` for release and verification playbooks.

## Security & Configuration Tips
- Never commit credentials; copy `.env.example` locally and provide `VITE_GEMINI_API_KEY` plus Firebase values.
- Validate `firebase.json`, `firestore.rules`, and `netlify.toml` before deployments.
- Prefer environment overrides to code changes when handling secrets or environment-specific tuning.
