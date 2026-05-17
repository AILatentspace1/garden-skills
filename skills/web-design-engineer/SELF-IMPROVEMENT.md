# Self-Improvement Protocol

This file governs all automated self-improvement episodes for the `web-design-engineer`
skill. Every episode must declare its eval level, scope, and run requirements before
proceeding.

---

## Episode Declaration

Each self-improvement episode must specify the following fields upfront:

| Field                | Type    | Required | Description |
|---------------------|---------|----------|-------------|
| `minimum_eval_level` | L0-L4   | Yes      | Lowest eval level that must pass for the episode to be considered successful |
| `full_run_required`  | boolean | Yes      | Whether a full end-to-end run is required (true for L4, false otherwise) |
| `scope`              | enum    | Yes      | One of: `domain`, `artifact-contract`, `project`, `runtime-codex`, `runtime-claude`, `model-specific` |

---

## Eval Levels

### L0 — Static Checks (default minimum)

Fast, deterministic, no network. Covers:

- File existence: all `references/*.md` links in `SKILL.md` resolve
- `manifest.json` basic schema checks (required keys and types)
- `SELF-IMPROVEMENT.md` exists

**Speed**: < 10s  
**Default**: Use as the minimum for routine self-improvement.

### L1 — Output-Format Checks

Validates that common output artifacts are structurally sound (no rendering required):

- HTML contains required landmarks (`<main>`, reasonable heading structure)
- CSS has no obvious syntax errors and avoids hardcoded "template" placeholders
- Any referenced assets are present in the output folder

**Speed**: < 60s  
**Dependency**: L0 must pass first

### L2 — Contract Checks

Validates stronger, skill-specific contracts:

- Output matches the requested format (single-file HTML vs multi-file project)
- Links, images, and scripts referenced in generated HTML resolve locally
- Basic accessibility checks (missing `alt`, missing form labels) for relevant outputs

**Speed**: < 120s  
**Dependency**: L1 must pass first

### L3 — Micro E2E

Runs a minimal “open in browser” smoke where applicable:

- Generate a small artifact (e.g., a landing page)
- Open it locally and confirm it renders (no blank screen, no console errors)

**Speed**: < 300s  
**Dependency**: L2 must pass first

### L4 — Full E2E (manual trigger only)

Complete end-to-end validation. **Human-triggered only**.

Covers:

1. A full realistic prompt run
2. Validate output quality against the critique rubric
3. Browser QA across 2 viewports (desktop + mobile)

**Speed**: Minutes  
**Dependency**: L3 must pass first  
**Trigger**: Human-initiated only. MUST NOT be a default CI gate.

---

## Scope Definitions

| Scope               | Sync Targets | Description |
|---------------------|--------------|-------------|
| `domain`            | `.agents`, `.claude` | Domain knowledge changes (methodology, design principles, workflow) |
| `artifact-contract` | `.agents`, `.claude` | Artifact format rules (HTML/CSS structure, conventions, schemas) |
| `project`           | Local only   | Project-specific changes (examples, templates, references) |
| `runtime-codex`     | `.agents` only | Changes specific to Codex runtime behavior |
| `runtime-claude`    | `.claude` only | Changes specific to Claude runtime behavior |
| `model-specific`    | Evidence required | Model-specific optimizations; must reference eval evidence |

