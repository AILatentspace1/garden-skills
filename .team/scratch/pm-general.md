SELECTED:T-10

last_updated_at: 2026-05-16T12:00:00.000000+08:00

## Signal Scan Results (Heartbeat #5)

### 1. Red CI on open PRs touching skills/**
- PR #6 (patch-1): files under `website/` -- SKIP (not skills/**)
- PR #4 (codex/...): files under `dist/gpt-image2-website/` -- SKIP (not skills/**, dist/ is forbidden)
- Both PRs have empty statusCheckRollup (no CI runs)
- **Signals found: 0**

### 2. Open issues with skill names
- `gh issue list` returned empty array
- **Signals found: 0**

### 3. TODO/FIXME inside skills/**
- grep returned no matches
- **Signals found: 0**

### 4. Manifest consistency (pnpm run validate)
- All 4 skills: gpt-image-2@1.0.3, kb-retriever@1.0.0, web-design-engineer@1.1.0, web-video-presentation@1.1.5 -- all "OK"
- readme:check failed but only for root READMEs (README.md, README.zh-CN.md, README.ja-JP.md) which are FORBIDDEN sources per guardrails
- **Signals found: 0**

### 5. README/CHANGELOG vs manifest version drift
- No CHANGELOG.md exists in any skills/*/ directory
- No version headers in any skills/*/README.md
- No drift detected
- **Signals found: 0**

## Board State
- Total tasks: 4 (T-7 merged, T-8/T-9/T-10 inbox)
- Inbox count: 3 / 20 cap
- Ignored signals: 0

## Task Selection Rationale

Selected **T-10** -- "Create SELF-IMPROVEMENT.md with eval level rules and L4 full-e2e definition for web-video-presentation".

Reasoning:
1. T-7 (merged) previously blocked T-10. Now unblocked.
2. T-10 is a small, self-contained task (single markdown file creation).
3. T-10 unblocks the self-improvement eval loop -- L0 check currently soft-passes on missing SELF-IMPROVEMENT.md.
4. T-8 and T-9 are larger tasks that depend on eval-web-video.mjs infrastructure from T-7; they can follow after T-10.
5. Priority scoring: T-10 has the clearest path to completion with lowest risk.

### T-10 Handoff Summary
- **Skill**: web-video-presentation
- **Action**: Create `skills/web-video-presentation/SELF-IMPROVEMENT.md`
- **Content requirements**:
  - Episode-level eval rules: `minimum_eval_level` (L0-L4), `full_run_required` (bool), `scope` enum
  - Sync rules: domain/artifact-contract sync to .agents AND .claude; runtime-codex only .agents; runtime-claude only .claude; model-specific requires runtime eval evidence
  - L4 full-e2e definition (manual trigger only, full Phase 1 + chapter acceptance + typechecks + audio extraction + browser smoke)
  - L4 must NOT be in `npm run validate` to avoid blocking releases
- **DoD**: file exists, contains `minimum_eval_level`, L0 passes, reviewer approves
- **Branch**: `team/T-10-create-self-improvement-md`
