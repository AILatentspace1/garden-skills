# Eval Framework for web-video-presentation

Automated quality checks for the web-video-presentation skill, organized by level.

## Levels

| Level | Name          | Scope                                     | Speed      | Dependencies |
|-------|---------------|-------------------------------------------|------------|--------------|
| L0    | Static        | File existence, link integrity, schema    | < 10s      | None         |
| L1    | Plan/Trigger  | Phase 1 plan generation & checkpoint      | < 60s      | L0           |
| L2    | Artifact      | Chapter + audio contract validation       | < 120s     | L1           |
| L3    | Micro E2E     | Scaffold + 1 chapter + typecheck + smoke  | < 300s     | L2, pnpm     |
| L4    | Full E2E      | Complete Phase 1-4 pipeline (manual)      | Minutes    | L3           |

## Usage

```bash
# Run L0 static checks (default)
node skills/web-video-presentation/scripts/eval-web-video.mjs --level=L0

# Run with a specific fixture target
node skills/web-video-presentation/scripts/eval-web-video.mjs --level=L2 --target=evals/fixtures/chapter-basic

# Run a named fixture
node skills/web-video-presentation/scripts/eval-web-video.mjs --level=L3 --fixture=short-article

# Write output to file
node skills/web-video-presentation/scripts/eval-web-video.mjs --level=L0 --out=.tmp/evals/l0.json
```

## Output Format

All levels produce stable JSON to stdout:

```json
{
  "pass": true,
  "score": 1.0,
  "level": "L0",
  "failures": [],
  "evidence": {
    "references-links": { "pass": true, "checked": 7, "broken": 0 },
    "self-improvement-exists": { "pass": true, "note": "T-10 dependency" },
    "theme-json-schema": { "pass": true, "themes_checked": 10 },
    "templates-completeness": { "pass": true, "missing": [] }
  },
  "timestamp": "2026-05-16T12:00:00.000Z"
}
```

- `pass`: Overall pass/fail boolean
- `score`: 0.0 - 1.0, proportion of checks that passed
- `failures`: Array of failure descriptions (empty when pass=true)
- `evidence`: Per-check details for debugging
- Exit code: 0 if pass, 1 if any failure

## L0 Checks (4 checks)

1. **references-links**: All `references/*.md` links in SKILL.md resolve to existing files
2. **self-improvement-exists**: SELF-IMPROVEMENT.md exists (soft-pass if absent, T-10 dependency)
3. **theme-json-schema**: Every `themes/*/theme.json` has required fields (id, nameZh, descriptionZh, bestFor, mood)
4. **templates-completeness**: All required template files exist (hooks, components, registry, styles, config)

## Directory Layout

```
evals/
  README.md              <- This file
  cases/
    phase1-short-article.json      <- L1 case definition
    chapter-contract-basic.json    <- L2 case definition
    audio-contract-basic.json      <- L2 case definition
  fixtures/
    short-article/
      article.md       <- Short Chinese tech article (~180 chars)
    chapter-basic/
      article.md       <- Design Token article
      script.md        <- Oral script with markers
      outline.md       <- Outline with chapters + info pool
scripts/
  eval-web-video.mjs   <- Eval runner (L0 implemented, L1-L3 stubs)
```

## Adding New Fixtures

1. Create a directory under `evals/fixtures/<fixture-name>/`
2. Add input files (article.md minimum)
3. Create a case JSON in `evals/cases/<level>-<name>.json`
4. Reference the fixture path in the case JSON

## Adding New Checks

1. Add the check function in `scripts/eval-web-video.mjs`
2. Register it in the appropriate level's check list
3. Add corresponding DoD entry in board.json
