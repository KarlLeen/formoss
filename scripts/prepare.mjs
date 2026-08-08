#!/usr/bin/env node
/**
 * pnpm prepare hook: build Moss packages Sealmoss links via workspace.
 * Skip with SEALMOSS_SKIP_PREPARE=1. No-op (exit 0) if vendor/moss is missing.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (process.env.SEALMOSS_SKIP_PREPARE === "1") {
  console.log("sealmoss prepare: skipped (SEALMOSS_SKIP_PREPARE=1)");
  process.exit(0);
}

const mossCore = join(root, "vendor/moss/packages/core");
if (!existsSync(mossCore)) {
  console.log(
    "sealmoss prepare: vendor/moss missing — run: bash scripts/setup-moss.sh",
  );
  process.exit(0);
}

const script = join(root, "scripts/build-moss.sh");
const result = spawnSync("bash", [script], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
