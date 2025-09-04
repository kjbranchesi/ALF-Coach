# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` — key folders: `components/`, `features/`, `services/`, `ai/`, `hooks/`, `utils/`, `types/`, `pages/`, `firebase/`. Entry: `src/main.jsx` and app shells in `src/App*.tsx`.
- Tests: unit in `src/__tests__/` and component-level `*.test.js|*.spec.js`; E2E in `tests/e2e/*.spec.ts`.
- Assets: `public/` (static) and `src/assets/` (bundled). Builds output to `dist/`.
- Scripts and tooling: `scripts/`, `eslint.config.js`, `playwright.config.js`, `vite.config.*`.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server at `http://localhost:5173`.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Serve the production build locally.
- `npm run lint`: Run ESLint (includes custom rule checking lazy usage).
- `npm test` | `npm run test:watch`: Run Jest unit tests (js/jsx).
- `npm run test:e2e` | `npm run test:e2e:ui`: Run Playwright tests; auto-starts dev server if using localhost.
- Useful: `npm run test:e2e:clean` (remove reports), `npm run check:lazy` (audit lazy-loading usage).

## Coding Style & Naming Conventions
- Prettier: 2-space indentation, single quotes, semicolons, width 100 (see `.prettierrc.json`).
- ESLint: React hooks rules, TypeScript best practices, and a custom rule enforcing lazy variants when defined (`scripts/eslint-rules/no-nonlazy-jsx-when-lazy-defined.js`).
- Naming: React components `PascalCase` (e.g., `ProgressV2.tsx`); hooks `useX` (e.g., `useSomething.ts`); tests `ComponentName.test.js`.
- Type imports: prefer `import type { X } from '...'`.

## Testing Guidelines
- Unit: Jest + Testing Library, JSDOM env. Tests in `src/__tests__/` or `**/*.(test|spec).js|jsx`. Coverage threshold: 50% lines/branches (see `jest.config.js`).
- E2E: Playwright specs in `tests/e2e/*.spec.ts`. Optional `PLAYWRIGHT_BASE_URL` overrides default; otherwise launches `npm run dev` automatically.
- Run examples: `npm test`, `npm run test:e2e`.

## Commit & Pull Request Guidelines
- Messages: imperative and descriptive (no strict conventional commits enforced). Example: "Fix chat flow progression from Big Idea to EQ".
- Before opening a PR: run `npm run lint`, `npm test`, and E2E for affected flows.
- PRs include: summary, rationale, screenshots for UI changes, risk/rollback, and linked issues.
- Keep changes scoped; reference verification docs when relevant (`COMMIT_VERIFICATION.md`, `VERIFY_CHANGES.md`).

## Security & Configuration Tips
- Never commit secrets. Copy `.env.example` to `.env` and set `VITE_GEMINI_API_KEY` and Firebase vars. Prefer local `.env` files.
- Deploy targets exist for Firebase/Netlify; review `firebase.json`, `firestore.rules`, and `netlify.toml` before deploying.

## CI & Automation
- GitHub Actions: `.github/workflows/ci.yml` runs lint, lazy check, and a Playwright smoke on PRs.
- Full E2E: `.github/workflows/e2e.yml` runs the suite; override target with repo var `PLAYWRIGHT_BASE_URL`.
