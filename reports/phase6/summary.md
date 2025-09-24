# Phase 6 Summary

## Offending Source
- DEBUG_BUNDLE build points to `chat-feature` chunk wrapping `ChatLoader` → `ProgressSidebar`. Snippet:
```
} else {
                console.warn("[ChatLoader] Cannot update - blueprint is null");
                await persistDraftSnapshot({
                  wizardData: data.wizardData || null,
                  capturedData: null,
                  projectData: null,
                  stage,
                  source: "chat"
                });
              }
            }
          },
          onNavigate: (view, projectId) => {
            console.log("[ChatLoader] Navigate:", view, projectId);
            if (view === "dashboard") {
              navigate("/app/dashboard");
            }
          }
        }
      ) }) })
    }
  );
}
const ChatLoader$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ChatLoader,
  default: ChatLoader
}, Symbol.toStringTag, { value: "Module" }));
const ProgressSidebar = ({
  stages,
  currentStageId,
```

## Cycles
```
No circular dependencies detected (madge output below)
Processed 4 files (167ms)
```

## Fix Applied
- Added DEBUG_BUNDLE toggles in `vite.config.ts` (conditional `sourcemap` / `minify`).
- Removed chat barrel `src/components/chat/index.ts` to eliminate potential re-export loops.
- Updated standards E2E flow to click framework buttons and newer placeholders, aligning with the UI.

## Verification
- `DEBUG_BUNDLE=true npm run build` (reports/phase6/build-debug.log): succeeded. Preview launched via `timeout 5 npm run preview` without immediate runtime errors.
- `npm run build` (reports/phase6/build-prod.log): succeeded.

## E2E Status
- `npm run test:e2e:chromium -- tests/e2e/wizard-to-standards-and-deliverables.spec.ts`
  - **Failed** (see reports/phase6/e2e.log); framework button `getByRole('button', { name: /^NGSS$/ })` still not resolved in headless run.

## Next
- Inspect the standards step in Playwright UI runner to confirm framework buttons render; adjust locator or seed data accordingly, then re-run the spec.

Reports written to reports/phase6/.
