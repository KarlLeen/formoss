#!/usr/bin/env node
import { basename, resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import {
  captureFixture,
  parseIntent,
  parsePipelineFixture,
  parsePromptIntent,
  runPipeline,
  statusToExitCode,
  type PipelineFixture,
  type WorkbenchIntent,
} from "@formoss/core";

function usage(): never {
  console.error(`Formoss — verifiable Agent trading workbench (Moss-backed)

Usage:
  formoss run --intent <file.json> [options]
  formoss run --prompt "<text>" --account <0x...> [options]
  formoss capture --intent <file.json> --out <fixture.json>

Run options:
  --fixture <file>   Offline/demo simulate evidence (skip live Moss)
  --out <file>       Verified envelope path (default: verified-capability.json)
  --fail-out <file>  Failed/warning envelope path (default: failed-run.json)
  --verbose          Full Receipt texts + all align checks
  --json             Print PipelineResult JSON on stdout (no markdown)

Capture:
  Live action+simulate → PipelineFixture JSON for --fixture reuse.
  Does not run align. Prefer writing demos/fixtures/*-captured.json.

Exit codes (run):
  0  verified  2  warning  3  align_fail  4  action_fail  1  usage

Formoss never signs or broadcasts transactions.
`);
  process.exit(1);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function looksVerifiedName(path: string): boolean {
  return basename(path).toLowerCase().startsWith("verified");
}

async function runCapture(args: string[]): Promise<void> {
  let intentPath: string | undefined;
  let outPath: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--intent") intentPath = args[++i];
    else if (arg === "--out") outPath = args[++i];
    else if (arg === "--help" || arg === "-h") usage();
    else {
      console.error(`Unknown argument: ${arg}`);
      usage();
    }
  }
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

  console.log(
    `Capturing ${intent.protocol}.${intent.method} for ${intent.account}…`,
  );
  try {
    const fixture = await captureFixture({ intent });
    const target = resolve(outPath);
    writeFileSync(target, `${JSON.stringify(fixture, null, 2)}\n`);
    console.log(`Wrote fixture: ${target}`);
    console.log(
      `Reuse with: formoss run --intent ${intentPath} --fixture ${outPath}`,
    );
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(4);
  }
}

async function runPipelineCmd(args: string[]): Promise<void> {
  let intentPath: string | undefined;
  let fixturePath: string | undefined;
  let prompt: string | undefined;
  let account: string | undefined;
  let outPath = "verified-capability.json";
  let failOutPath = "failed-run.json";
  let verbose = false;
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--intent") intentPath = args[++i];
    else if (arg === "--fixture") fixturePath = args[++i];
    else if (arg === "--prompt") prompt = args[++i];
    else if (arg === "--account") account = args[++i];
    else if (arg === "--out") outPath = args[++i]!;
    else if (arg === "--fail-out") failOutPath = args[++i]!;
    else if (arg === "--verbose") verbose = true;
    else if (arg === "--json") jsonOut = true;
    else if (arg === "--help" || arg === "-h") usage();
    else {
      console.error(`Unknown argument: ${arg}`);
      usage();
    }
  }

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
  usage();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(4);
});
