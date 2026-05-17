# T-0008: Implement L3 micro E2E eval for web-video-presentation

Task ID: T-0008
Goal ID: garden-skills-continuous-improvement
Head SHA: 16d46e6c3d982b98ce33a6fd38bbe6f0b25b0882

## Summary
- Replaces the L3 eval stub with a deterministic fixture-to-contract smoke check.
- Reads the short-article fixture, derives stable script and outline structures, and reuses the L2 chapter artifact contract fixture.
- Keeps the eval local-only: no network, credentials, temporary app install, or browser runtime.

## DoD Results
- PASS: 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L3 --fixture=short-article
- PASS: 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L0
- PASS: 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L2 --case=skills/web-video-presentation/evals/cases/chapter-contract-basic.json
- PASS: 
ode skills/web-video-presentation/scripts/eval-web-video.mjs --level=L3 --fixture=__missing__ exits 1 as expected
- PASS: review report first line APPROVED
- PASS: QA report first line SMOKE_OK

## Review
- Verdict: APPROVED
- Report: .team/scratch/T-0008/gstack-review.md

## QA/Eval
- Verdict: SMOKE_OK
- Report: .team/scratch/T-0008/gstack-qa.md

## Diff Stat vs Local Main
`	ext
 .../scripts/eval-web-video.mjs                     | 96 ++++++++++++++++++++--
 1 file changed, 91 insertions(+), 5 deletions(-)
`

## Known Limitations
- L3 is a micro E2E smoke, not a full app scaffold/browser render.
- Only one short article fixture is covered in this task.

## PR Status Note
This PR should be draft and await human review. Automation could not safely open the draft PR in AILatentspace1/garden-skills because that repository's main currently points at this same task commit ($forkMainSha), making the fork PR diff empty. Upstream ConardLi/garden-skills main is $upstreamMainSha.
