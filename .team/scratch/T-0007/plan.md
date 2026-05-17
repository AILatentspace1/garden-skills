intent: Add L2 audio contract validation (audio-contract-basic) to web-video-presentation eval
scope: skills/** only; focus on web-video-presentation eval
likely files:
- skills/web-video-presentation/scripts/eval-web-video.mjs
- skills/web-video-presentation/evals/cases/audio-contract-basic.json
- skills/web-video-presentation/templates/extract-narrations.ts
test/eval: run DoD exec commands locally (node)
risks: fragile JSON parsing; rollback by reverting commit
rollback: git revert on task branch
