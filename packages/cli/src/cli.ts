#!/usr/bin/env node
import { basename, resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import {
  captureFixture,
  diffFixtures,
  parseIntent,
  parsePipelineFixture,
  parsePromptIntent,
  runPipeline,
  statusToExitCode,
  verifyEnvelope,
  type PipelineFixture,
  type WorkbenchIntent,
} from "@sealmoss/core";
import { parseFlags } from "./args.js";
import { captureNewPath, decideCaptureWrite } from "./captureWrite.js";

function usage(): never {
  console.error(`Sealmoss — verifiable Agent trading workbench (Moss-backed)

Usage:
  sealmoss run --intent <file.json> [options]
  sealmoss run --prompt "<text>" --account <0x...> [options]
  sealmoss capture --intent <file.json> --out <fixture.json> [--compare <fixture.json>] [--force-write]
  sealmoss verify-envelope <envelope.json> [--recheck]

Run options:
  --fixture <file>   Offline/demo simulate evidence (skip live Moss)
  --out <file>       Verified envelope path (default: verified-capability.json)
  --fail-out <file>  Failed/warning envelope path (default: failed-run.json)
  --verbose          Full Receipt texts + all align checks
  --json             Print PipelineResult JSON on stdout (no markdown)

Capture:
  Live action+simulate → PipelineFixture JSON for --fixture reuse.
  Does not run align. Prefer writing demos/fixtures/*-captured.json.
  --compare <file>   Diff vs existing fixture first; on drift write <out>.new.json (not --out)
  --force-write      With --compare drift, still write --out (exit 3)

Verify:
  Recompute sha256 digest + envelope invariants (verified/capability/align).
  --recheck  Re-run alignIntent on verified envelopes (needs receiptOutcome).

Exit codes (run / verify-envelope / capture --compare):
  0  verified / digest ok / no drift
  2  warning
  3  align_fail / digest mismatch / fixture drift
  4  action_fail
  1  usage / invalid input

Sealmoss never signs or broadcasts transactions.
`);
  process.exit(1);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function looksVerifiedName(path: string): boolean {
  return basename(path).toLowerCase().startsWith("verified");
}

function runVerifyEnvelope(args: string[]): void {
  let flags;
  try {
    flags = parseFlags(
      args.filter((a) => a.startsWith("--")),
      [{ kind: "boolean", name: "recheck" }],
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    usage();
  }
  if (flags.booleans.help) usage();

  const positionals = args.filter((a) => !a.startsWith("--"));
  const file = positionals[0];
  if (!file || positionals.length > 1) usage();

  let raw: unknown;
  try {
    raw = readJson(resolve(file));
  } catch (error) {
    console.error(
      "Invalid envelope JSON:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }

  const result = verifyEnvelope(raw, {
    recheck: flags.booleans.recheck === true,
  });
  if (result.ok) {
    console.log(result.detail);
    process.exit(0);
  }
  console.error(result.detail);
  process.exit(result.structural ? 1 : 3);
}

async function runCapture(args: string[]): Promise<void> {
  let flags;
  try {
    flags = parseFlags(args, [
      { kind: "value", name: "intent" },
      { kind: "value", name: "out" },
      { kind: "value", name: "compare" },
      { kind: "boolean", name: "force-write" },
    ]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    usage();
  }
  if (flags.booleans.help) usage();

  const intentPath = flags.values.intent;
  const outPath = flags.values.out;
  const comparePath = flags.values.compare;
  const forceWrite = flags.booleans["force-write"] === true;
  if (!intentPath || !outPath) usage();

  let intent: WorkbenchIntent;
  try {
    intent = parseIntent(readJson(resolve(intentPath)));
  } catch (error) {
    console.error(
      "Invalid intent:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }

  let baseline: PipelineFixture | undefined;
  if (comparePath) {
    try {
      baseline = parsePipelineFixture(readJson(resolve(comparePath)));
    } catch (error) {
      console.error(
        "Invalid compare fixture:",
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  console.log(
    `Capturing ${intent.protocol}.${intent.method} for ${intent.account}…`,
  );
  try {
    const fixture = await captureFixture({ intent });
    const body = `${JSON.stringify(fixture, null, 2)}\n`;
    const target = resolve(outPath);

    let drifted = false;
    if (baseline) {
      const diff = diffFixtures(baseline, fixture);
      console.log(`Compare vs ${comparePath}: ${diff.detail}`);
      if (diff.addedTexts.length > 0) {
        console.log(`  added texts (${diff.addedTexts.length}):`);
        for (const text of diff.addedTexts.slice(0, 5)) {
          console.log(`    + ${text}`);
        }
      }
      if (diff.removedTexts.length > 0) {
        console.log(`  removed texts (${diff.removedTexts.length}):`);
        for (const text of diff.removedTexts.slice(0, 5)) {
          console.log(`    - ${text}`);
        }
      }
      if (diff.changedIndexes.length > 0) {
        console.log(
          `  changed text indexes: ${diff.changedIndexes.slice(0, 12).join(", ")}`,
        );
      }
      if (!diff.outcomeEqual) console.log("  receiptOutcome: changed");
      if (!diff.warningsEqual) console.log("  warnings: changed");
      if (!diff.capabilityEqual) console.log("  capability: changed");
      drifted = !diff.ok;
      if (diff.hint) console.error(diff.hint);
    }

    const plan = decideCaptureWrite({
      compared: baseline !== undefined,
      drifted,
      forceWrite,
    });
    if (plan.writeNew) {
      const neu = resolve(captureNewPath(outPath));
      writeFileSync(neu, body);
      console.log(`Wrote new fixture (drift): ${neu}`);
    }
    if (plan.writeOut) {
      writeFileSync(target, body);
      console.log(`Wrote fixture: ${target}`);
      console.log(
        `Reuse with: sealmoss run --intent ${intentPath} --fixture ${outPath}`,
      );
    } else {
      console.log(`Skipped writing --out (drift); see .new.json`);
    }
    process.exit(plan.exitCode);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(4);
  }
}

async function runPipelineCmd(args: string[]): Promise<void> {
  let flags;
  try {
    flags = parseFlags(args, [
      { kind: "value", name: "intent" },
      { kind: "value", name: "fixture" },
      { kind: "value", name: "prompt" },
      { kind: "value", name: "account" },
      { kind: "value", name: "out" },
      { kind: "value", name: "fail-out" },
      { kind: "boolean", name: "verbose" },
      { kind: "boolean", name: "json" },
    ]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    usage();
  }
  if (flags.booleans.help) usage();

  const intentPath = flags.values.intent;
  const fixturePath = flags.values.fixture;
  const prompt = flags.values.prompt;
  const account = flags.values.account;
  const outPath = flags.values.out ?? "verified-capability.json";
  const failOutPath = flags.values["fail-out"] ?? "failed-run.json";
  const verbose = flags.booleans.verbose === true;
  const jsonOut = flags.booleans.json === true;

  let intent: WorkbenchIntent;
  try {
    if (intentPath) {
      intent = parseIntent(readJson(resolve(intentPath)));
    } else if (prompt && account) {
      intent = parsePromptIntent(prompt, account);
    } else {
      usage();
    }
  } catch (error) {
    console.error(
      "Invalid intent:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }

  let fixture: PipelineFixture | undefined;
  if (fixturePath) {
    try {
      fixture = parsePipelineFixture(readJson(resolve(fixturePath)));
    } catch (error) {
      console.error(
        "Invalid fixture:",
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  if (!jsonOut) {
    console.log(
      `Running ${intent.protocol}.${intent.method} for ${intent.account}${fixture ? " (fixture)" : ""}…`,
    );
  }

  const result = await runPipeline({ intent, fixture, verbose });

  if (jsonOut) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("");
    console.log(result.summary);
    console.log("");
  }

  if (result.status === "ok") {
    const target = resolve(outPath);
    writeFileSync(target, `${JSON.stringify(result.artifact, null, 2)}\n`);
    if (!jsonOut) console.log(`Wrote verified envelope: ${target}`);
  } else {
    if (looksVerifiedName(failOutPath)) {
      console.error(
        `Refusing to write non-verified run to verified-prefixed path: ${failOutPath}`,
      );
      process.exit(statusToExitCode(result.status));
    }
    const target = resolve(failOutPath);
    writeFileSync(target, `${JSON.stringify(result.artifact, null, 2)}\n`);
    if (!jsonOut) {
      console.log(`Wrote failed-run envelope: ${target}`);
      console.log("No verified capability (envelope.capability is null).");
    }
  }

  process.exit(statusToExitCode(result.status));
}

async function main(): Promise<void> {
  let args = process.argv.slice(2);
  if (args[0] === "--") args = args.slice(1);
  const cmd = args[0];
  if (cmd === "capture") {
    await runCapture(args.slice(1));
    return;
  }
  if (cmd === "run") {
    await runPipelineCmd(args.slice(1));
    return;
  }
  if (cmd === "verify-envelope") {
    runVerifyEnvelope(args.slice(1));
    return;
  }
  usage();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(4);
});
