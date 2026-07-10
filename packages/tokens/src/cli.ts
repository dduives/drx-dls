#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { generateTheme } from "./generateTheme.js";
import { emitCss, emitSwift, emitJson } from "./emitters/index.js";
import { checkContrast, formatViolation } from "./contrast.js";
import {
  validateThemeInputs,
  migrateThemeInputs,
  formatValidationIssue,
} from "./schema.js";
import type { DeviceName, ThemeInputs } from "./types.js";

type Target = "css" | "swift" | "json";

const DEVICE_NAMES: DeviceName[] = ["web", "ios", "tvos"];

interface EmitterSpec {
  emit: (theme: ReturnType<typeof generateTheme>) => string;
  file: string;
}

const EMITTERS: Record<Target, EmitterSpec> = {
  css: { emit: emitCss, file: "theme.css" },
  swift: { emit: emitSwift, file: "DRXTheme.swift" },
  json: { emit: emitJson, file: "theme.json" },
};

function parseArgs(argv: string[]) {
  const args = {
    input: "drx.theme.json",
    outDir: ".",
    target: "all",
    device: undefined as DeviceName | undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--input" || a === "-i") args.input = argv[++i] ?? args.input;
    else if (a === "--out" || a === "-o") args.outDir = argv[++i] ?? args.outDir;
    else if (a === "--target" || a === "-t")
      args.target = argv[++i] ?? args.target;
    else if (a === "--device" || a === "-d")
      args.device = (argv[++i] as DeviceName) ?? args.device;
  }
  return args;
}

async function loadInputs(inputPath: string): Promise<ThemeInputs> {
  const abs = resolve(process.cwd(), inputPath);
  if (!existsSync(abs)) {
    console.warn(
      `drx-theme: no ${inputPath} found — using base identity defaults.`,
    );
    return {};
  }
  const raw = await readFile(abs, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  const result = validateThemeInputs(parsed);
  if (!result.valid) {
    console.error(`drx-theme: ${inputPath} failed schema validation:`);
    for (const issue of result.errors) {
      console.error(`  ✗ ${formatValidationIssue(issue)}`);
    }
    process.exit(1);
  }
  if (result.needsMigration) {
    console.warn(
      `drx-theme: ${inputPath} is schema v${result.version}; migrating to current.`,
    );
    return migrateThemeInputs(parsed);
  }
  return parsed as ThemeInputs;
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (cmd !== "build") {
    console.error("Usage: drx-theme build [--input drx.theme.json] [--out dir] [--target css|swift|json|all] [--device web|ios|tvos]");
    process.exit(cmd === "--help" || cmd === "-h" ? 0 : 1);
  }

  const { input, outDir, target, device } = parseArgs(argv.slice(1));

  if (device !== undefined && !DEVICE_NAMES.includes(device)) {
    console.error(
      `drx-theme: unknown device "${device}" (expected one of ${DEVICE_NAMES.join(", ")})`,
    );
    process.exit(1);
  }

  const inputs = await loadInputs(input);
  const theme = generateTheme(inputs);

  const contrast = checkContrast(theme);
  if (!contrast.passes) {
    console.warn(
      `drx-theme: ${contrast.violations.length} WCAG AA contrast warning(s) (advisory):`,
    );
    for (const v of contrast.violations) {
      console.warn(`  ⚠ ${formatViolation(v)}`);
    }
  }

  const targets: Target[] =
    target === "all" ? (Object.keys(EMITTERS) as Target[]) : [target as Target];

  for (const t of targets) {
    const spec = EMITTERS[t];
    if (!spec) {
      console.error(`drx-theme: unknown target "${t}"`);
      process.exit(1);
    }
    const outPath = resolve(process.cwd(), outDir, spec.file);
    await mkdir(dirname(outPath), { recursive: true });
    const output =
      t === "css" && device ? emitCss(theme, { device }) : spec.emit(theme);
    await writeFile(outPath, output, "utf8");
    console.log(`drx-theme: wrote ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
