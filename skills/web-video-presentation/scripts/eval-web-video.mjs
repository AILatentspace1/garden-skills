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
  const parts = argv.slice(2);
  for (let i = 0; i < parts.length; i++) {
    const arg = parts[i];
    if (arg.startsWith('--')) {
      const [key, ...rest] = arg.slice(2).split('=');
      if (rest.length > 0) {
        args[key] = rest.join('=');
      } else if (parts[i + 1] && !parts[i + 1].startsWith('--')) {
        args[key] = parts[i + 1];
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return {
    level: (args.level || 'L0').toUpperCase(),
    case: args.case || null,
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

function resolveSkillPath(inputPath) {
  if (!inputPath) return null;
  const direct = resolve(inputPath);
  if (fileExists(direct)) return direct;
  return resolve(SKILL_ROOT, inputPath);
}

function listFiles(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function countNarrations(source) {
  const match = source.match(/(?:export\s+(?:default\s+)?(?:const\s+)?)?narrations\s*(?::[^=]+)?=\s*\[([\s\S]*?)\]\s*(?:as\s+const)?\s*;?/);
  if (!match) return null;
  const body = match[1].trim();
  if (body === '') return 0;
  const strings = body.match(/(["'`])(?:\\.|(?!\1)[\s\S])*\1/g);
  return strings ? strings.length : null;
}

function maxStep(source) {
  const steps = [];
  for (const match of source.matchAll(/\bstep\s*(?:={2,3}|[<>]=?)\s*(\d+)\b/g)) {
    steps.push(Number(match[1]));
  }
  return steps.length > 0 ? Math.max(...steps) : 0;
}

function relativeSkillPath(p) {
  return p.replace(SKILL_ROOT + '\\', '').replace(SKILL_ROOT + '/', '').replaceAll('\\', '/');
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

function runL1(opts) {
  const casePath = resolveSkillPath(opts.case || 'evals/cases/phase1-short-article.json');
  const evidence = {};
  const failures = [];

  if (!fileExists(casePath)) {
    return {
      evidence: { case: { pass: false, path: opts.case || 'evals/cases/phase1-short-article.json' } },
      failures: ['L1 case file not found'],
    };
  }

  const testCase = readJson(casePath);
  if (!testCase) {
    return {
      evidence: { case: { pass: false, path: relativeSkillPath(casePath) } },
      failures: ['L1 case JSON parse failed'],
    };
  }

  const fixturePath = resolve(SKILL_ROOT, 'evals', testCase.fixture || '');
  const articlePath = join(fixturePath, 'article.md');
  const expected = testCase.expected || {};

  evidence.case = {
    pass: testCase.level === 'L1'
      && expected.phase === 'phase1'
      && Array.isArray(expected.outputs)
      && expected.outputs.includes('script.md')
      && expected.outputs.includes('outline.md'),
    id: testCase.id,
    path: relativeSkillPath(casePath),
    fixture: testCase.fixture,
  };
  if (!evidence.case.pass) {
    failures.push('L1 case must describe phase1 script.md + outline.md outputs');
  }

  evidence.fixture = {
    pass: fileExists(articlePath),
    article: relativeSkillPath(articlePath),
  };
  if (!evidence.fixture.pass) {
    failures.push('L1 fixture must include article.md');
  }

  evidence.trigger = {
    pass: expected.script_constraints?.has_markers === true
      && expected.outline_constraints?.has_chapters === true
      && expected.outline_constraints?.no_animation_descriptions === true
      && expected.outline_constraints?.has_info_pool === true,
    checkpoint: 'Checkpoint Plan',
  };
  if (!evidence.trigger.pass) {
    failures.push('L1 expected constraints must cover script markers, chapters, no-animation outline, and info pool');
  }

  return { evidence, failures };
}

function runL2(opts) {
  const target = resolveSkillPath(opts.target || 'evals/fixtures/chapter-basic');
  const evidence = {};
  const failures = [];

  if (!fileExists(target)) {
    return {
      evidence: { target: { pass: false, path: opts.target || 'evals/fixtures/chapter-basic' } },
      failures: ['L2 target fixture not found'],
    };
  }

  const scriptPath = join(target, 'script.md');
  const outlinePath = join(target, 'outline.md');
  const chapterRoot = join(target, 'src', 'chapters');
  const chapterDirs = listFiles(chapterRoot)
    .filter(d => d.isDirectory())
    .map(d => join(chapterRoot, d.name));

  evidence.script = {
    pass: fileExists(scriptPath) && /^#\s+/m.test(readText(scriptPath)) && /^##\s+/m.test(readText(scriptPath)),
    path: relativeSkillPath(scriptPath),
  };
  if (!evidence.script.pass) {
    failures.push('L2 fixture must include script.md with title and section headings');
  }

  const outline = fileExists(outlinePath) ? readText(outlinePath) : '';
  evidence.outline = {
    pass: fileExists(outlinePath)
      && /^##\s+/m.test(outline)
      && /info_pool:/m.test(outline)
      && !/\b(animation|animate|transition|fade|wipe|blur|spring|easing)\b/i.test(outline),
    path: relativeSkillPath(outlinePath),
  };
  if (!evidence.outline.pass) {
    failures.push('L2 fixture outline.md must include chapters/info_pool and avoid animation prescriptions');
  }

  evidence.chapterDirectories = {
    pass: chapterDirs.length > 0,
    count: chapterDirs.length,
  };
  if (chapterDirs.length === 0) {
    failures.push('L2 fixture must include src/chapters/<chapter>');
  }

  evidence.chapters = [];
  for (const chapterDir of chapterDirs) {
    const files = listFiles(chapterDir).filter(f => f.isFile()).map(f => f.name);
    const tsxFile = files.find(f => f.endsWith('.tsx'));
    const cssFile = files.find(f => f.endsWith('.css'));
    const narrationsPath = join(chapterDir, 'narrations.ts');
    const item = {
      path: relativeSkillPath(chapterDir),
      chapter_tsx: Boolean(tsxFile),
      chapter_css: Boolean(cssFile),
      narrations_ts: fileExists(narrationsPath),
      pass: true,
    };

    if (!tsxFile || !cssFile || !fileExists(narrationsPath)) {
      item.pass = false;
      evidence.chapters.push(item);
      failures.push(`${relativeSkillPath(chapterDir)} must contain .tsx, .css, and narrations.ts`);
      continue;
    }

    const tsx = readText(join(chapterDir, tsxFile));
    const css = readText(join(chapterDir, cssFile));
    const narrations = readText(narrationsPath);
    const narrationCount = countNarrations(narrations);
    const expectedNarrations = maxStep(tsx) + 1;

    item.narrations_match_max_step = narrationCount === expectedNarrations;
    item.no_empty_narrations = !/["'`]\s*["'`]/.test(narrations);
    item.no_hardcoded_hex = !/#[0-9a-f]{3,8}\b/i.test(css);
    item.no_hardcoded_rgb = !/rgba?\s*\(/i.test(css);
    item.no_hardcoded_font_family = !/\bfont-family\s*:/i.test(css);
    item.uses_design_tokens = /var\(--/.test(css);
    item.has_visual_elements = /(<svg\b|<canvas\b|<img\b|data-visual|Chart|Diagram|className=)/.test(tsx);
    item.pass = item.narrations_match_max_step
      && item.no_empty_narrations
      && item.no_hardcoded_hex
      && item.no_hardcoded_rgb
      && item.no_hardcoded_font_family
      && item.uses_design_tokens
      && item.has_visual_elements;

    if (!item.pass) {
      failures.push(`${relativeSkillPath(chapterDir)} violates chapter artifact contract`);
    }
    evidence.chapters.push(item);
  }

  return { evidence, failures };
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
  const passedChecks = Object.values(evidence).filter(r => r.pass !== false).length;
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
