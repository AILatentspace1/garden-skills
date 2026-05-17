PLAN_READY
last_updated_at: 2026-05-16T12:00:00+08:00

## Scope

9 new files under `skills/web-video-presentation/`:
1. evals/README.md
2. evals/cases/phase1-short-article.json
3. evals/cases/chapter-contract-basic.json
4. evals/cases/audio-contract-basic.json
5. evals/fixtures/short-article/article.md
6. evals/fixtures/chapter-basic/article.md
7. evals/fixtures/chapter-basic/script.md
8. evals/fixtures/chapter-basic/outline.md
9. scripts/eval-web-video.mjs

## Steps

### Step 1: Create evals/ directory structure and README.md

### Step 2: Create fixture files (short-article + chapter-basic)

### Step 3: Create case JSON files (L1/L2 schemas, L0 uses cases dir for structure)

### Step 4: Create scripts/eval-web-video.mjs with L0 checks:
- Check 1: references-links — verify all references/*.md links in SKILL.md exist
- Check 2: self-improvement-exists — soft-pass if absent (T-10 dependency)
- Check 3: theme-json-schema — verify id/nameZh/descriptionZh/bestFor/mood
- Check 4: templates-completeness — verify hooks, components, registry, core files

### Edge cases
- SELF-IMPROVEMENT.md soft-pass for T-7 (created by T-10)
- Windows path handling via path.join()
- Theme discovery via readdir (not hardcoded list)
- JSON parse errors in theme.json caught and reported

See subagent output for full implementation details including script skeleton, fixture content, and case schemas.
