PLAN_READY
Goal: extend skills/web-video-presentation eval coverage from L0 static checks to objective L1 plan/trigger checks and L2 artifact contract checks.

Implementation slice for next engineer run:
1. Add an L1 JSON case fixture at skills/web-video-presentation/evals/cases/phase1-short-article.json with input article metadata, expected phase/checkpoint fields, and expected result shape: pass, score, failures, evidence.
2. Extend skills/web-video-presentation/scripts/eval-web-video.mjs with --level=L1 and --case support. Validate the case schema and return nonzero for malformed cases or failed expected checks.
3. Add L2 good fixture skills/web-video-presentation/evals/fixtures/chapter-basic containing script.md, outline.md, chapter files, CSS, and narrations.ts that satisfy the artifact contract.
4. Add L2 bad fixture skills/web-video-presentation/evals/fixtures/chapter-invalid with intentional contract violations, and make the L2 runner exit 1 when those violations are detected.
5. Implement L2 contract checks for script.md structure, outline no-animation rule, chapter .tsx/.css/narrations.ts existence, narrations length matching max_step + 1, CSS token discipline, and chapter visual-surface evidence.
6. Keep changes inside skills/web-video-presentation plus .team scratch/board state.

Risk notes: do not introduce real TTS, browser rendering, or full video generation in T-8; those belong to later L3/L4 tasks.
