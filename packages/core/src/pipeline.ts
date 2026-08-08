import { alignIntent } from "./align.js";
import type { PipelineStatus } from "./codes.js";
import type { PipelineFixture } from "./fixture.js";
import type { WorkbenchIntent } from "./intent.js";
import {
  collectSimulationEvidence,
  createMossHandles,
  runAction,
  type MossHandles,
} from "./moss.js";
import { present } from "./present.js";
import {
  formatDiscoveryHint,
  rpcRetryConfig,
  withRetry,
} from "./retry.js";
import type { PipelineResult, PipelineStep } from "./types.js";

export type RunPipelineOptions = {
  intent: WorkbenchIntent;
  /** Inject handles in tests; otherwise live Moss runtime is created. */
  handles?: MossHandles;
  /**
   * Reproducible simulate evidence (demo Warning path, offline align).
   * When set, live simulate is skipped. Action is skipped unless
   * `fixture.skipAction === false` and handles/live Moss are available.
   */
  fixture?: PipelineFixture;
  /** When true, summary includes full Receipt texts and all align checks. */
  verbose?: boolean;
};

export async function runPipeline(
  options: RunPipelineOptions,
): Promise<PipelineResult> {
  const { intent, fixture, verbose } = options;
  const steps: PipelineStep[] = [];

  let capability: unknown = fixture?.capability ?? { kind: "fixture-capability" };
  const skipAction = fixture?.skipAction !== false && fixture !== undefined;

  if (!skipAction) {
    const { timeoutMs, retries } = rpcRetryConfig();
    let handles: MossHandles;
    try {
      handles =
        options.handles ??
        (await withRetry(() => createMossHandles(intent.rpcUrl), {
          retries,
          timeoutMs,
          label: "create Moss runtime",
        }));
    } catch (error) {
      return fail(
        "action_fail",
        intent,
        steps,
        error,
        "failed to create Moss runtime",
        verbose,
      );
    }

    try {
      capability = await withRetry(() => runAction(handles, intent), {
        retries,
        timeoutMs,
        label: "Moss action / market discovery",
      });
      steps.push({
        name: "action",
        status: "ok",
        detail: `built unsigned ${intent.protocol}.${intent.method} Capability tree`,
      });
    } catch (error) {
      steps.push({
        name: "action",
        status: "fail",
        detail: errorMessage(error),
      });
      return finish({
        status: "action_fail",
        intent,
        steps,
        texts: [],
        warnings: [],
        align: null,
        capability: null,
        error: errorMessage(error),
        verbose,
      });
    }

    if (!fixture) {
      return continueAfterAction(intent, steps, capability, handles, verbose);
    }
  } else {
    steps.push({
      name: "action",
      status: "ok",
      detail: "fixture: skipped live action (offline/demo)",
    });
  }

  if (fixture) {
    return finishFromEvidence(
      intent,
      steps,
      capability,
      {
        halted: fixture.simulate.halted !== undefined,
        haltReason: fixture.simulate.halted?.reason,
        warnings: fixture.simulate.warnings,
        texts: fixture.simulate.texts,
        protocol: fixture.simulate.protocol,
        method: fixture.simulate.method,
        receiptOutcome: fixture.simulate.receiptOutcome,
        topText: undefined,
      },
      verbose,
    );
  }

  return fail(
    "action_fail",
    intent,
    steps,
    new Error("internal: skipAction without fixture"),
    "invalid pipeline options",
    verbose,
  );
}

async function continueAfterAction(
  intent: WorkbenchIntent,
  steps: PipelineStep[],
  capability: unknown,
  handles: MossHandles,
  verbose?: boolean,
): Promise<PipelineResult> {
  const { timeoutMs, retries } = rpcRetryConfig();
  let evidence: ReturnType<typeof collectSimulationEvidence>;
  try {
    const simulation = await withRetry(
      () =>
        handles.simulate(
          capability as Parameters<MossHandles["simulate"]>[0],
        ),
      { retries, timeoutMs, label: "Moss simulate" },
    );
    evidence = collectSimulationEvidence(simulation);
  } catch (error) {
    steps.push({
      name: "simulate",
      status: "fail",
      detail: errorMessage(error),
    });
    return finish({
      status: "action_fail",
      intent,
      steps,
      texts: [],
      warnings: [],
      align: null,
      capability: null,
      error: errorMessage(error),
      verbose,
    });
  }

  return finishFromEvidence(intent, steps, capability, evidence, verbose);
}

function finishFromEvidence(
  intent: WorkbenchIntent,
  steps: PipelineStep[],
  capability: unknown,
  evidence: ReturnType<typeof collectSimulationEvidence>,
  verbose?: boolean,
): PipelineResult {
  if (evidence.halted || evidence.warnings.length > 0) {
    steps.push({
      name: "simulate",
      status: "fail",
      detail: evidence.halted
        ? `simulation halted${evidence.haltReason ? `: ${evidence.haltReason}` : ""}`
        : `${evidence.warnings.length} warning(s)`,
    });
    steps.push({
      name: "align",
      status: "skipped",
      detail: "skipped after simulation warning",
    });
    return finish({
      status: "warning",
      intent,
      steps,
      texts: evidence.texts,
      warnings: evidence.warnings,
      align: { ok: false, checks: [] },
      capability,
      error: "simulation produced warnings or halted",
      verbose,
    });
  }

  steps.push({
    name: "simulate",
    status: "ok",
    detail: `zero warnings; ${evidence.texts.length} leaf text(s)`,
  });

  const align = alignIntent({
    intent,
    texts: evidence.texts,
    outcome: evidence.receiptOutcome,
    protocol: evidence.protocol,
    method: evidence.method,
    capability,
  });

  steps.push({
    name: "align",
    status: align.ok ? "ok" : "fail",
    detail: align.ok
      ? `${align.checks.length} checks passed`
      : `${align.checks.filter((c) => !c.ok).length} check(s) failed`,
  });

  const status: PipelineStatus = align.ok ? "ok" : "align_fail";
  return finish({
    status,
    intent,
    steps,
    texts: evidence.texts,
    warnings: evidence.warnings,
    align,
    capability,
    error: align.ok ? undefined : "intent alignment failed",
    verbose,
  });
}

function finish(args: {
  status: PipelineStatus;
  intent: WorkbenchIntent;
  steps: PipelineStep[];
  texts: string[];
  warnings: string[];
  align: ReturnType<typeof alignIntent> | null;
  capability: unknown | null;
  error?: string;
  verbose?: boolean;
}): PipelineResult {
  const presented = present({
    status: args.status,
    intent: args.intent,
    steps: args.steps,
    align: args.align,
    texts: args.texts,
    capability: args.capability,
    warnings: args.warnings,
    error: args.error,
    verbose: args.verbose,
  });

  const presentDetail = presented.artifact.verified
    ? "verified envelope ready for human review"
    : "failed envelope recorded — capability omitted";
  args.steps.push({
    name: "present",
    status: "ok",
    detail: presentDetail,
  });

  // Rebuild envelope so steps include the present step.
  const final = present({
    status: args.status,
    intent: args.intent,
    steps: args.steps,
    align: args.align,
    texts: args.texts,
    capability: args.capability,
    warnings: args.warnings,
    error: args.error,
    verbose: args.verbose,
  });

  return {
    status: args.status,
    intent: args.intent,
    steps: args.steps,
    texts: args.texts,
    warnings: args.warnings,
    align: args.align,
    summary: final.summary,
    artifact: final.artifact,
    error: args.error,
  };
}

function fail(
  status: PipelineStatus,
  intent: WorkbenchIntent,
  steps: PipelineStep[],
  error: unknown,
  detail: string,
  verbose?: boolean,
): PipelineResult {
  steps.push({ name: "action", status: "fail", detail });
  return finish({
    status,
    intent,
    steps,
    texts: [],
    warnings: [],
    align: null,
    capability: null,
    error: errorMessage(error),
    verbose,
  });
}

function errorMessage(error: unknown): string {
  const base = error instanceof Error ? error.message : String(error);
  const hint = formatDiscoveryHint(error);
  return hint ? `${base} — ${hint}` : base;
}
