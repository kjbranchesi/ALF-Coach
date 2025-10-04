# Change Verification Playbook

A lightweight protocol to confirm user-facing and system-level changes before handoff.

## 1. Align on Expected Outcomes
- [ ] Link the request, issue, or spec in the PR description
- [ ] Note any out-of-scope follow-ups so they are not mistaken for regressions

## 2. Prep the Environment
- [ ] Start the Vite dev server (`npm run dev`) and required services (for example `netlify dev` for AI)
- [ ] Clear browser `localStorage` and sign out of prior sessions when testing auth changes
- [ ] Load seeded data or mocks needed for the scenario under test

## 3. Functional Walkthrough
- [ ] Follow the primary flow end-to-end, capturing screenshots or video for UI shifts
- [ ] Validate edge cases: error states, slow responses, offline fallbacks, and cancel/reset actions
- [ ] Record console output; investigate any new warnings or network failures

## 4. Regression Sweep
- [ ] Smoke adjacent features that share components, services, or routes
- [ ] Confirm analytics, logging, and telemetry still emit expected events (where applicable)
- [ ] Re-run automated suites relevant to the touched areas (unit, integration, Playwright)

## 5. Documentation & Handoff
- [ ] Update README/QUICK_START/testing docs when instructions change
- [ ] Add release notes or migration guidance if data models, APIs, or permissions shift
- [ ] Capture verification evidence: test matrix, screenshots, or links to dashboards

Mark unchecked items in the PR with rationale so reviewers understand verified coverage and known gaps.
