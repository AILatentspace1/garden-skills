# T-0008 Plan

## Intent
Implement deterministic L3 micro E2E eval for web-video-presentation (short-article fixture) so template/contract changes can be validated without full E2E runs.

## Scope
- Only touch skills/web-video-presentation/** and .team/scratch/T-0008/** artifacts.
- Keep the eval deterministic: no network, no external credentials, no long-running bundlers if avoidable.

## Likely Files
- skills/web-video-presentation/scripts/eval-web-video.mjs
- skills/web-video-presentation/evals/fixtures/short-article/* (if fixture needs minor extension)
- skills/web-video-presentation/templates/* (read-only unless L3 requires contract surface)

## Test/Eval Approach
- Primary: node skills/web-video-presentation/scripts/eval-web-video.mjs --level=L3 --fixture=short-article
- Regression: keep L0 and L2 chapter-contract-basic passing.

## Risks & Rollback
- Risk: L3 accidentally becomes non-deterministic (timestamps, random IDs, filesystem ordering). Mitigation: normalize ordering, seed randomness, strip timestamps from evidence.
- Risk: L3 adds heavy deps or long runtime. Mitigation: restrict to lightweight checks and reuse existing parsing helpers.
- Rollback by reverting runL3 changes and any fixture tweaks; L3 can be gated behind minimal checks until stabilized.

## Implementation Sketch
- Extend runL3(opts) in eval-web-video.mjs to load the fixture article, generate a minimal outline+chapter scaffolding in-memory, and run a bounded set of checks: fixture present, non-empty content, outline structure sanity, and chapter artifact contract on the generated/fixture-provided chapter directory.
- Ensure all evidence fields are stable and ordered (sort lists).
