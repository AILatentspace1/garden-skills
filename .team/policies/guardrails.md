# Team Guardrails

## Goal alignment
NORTH STAR: optimize the 4 skills under `skills/`. Any change outside this scope is out of bounds.

## File whitelist (only these may be modified by team-engineer)
- `skills/**` — all files inside the 4 skill directories

## File blacklist (NEVER touch)
- Any path listed in `.gitignore` (including unfinished R&D dirs: `langchain-agent-*/`, `anthropic-harness-video/`)
- `.github/workflows/`, `.git/`, `scripts/release/`, `scripts/**`
- Root `package.json`, `pnpm-lock.yaml`, all root config files
- `.team/`, `.claude/`
- Any file listed in `board.tasks[task_id].do_not_touch` (injected by orchestrator from `git status -s`)

## Command blacklist (intercepted by `.claude/hooks/guard-no-merge.ps1`)
- `git push origin main` / `git push origin master`
- `git push --force` / `git push --force-with-lease`
- `git merge`, `git rebase main`
- `gh pr merge`
- `gh pr create` without `--draft`

The hook returns exit 2 to block. If for any reason the hook is not inherited by a
subagent session, every subagent has a `Self-guard` section in its prompt as a soft
fallback. **Do not rely solely on the soft-guard** — if you see `soft_guard_enabled: true`
in `board.json` it means hook inheritance failed and the system is in degraded mode.

## Branch policy
- All team branches must be named `team/T-<id>-<slug>`
- Branches are pushed only after DoD passes (orchestrator does the push, not subagents)
- PRs are always opened as draft; humans review and merge

## Escalation
- Blocked tasks land in `board.tasks[].state = 'blocked'`
- If escalation is enabled, may run: `gh issue create --title "[team-bot] <title>" --label team-bot`
- Team NEVER closes its own escalation issues; humans do
- Team NEVER comments on issues / PRs (in v1) to avoid noise

## Resumability
- Every subagent writes a `last_updated_at: <ISO>` line as the 2nd line of its scratch output
- Every subagent appends progress to `.team/scratch/<task_id>/<role>.md` (append-only journal)
- The orchestrator does an atomic `board.json.tmp` → rename on every state transition
