import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

// Compiled to dist-test/test/*.js — climb to packages/cli.
const HERE = dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = resolve(HERE, "../..");
const REPO_ROOT = resolve(CLI_ROOT, "../..");
const CLI = resolve(CLI_ROOT, "dist/cli.js");

function runCli(
  args: string[],
  cwd: string,
): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env },
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("cli e2e (offline fixtures)", () => {
  it("run offline → exit 0 + verify-envelope", () => {
    const dir = mkdtempSync(join(tmpdir(), "sealmoss-e2e-"));
    try {
      const out = join(dir, "verified-capability.json");
      const run = runCli(
        [
          "run",
          "--intent",
          resolve(REPO_ROOT, "demos/swap-mon-usdc.json"),
          "--fixture",
          resolve(REPO_ROOT, "demos/fixtures/kuru-swap-ok.json"),
          "--out",
          out,
          "--json",
        ],
        dir,
      );
      assert.equal(run.status, 0, run.stderr || run.stdout);
      const artifact = JSON.parse(readFileSync(out, "utf8"));
      assert.equal(artifact.verified, true);
      assert.ok(artifact.capability);

      const verify = runCli(["verify-envelope", out], dir);
      assert.equal(verify.status, 0, verify.stderr || verify.stdout);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("run warning fixture → exit 2, capability null", () => {
    const dir = mkdtempSync(join(tmpdir(), "sealmoss-e2e-"));
    try {
      const failOut = join(dir, "failed-run.json");
      const run = runCli(
        [
          "run",
          "--intent",
          resolve(REPO_ROOT, "demos/swap-mon-usdc.json"),
          "--fixture",
          resolve(REPO_ROOT, "demos/fixtures/simulate-warning.json"),
          "--fail-out",
          failOut,
          "--json",
        ],
        dir,
      );
      assert.equal(run.status, 2, run.stderr || run.stdout);
      const artifact = JSON.parse(readFileSync(failOut, "utf8"));
      assert.equal(artifact.verified, false);
      assert.equal(artifact.capability, null);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("run bad min-out → exit 3", () => {
    const dir = mkdtempSync(join(tmpdir(), "sealmoss-e2e-"));
    try {
      const failOut = join(dir, "failed-run.json");
      const run = runCli(
        [
          "run",
          "--intent",
          resolve(REPO_ROOT, "demos/bad-min-out.json"),
          "--fixture",
          resolve(REPO_ROOT, "demos/fixtures/kuru-swap-ok.json"),
          "--fail-out",
          failOut,
          "--json",
        ],
        dir,
      );
      assert.equal(run.status, 3, run.stderr || run.stdout);
      const artifact = JSON.parse(readFileSync(failOut, "utf8"));
      assert.equal(artifact.verified, false);
      assert.equal(artifact.capability, null);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
