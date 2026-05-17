intent:
  Add a fast, deterministic L0 static eval for web-design-engineer and introduce SELF-IMPROVEMENT.md so the skill can be iterated safely.

scope:
  - Add skills/web-design-engineer/SELF-IMPROVEMENT.md with self-improvement protocol and guardrails.
  - Add skills/web-design-engineer/scripts/eval-web-design-engineer.mjs implementing L0 checks:
      * Verify references/* paths referenced from SKILL.md exist.
      * Validate manifest.json basic schema (required keys, types, semver-ish version).
      * Verify SELF-IMPROVEMENT.md exists.
  - (Optional) Add skills/web-design-engineer/evals/README.md documenting eval levels and commands.

likely_files:
  - skills/web-design-engineer/SELF-IMPROVEMENT.md
  - skills/web-design-engineer/scripts/eval-web-design-engineer.mjs
  - skills/web-design-engineer/evals/README.md

test_eval_approach:
  - Run: node skills/web-design-engineer/scripts/eval-web-design-engineer.mjs --level=L0
  - Verify SELF-IMPROVEMENT.md existence check passes.

risks_and_rollback:
  - Risk: overly strict manifest schema check causes false failures. Mitigate by keeping schema minimal and documenting failures.
  - Rollback: revert added files and remove eval script.
