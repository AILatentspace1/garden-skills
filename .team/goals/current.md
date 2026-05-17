# Goal: Garden Skills Continuous Improvement

## North Star

Continuously improve the skills in this repository using small, reviewable, eval-driven changes.

## Success Criteria

- New tasks are generated from this goal only when they can be completed as a small PR-sized slice.
- Every generated task has objective DoD checks and a clear quality gate.
- Heartbeat can execute one task at a time without asking for interactive decisions.
- Draft PRs include evidence from DoD, gstack-style review, and QA/eval results.
- Retro reports whether the generated tasks are moving this goal forward.

## Scope

Allowed:
- `skills/**`
- `.team/**`

Not allowed:
- Unrelated repo-wide refactors.
- Publishing, deployment, or release automation outside draft PR creation.
- Pushing to `origin`.
- Remote branch deletion.

## Task Generation Hints

- Prefer evals, self-checks, documentation, and reliability improvements.
- Prefer tasks that reduce future automation risk.
- Prefer tasks with deterministic local verification.
- Avoid tasks requiring unknown credentials, paid services, or long-running external systems.
- Avoid large cross-skill changes unless they are split into independent tasks.

## Planner Cadence

The planner may add up to 3 inbox tasks per run, only when active task count is below the board cap.
