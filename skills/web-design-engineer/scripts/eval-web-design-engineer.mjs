#!/usr/bin/env node

/**
 * eval-web-design-engineer.mjs - Static quality checks for web-design-engineer skill
 *
 * Levels:
 *   L0 - Static checks (file existence, SKILL.md reference integrity, manifest schema)
 *
 * Usage:
 *   node skills/web-design-engineer/scripts/eval-web-design-engineer.mjs --level=L0
 *   node skills/web-design-engineer/scripts/eval-web-design-engineer.mjs --level=L0 --out=.tmp/evals/web-design-engineer-l0.json
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__dirname, '..');
const SKILL_MD = join(SKILL_ROOT, 'SKILL.md');
const MANIFEST_JSON = join(SKILL_ROOT, 'manifest.json');
const SELF_IMPROVEMENT_MD = join(SKILL_ROOT, 'SELF-IMPROVEMENT.md');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  const parts = argv.slice(2);
  for (let i = 0; i < parts.length; i++) {
    const arg = parts[i];
    if (!arg.startsWith('--')) continue;
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
  return {
    level: (args.level || 'L0').toUpperCase(),
    out: args.out || null,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

function isSemverish(v) {
  return typeof v === 'string' && /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(v);
}

function ensureDirForFile(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function listReferencedReferencePaths(skillMdText) {
  const results = new Set();
  for (const match of skillMdText.matchAll(/`(references\/[^`\r\n]+?)`/g)) {
    results.add(match[1]);
  }
  return Array.from(results).sort();
}

// ---------------------------------------------------------------------------
// L0 checks
// ---------------------------------------------------------------------------
function checkReferenceLinks() {
  if (!existsSync(SKILL_MD)) {
    return {
      pass: false,
      missing: ['SKILL.md'],
      checked: 0,
      total: 0,
      broken: [],
    };
  }

  const skillMdText = readText(SKILL_MD);
  const paths = listReferencedReferencePaths(skillMdText);
  const broken = [];
  for (const rel of paths) {
    const abs = join(SKILL_ROOT, rel);
    if (!existsSync(abs)) broken.push(rel);
  }

  return {
    pass: broken.length === 0,
    checked: paths.length - broken.length,
    total: paths.length,
    broken,
  };
}

function checkSelfImprovementExists() {
  return {
    pass: existsSync(SELF_IMPROVEMENT_MD),
    file: 'SELF-IMPROVEMENT.md',
  };
}

function checkManifestSchema() {
  if (!existsSync(MANIFEST_JSON)) {
    return { pass: false, file: 'manifest.json', missing: ['manifest.json'] };
  }

  const manifest = readJson(MANIFEST_JSON);
  if (!manifest || typeof manifest !== 'object') {
    return { pass: false, file: 'manifest.json', error: 'invalid_json' };
  }

  const missing = [];
  if (typeof manifest.name !== 'string' || manifest.name.trim() === '') missing.push('name');
  if (!isSemverish(manifest.version)) missing.push('version');
  if (typeof manifest.description !== 'string' || manifest.description.trim() === '') missing.push('description');
  if (!Array.isArray(manifest.compat) || manifest.compat.length === 0 || manifest.compat.some(x => typeof x !== 'string')) {
    missing.push('compat');
  }

  return {
    pass: missing.length === 0,
    file: 'manifest.json',
    name: manifest.name,
    version: manifest.version,
    missing,
  };
}

function runL0() {
  const evidence = {
    'references-links': checkReferenceLinks(),
    'manifest-schema': checkManifestSchema(),
    'self-improvement-exists': checkSelfImprovementExists(),
  };

  const failures = [];
  for (const [k, v] of Object.entries(evidence)) {
    if (!v || v.pass !== true) failures.push(k);
  }

  return {
    pass: failures.length === 0,
    score: failures.length === 0 ? 1 : 0,
    level: 'L0',
    failures,
    evidence,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const args = parseArgs(process.argv);

  let result;
  if (args.level === 'L0') {
    result = runL0();
  } else {
    result = {
      pass: false,
      score: 0,
      level: args.level,
      failures: [`Unsupported level: ${args.level}`],
      evidence: {},
      timestamp: new Date().toISOString(),
    };
  }

  const json = JSON.stringify(result, null, 2);
  if (args.out) {
    const outPath = resolve(args.out);
    ensureDirForFile(outPath);
    writeFileSync(outPath, json + '\n', 'utf-8');
  }
  process.stdout.write(json + '\n');
  process.exit(result.pass ? 0 : 1);
}

main();

