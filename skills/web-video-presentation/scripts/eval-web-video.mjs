#!/usr/bin/env node

/**
 * eval-web-video.mjs - Static quality checks for web-video-presentation skill
 *
 * Levels:
 *   L0 - Static checks (file existence, link integrity, schema validation)
 *   L1 - Plan/trigger checks (stub)
 *   L2 - Artifact contract checks (stub)
 *   L3 - Micro E2E checks (stub)
 *   L4 - Full E2E checks (manual only, not implemented here)
 *
 * Usage:
 *   node eval-web-video.mjs --level=L0
 *   node eval-web-video.mjs --level=L0 --out=result.json
 *   node eval-web-video.mjs --level=L2 --target=evals/fixtures/chapter-basic
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__dirname, '..');
const SKILL_MD = join(SKILL_ROOT, 'SKILL.md');
const THEMES_DIR = join(SKILL_ROOT, 'themes');
const TEMPLATES_DIR = join(SKILL_ROOT, 'templates');
const SELF_IMPROVEMENT_MD = join(SKILL_ROOT, 'SELF-IMPROVEMENT.md');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      args[key] = rest.join('=') || true;
    }
  }
  return {
    level: (args.level || 'L0').toUpperCase(),
    target: args.target || null,
    fixture: args.fixture || null,
    out: args.out || null,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fileExists(p) {
  return existsSync(p);
}

function readText(p) {
  return readFileSync(p, 'utf-8');
}

function readJson(p) {
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// L0 Check 1: references-links
// ---------------------------------------------------------------------------
function checkReferencesLinks() {
  const skillContent = readText(SKILL_MD);

  // Match markdown links: ](references/XXX.md)
  const linkPattern = /\]\(references\/([^\s\)]+\.md)\)/g;
  // Match bare paths: references/XXX.md (in tables, code blocks, etc.)
  const barePattern = /references\/([^\s\)`\]]+\.md)/g;

  const refFiles = new Set();

  let match;
  while ((match = linkPattern.exec(skillContent)) !== null) {
    refFiles.add(match[1]);
  }
  while ((match = barePattern.exec(skillContent)) !== null) {
    refFiles.add(match[1]);
  }

  const checked = [];
  const broken = [];

  for (const file of refFiles) {
    const fullPath = join(SKILL_ROOT, 'references', file);
    checked.push(file);
    if (!fileExists(fullPath)) {
      broken.push(file);
    }
  }

  return {
    pass: broken.length === 0,
    checked: checked.length,
    total: refFiles.size,
    broken,
    brokenPaths: broken.map(f => join('references', f)),
  };
}

// ---------------------------------------------------------------------------
// L0 Check 2: self-improvement-exists
// ---------------------------------------------------------------------------
function checkSelfImprovement() {
  if (!fileExists(SELF_IMPROVEMENT_MD)) {
    return {
      pass: false,
      fileExists: false,
      error: 'SELF-IMPROVEMENT.md is required (see skill self-improvement protocol)',
    };
  }

  const content = readText(SELF_IMPROVEMENT_MD);

  // Required structural markers
  const hasMinLevel = content.includes('minimum_eval_level');
  const hasScope = content.includes('scope');
  const hasFullRun = content.includes('full_run_required');
  const hasLevelDescriptions = /L[0-4]/.test(content);

  // Required content sections
  const missing = [];
  if (!hasMinLevel) missing.push('minimum_eval_level');
  if (!hasScope) missing.push('scope');
  if (!hasFullRun) missing.push('full_run_required');
  if (!hasLevelDescriptions) missing.push('level descriptions (L0-L4)');

  return {
    pass: missing.length === 0,
    fileExists: true,
    hasMinLevel,
    hasScope,
    hasFullRun,
    hasLevelDescriptions,
    missing,
    note: missing.length === 0
      ? 'SELF-IMPROVEMENT.md present with all required fields'
      : `SELF-IMPROVEMENT.md missing required fields: ${missing.join(', ')}`,
  };
}

// ---------------------------------------------------------------------------
// L0 Check 3: theme-json-schema
// ---------------------------------------------------------------------------
function checkThemeJsonSchema() {
  const requiredFields = ['id', 'nameZh', 'descriptionZh', 'bestFor', 'mood'];

  let themeDirs;
  try {
    themeDirs = readdirSync(THEMES_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch {
    return {
      pass: false,
      themesChecked: 0,
      error: 'Cannot read themes/ directory',
    };
  }

  const themes = [];
  let allPass = true;

  for (const themeName of themeDirs) {
    const themeJsonPath = join(THEMES_DIR, themeName, 'theme.json');
    if (!fileExists(themeJsonPath)) {
      themes.push({ theme: themeName, pass: false, error: 'theme.json missing' });
      allPass = false;
      continue;
    }

    const themeJson = readJson(themeJsonPath);
    if (themeJson === null) {
      themes.push({ theme: themeName, pass: false, error: 'theme.json parse error' });
      allPass = false;
      continue;
    }

    const missing = requiredFields.filter(f => !(f in themeJson));
    if (missing.length > 0) {
      themes.push({ theme: themeName, pass: false, missing });
      allPass = false;
    } else {
      themes.push({ theme: themeName, pass: true });
    }
  }

  return {
    pass: allPass,
    themesChecked: themeDirs.length,
    themes,
  };
}

// ---------------------------------------------------------------------------
// L0 Check 4: templates-completeness
// ---------------------------------------------------------------------------
function checkTemplatesCompleteness() {
  const requiredFiles = [
    // scripts
    'scripts/extract-narrations.ts',
    // hooks
    'src/hooks/useStepper.ts',
    'src/hooks/useAutoMode.ts',
    'src/hooks/useAudioPlayer.ts',
    'src/hooks/useStageScale.ts',
    // components
    'src/components/Stage.tsx',
    'src/components/ProgressBar.tsx',
    'src/components/AutoStartGate.tsx',
    'src/components/AutoToggle.tsx',
    'src/components/MaskReveal.tsx',
    // registry
    'src/registry/types.ts',
    'src/registry/chapters.ts',
    // core
    'src/App.tsx',
    'src/main.tsx',
    // styles
    'src/styles/base.css',
    'src/styles/animations.css',
    'src/styles/fonts.css',
    // config
    'vite.config.ts',
    'index.html',
  ];

  const missing = [];
  for (const file of requiredFiles) {
    const fullPath = join(TEMPLATES_DIR, file);
    if (!fileExists(fullPath)) {
      missing.push(file);
    }
  }

  return {
    pass: missing.length === 0,
    required: requiredFiles.length,
    missing,
  };
}

// ---------------------------------------------------------------------------
// Level runners
// ---------------------------------------------------------------------------
function runL0(_opts) {
  const evidence = {};

  evidence['references-links'] = checkReferencesLinks();
  evidence['self-improvement-exists'] = checkSelfImprovement();
  evidence['theme-json-schema'] = checkThemeJsonSchema();
  evidence['templates-completeness'] = checkTemplatesCompleteness();

  const failures = [];
  for (const [name, result] of Object.entries(evidence)) {
    if (!result.pass) {
      failures.push(`${name}: ${JSON.stringify(result.broken || result.missing || result.error || 'failed')}`);
    }
  }

  return { evidence, failures };
}

function runL1(_opts) {
  return {
    evidence: { note: 'L1 checks not yet implemented (T-8)' },
    failures: ['L1 checks not yet implemented'],
  };
}

function runL2(_opts) {
  return {
    evidence: { note: 'L2 checks not yet implemented (T-8)' },
    failures: ['L2 checks not yet implemented'],
  };
}

function runL3(_opts) {
  return {
    evidence: { note: 'L3 checks not yet implemented (T-9)' },
    failures: ['L3 checks not yet implemented'],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const opts = parseArgs(process.argv);

  const runners = {
    L0: runL0,
    L1: runL1,
    L2: runL2,
    L3: runL3,
  };

  const runner = runners[opts.level];
  if (!runner) {
    const output = {
      pass: false,
      score: 0,
      level: opts.level,
      failures: [`Unknown level: ${opts.level}`],
      evidence: {},
      timestamp: new Date().toISOString(),
    };
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
    process.exit(1);
  }

  const { evidence, failures } = runner(opts);

  const totalChecks = Object.keys(evidence).length;
  const passedChecks = Object.values(evidence).filter(r => r.pass === true).length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) / 100 : 0;
  const pass = failures.length === 0;

  const output = {
    pass,
    score,
    level: opts.level,
    failures,
    evidence,
    timestamp: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(output, null, 2) + '\n';

  process.stdout.write(jsonStr);

  if (opts.out) {
    const outPath = resolve(opts.out);
    const outDir = dirname(outPath);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, jsonStr, 'utf-8');
  }

  process.exit(pass ? 0 : 1);
}

main();
