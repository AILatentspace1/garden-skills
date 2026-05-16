PROGRESSED:1
Implemented L1 case schema validation and L2 artifact contract checks in skills/web-video-presentation/scripts/eval-web-video.mjs.
Added L1 case fixture phase1-short-article.json.
Added L2 positive fixture chapter-basic and negative fixture chapter-invalid.
Verification:
- L1 case runner exits 0.
- L2 chapter-basic exits 0.
- L2 chapter-invalid exits 1 and reports expected failures.
