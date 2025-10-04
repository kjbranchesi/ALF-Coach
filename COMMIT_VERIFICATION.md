# Pre-Commit Verification Checklist ✅

Use this checklist before creating a commit or pushing a branch. Update it as workflows evolve.

## 1. Confirm Scope
- [ ] Review the ticket or request and restate the goal in your commit message draft
- [ ] Ensure staged files contain only intentional changes (`git status`)
- [ ] Verify docs or comments are updated for any behavior changes

## 2. Static Analysis
- [ ] `npm run lint` (fix autofixable issues before rerunning)
- [ ] `npm run build` if the change touches build tooling, environment config, or routing

## 3. Tests
- [ ] `npm test` for Jest coverage
- [ ] `npm run test:e2e` (or targeted Playwright command) when UI flows, routing, or auth is affected
- [ ] Capture failures with notes or screenshots if something regresses

## 4. Manual Spot Checks
- [ ] Exercise the main user path you touched in Vite dev (`npm run dev`)
- [ ] Verify there are no new warnings or console errors
- [ ] Confirm feature flags, environment variables, and migration scripts are documented if introduced

## 5. Finalize the Commit
- [ ] Re-run `git status` to ensure the tree is clean after formatting and test artifact cleanup
- [ ] Write an imperative commit message that summarizes *what* and *why*
- [ ] Push or open the PR only after every box above is checked (or the gap is documented)
