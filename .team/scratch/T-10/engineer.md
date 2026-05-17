PROGRESSED:2commits
last_updated_at: 2026-05-16T12:01:30+08:00
branch: team/T-10-self-improvement-md

## Progress

1. Created branch `team/T-10-self-improvement-md` from main
2. Cherry-picked T-7 commit (evals directory + eval-web-video.mjs) as dependency
3. Created `skills/web-video-presentation/SELF-IMPROVEMENT.md` with:
   - Episode declaration fields (minimum_eval_level, full_run_required, scope)
   - L0-L4 level descriptions with scope/speed/dependencies
   - L4 full-e2e definition (manual trigger only, covers Phase 1-4, no npm run validate)
   - Scope definitions with sync rules (.agents, .claude, evidence requirements)
   - Daily defaults table (L0-L4 per change type)
   - Episode lifecycle protocol
4. Updated `eval-web-video.mjs` checkSelfImprovement() to hard-check:
   - File must exist (no longer soft-passes)
   - Must contain: minimum_eval_level, scope, full_run_required, level descriptions
   - Renamed check key from `self-improvement-exists` to `self-improvement-content`

## DoD Verification

- [x] `test -f skills/web-video-presentation/SELF-IMPROVEMENT.md` exits 0
- [x] File content contains `minimum_eval_level`
- [x] `node skills/web-video-presentation/scripts/eval-web-video.mjs --level=L0` exits 0 (pass: true, score: 1)
