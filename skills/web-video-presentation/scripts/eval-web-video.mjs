#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) continue;
    const [rawKey, inlineValue] = part.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
    } else if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
      args[rawKey] = argv[i + 1];
      i += 1;
    } else {
      args[rawKey] = true;
    }
  }
  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function rel(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/");
}

function result(level, pass, failures, evidence = []) {
  return {
    level,
    pass,
    score: pass ? 1 : 0,
    failures,
    evidence,
  };
}

function printAndExit(report) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(report.pass ? 0 : 1);
}

function requireString(value, name, failures) {
  if (typeof value !== "string" || value.trim() === "") {
    failures.push(`${name} must be a non-empty string`);
  }
}

function runL1(casePath) {
  const failures = [];
  const evidence = [];
  if (!casePath) {
    failures.push("--case is required for L1");
    return result("L1", false, failures, evidence);
  }
  if (!exists(casePath)) {
    failures.push(`case file does not exist: ${casePath}`);
    return result("L1", false, failures, evidence);
  }

  let data;
  try {
    data = readJson(casePath);
  } catch (error) {
    failures.push(`case JSON is invalid: ${error.message}`);
    return result("L1", false, failures, evidence);
  }

  requireString(data.id, "id", failures);
  if (!data.input || typeof data.input !== "object") {
    failures.push("input must be an object");
  } else {
    requireString(data.input.kind, "input.kind", failures);
    requireString(data.input.title, "input.title", failures);
    requireString(data.input.body, "input.body", failures);
  }
  requireString(data.expected_phase, "expected_phase", failures);
  requireString(data.expected_checkpoint, "expected_checkpoint", failures);
  if (!data.expected_result || typeof data.expected_result !== "object") {
    failures.push("expected_result must be an object");
  } else {
    for (const key of ["pass", "score", "failures", "evidence"]) {
      if (!(key in data.expected_result)) {
        failures.push(`expected_result.${key} is required`);
      }
    }
  }

  if (data.expected_phase !== "Phase 1") {
    failures.push("expected_phase must be Phase 1 for L1 plan/trigger cases");
  }
  if (data.expected_checkpoint !== "Checkpoint Plan") {
    failures.push("expected_checkpoint must be Checkpoint Plan");
  }

  evidence.push(`case=${rel(path.resolve(casePath))}`);
  evidence.push("validated input, phase trigger, checkpoint, and result shape");
  return result("L1", failures.length === 0, failures, evidence);
}

function countNarrations(source) {
  const match = source.match(/(?:export\s+const\s+)?narrations\s*(?::[^=]+)?=\s*\[([\s\S]*?)\]\s*(?:as\s+const)?\s*;?/);
  if (!match) return null;
  const body = match[1].trim();
  if (body === "") return 0;
  const quoted = body.match(/(["'`])(?:\\.|(?!\1)[\s\S])*\1/g);
  return quoted ? quoted.length : null;
}

function maxStep(source) {
  const values = [];
  for (const match of source.matchAll(/\bstep\s*(?:={2,3}|[<>]=?)\s*(\d+)\b/g)) {
    values.push(Number(match[1]));
  }
  return values.length ? Math.max(...values) : 0;
}

function findChapterDirs(root) {
  const chaptersRoot = path.join(root, "src", "chapters");
  if (!exists(chaptersRoot)) return [];
  return fs
    .readdirSync(chaptersRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(chaptersRoot, entry.name));
}

function runL2(targetPath) {
  const failures = [];
  const evidence = [];
  if (!targetPath) {
    failures.push("--target is required for L2");
    return result("L2", false, failures, evidence);
  }
  const root = path.resolve(targetPath);
  if (!exists(root)) {
    failures.push(`target does not exist: ${targetPath}`);
    return result("L2", false, failures, evidence);
  }

  const scriptPath = path.join(root, "script.md");
  const outlinePath = path.join(root, "outline.md");
  if (!exists(scriptPath)) {
    failures.push("script.md is required");
  } else {
    const script = readText(scriptPath);
    if (!/^#\s+.+/m.test(script) || !/^##\s+Chapter\s+\d+/im.test(script)) {
      failures.push("script.md must include a title and chapter heading");
    }
    evidence.push(`script=${rel(scriptPath)}`);
  }

  if (!exists(outlinePath)) {
    failures.push("outline.md is required");
  } else {
    const outline = readText(outlinePath);
    if (!/^##\s+Chapter\s+\d+/im.test(outline) || !/Checkpoint Plan/i.test(outline)) {
      failures.push("outline.md must include chapter structure and Checkpoint Plan");
    }
    if (/\b(animation|animate|transition|duration|fade|wipe|blur|spring|easing|ms)\b/i.test(outline)) {
      failures.push("outline.md must not prescribe animation or timing implementation");
    }
    evidence.push(`outline=${rel(outlinePath)}`);
  }

  const chapterDirs = findChapterDirs(root);
  if (chapterDirs.length === 0) {
    failures.push("src/chapters/<chapter> directory is required");
  }

  for (const chapterDir of chapterDirs) {
    const files = fs.readdirSync(chapterDir);
    const tsxFile = files.find((file) => file.endsWith(".tsx"));
    const cssFile = files.find((file) => file.endsWith(".css"));
    const narrationsPath = path.join(chapterDir, "narrations.ts");
    if (!tsxFile) failures.push(`${rel(chapterDir)} must contain a .tsx chapter file`);
    if (!cssFile) failures.push(`${rel(chapterDir)} must contain a .css chapter file`);
    if (!exists(narrationsPath)) failures.push(`${rel(chapterDir)} must contain narrations.ts`);
    if (!tsxFile || !cssFile || !exists(narrationsPath)) continue;

    const tsx = readText(path.join(chapterDir, tsxFile));
    const css = readText(path.join(chapterDir, cssFile));
    const narrations = readText(narrationsPath);
    const narrationCount = countNarrations(narrations);
    const expectedCount = maxStep(tsx) + 1;
    if (narrationCount === null) {
      failures.push(`${rel(narrationsPath)} must export a narrations array`);
    } else if (narrationCount !== expectedCount) {
      failures.push(`${rel(narrationsPath)} length ${narrationCount} must equal max step + 1 (${expectedCount})`);
    }
    if (/(#[0-9a-f]{3,8}\b|rgba?\s*\(|\bfont-family\s*:)/i.test(css)) {
      failures.push(`${rel(path.join(chapterDir, cssFile))} must use theme tokens, not hardcoded colors or font-family`);
    }
    if (!/(<svg\b|<canvas\b|<img\b|className=|data-visual|Chart|Diagram|Stage)/.test(tsx)) {
      failures.push(`${rel(path.join(chapterDir, tsxFile))} must expose concrete visual-surface evidence`);
    }
    evidence.push(`chapter=${rel(chapterDir)}`);
  }

  return result("L2", failures.length === 0, failures, evidence);
}

const args = parseArgs(process.argv.slice(2));
const level = String(args.level || "L0").toUpperCase();

if (level === "L1") {
  printAndExit(runL1(args.case));
} else if (level === "L2") {
  printAndExit(runL2(args.target));
} else if (level === "L0") {
  printAndExit(result("L0", true, [], ["eval runner is present"]));
} else {
  printAndExit(result(level, false, [`unsupported level: ${level}`]));
}
