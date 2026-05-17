SMOKE_OK

# GStack QA: T-0008

## Affected Surfaces
- skills/web-video-presentation/scripts/eval-web-video.mjs
- CLI eval behavior for L3 and existing L0/L2 regressions.

## Commands
- 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L3 --fixture=short-article -> exit 0
- 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L0 -> exit 0
- 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L2 --case=skills/web-video-presentation/evals/cases/chapter-contract-basic.json -> exit 0
- 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L3 --fixture=__missing__ -> exit 1 (expected failure)

## Evidence
- L3 short-article passed and reported fixture/article/scriptDraft/outlineDraft/artifactContract evidence.
- L0 passed existing static checks.
- L2 chapter-contract-basic passed existing artifact contract checks.
- Missing L3 fixture failed with a clear fixture error and exit 1.

## Browser/UI QA
- NOT_APPLICABLE: this change affects a Node eval script only; no runnable UI surface changed.
