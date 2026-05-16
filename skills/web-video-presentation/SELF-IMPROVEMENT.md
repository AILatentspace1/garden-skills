# Self-Improvement Protocol

This file governs all automated self-improvement episodes for the web-video-presentation
skill. Every episode must declare its eval level, scope, and run requirements before
proceeding.

---

## Episode Declaration

Each self-improvement episode must specify the following fields upfront:

| Field                 | Type    | Required | Description |
|-----------------------|---------|----------|-------------|
| `minimum_eval_level`  | L0-L4   | Yes      | Lowest eval level that must pass for the episode to be considered successful |
| `full_run_required`   | boolean | Yes      | Whether a full pipeline run is required (true for L4, false otherwise) |
| `scope`               | enum    | Yes      | One of: `domain`, `artifact-contract`, `project`, `runtime-codex`, `runtime-claude`, `model-specific` |

---

## Eval Levels

### L0 — Static Checks (default minimum)

Fast, no external dependencies. Covers:

- File existence: all `references/*.md` links in SKILL.md resolve
- SELF-IMPROVEMENT.md exists and contains required fields
- Theme schema: every `themes/*/theme.json` has required fields (`id`, `nameZh`, `descriptionZh`, `bestFor`, `mood`)
- Templates completeness: all required template files exist (hooks, components, registry, styles, config)

**Speed**: < 10s
**Default**: This is the default `minimum_eval_level` for routine self-improvement episodes.

### L1 — Plan/Trigger Checks

Validates Phase 1 output structure:

- Input parsing: article.md or user prompt correctly categorized
- Phase 1 output structure: `script.md` and `outline.md` both produced
- `script.md` format: B-station oral style markers present
- `outline.md` format: chapters, steps, info pools, no-animation rule

**Speed**: < 60s
**Dependency**: L0 must pass first

### L2 — Artifact Contract Checks

Validates produced artifacts against the skill's contract rules:

- `narrations.ts` exists for every chapter and `narrations.length === max_step + 1`
- CSS files contain no hardcoded hex/rgb/font-family values (must use theme tokens)
- `outline.md` has no animation directives (outline must not prescribe animations)
- `script.md` structure matches checkpoint requirements
- Chapter directories contain `.tsx`, `.css`, and `narrations.ts`

**Speed**: < 120s
**Dependency**: L1 must pass first

### L3 — Micro E2E

Runs a minimal end-to-end pipeline:

- Scaffold a temp Vite project with the skill's template
- Inject 1 fixture chapter with 3-5 steps
- Run `npx tsc --noEmit` (typecheck passes)
- Optional: Playwright smoke (open 1 viewport, check stage non-empty, 16:9 ratio, no white screen)

**Speed**: < 300s
**Dependency**: L2 must pass first, `pnpm` available
**Note**: No real TTS, no full video recording.

### L4 — Full E2E

Complete pipeline validation. **Manual trigger only** — never included in `npm run validate`
or any automated CI gate.

Covers:

1. **Full Phase 1**: Given a real article, produce `script.md` + `outline.md`, verify format
2. **First chapter acceptance**: Scaffold + implement chapter 1, verify against CHAPTER-CRAFT.md self-check
3. **All chapters typecheck**: Scaffold + all chapters, `npx tsc --noEmit` passes
4. **Audio extraction**: `npm run extract-narrations` produces valid `audio-segments.json`
5. **Browser smoke**: Dev server starts, pages render, no console errors, 16:9 layout

**Real TTS / recording** = optional human acceptance gate, NOT a default CI gate.

**Speed**: Minutes
**Dependency**: L3 must pass first
**Trigger**: Human-initiated only. MUST NOT be in `npm run validate`.

---

## Scope Definitions

| Scope              | Sync Targets | Description |
|--------------------|--------------|-------------|
| `domain`           | `.agents`, `.claude` | Domain knowledge changes (methodology, design principles, workflow) |
| `artifact-contract` | `.agents`, `.claude` | Artifact format rules (file structure, naming conventions, schema) |
| `project`          | Local only   | Project-specific changes (theme updates, template tweaks) |
| `runtime-codex`    | `.agents` only | Changes specific to Codex runtime behavior |
| `runtime-claude`   | `.claude` only | Changes specific to Claude runtime behavior |
| `model-specific`   | Evidence required | Model-specific optimizations; must have corresponding runtime eval evidence from at least one runtime |

### Sync Rules

- `domain` and `artifact-contract` scopes can sync changes to both `.agents` and `.claude` configurations.
- `runtime-codex` changes may only sync to `.agents`.
- `runtime-claude` changes may only sync to `.claude`.
- `model-specific` changes require a corresponding runtime eval (either codex or claude) that demonstrates the optimization works. The episode must reference the evidence.

---

## Daily Defaults

| Change Type                        | Minimum Eval Level | Notes |
|------------------------------------|--------------------|-------|
| Routine self-improvement           | L0                 | Typo fixes, doc tweaks, minor clarifications |
| Artifact contract changes          | L2                 | Template updates, schema changes, rule additions |
| Major changes                      | L3                 | Workflow restructuring, new phases, scaffold changes |
| Release / cross-runtime sync       | L4                 | Full pipeline validation before release |
| Model-specific tuning              | L3 + runtime evidence | Must include runtime eval results |

**Rule of thumb**: If a change could break the scaffold, templates, or Phase 1 output, run at least L2. If it could break the build, run L3.

---

## Episode Lifecycle

```
1. Declare episode (minimum_eval_level, scope, full_run_required)
2. Run eval at declared level
3. If eval fails -> fix and re-eval (no forward progress until pass)
4. Apply the self-improvement change
5. Re-run eval to confirm no regression
6. Record results and evidence
```
