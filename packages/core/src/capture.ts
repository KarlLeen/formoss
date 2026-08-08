import type { CapabilityNode } from "@themoss/core";
import type { PipelineFixture } from "./fixture.js";
import type { WorkbenchIntent } from "./intent.js";
import {
  collectSimulationEvidence,
  createMossHandles,
  runAction,
} from "./moss.js";
import { rpcRetryConfig, withRetry } from "./retry.js";

/** Strip capability tree to JSON-safe skeleton for fixtures. */
export function stripCapabilitySkeleton(
  capability: unknown,
): Record<string, unknown> | unknown[] | string | number | boolean | null {
  return JSON.parse(JSON.stringify(capability)) as
    | Record<string, unknown>
    | unknown[]
    | string
    | number
    | boolean
    | null;
}

export function evidenceToFixture(args: {
  capability: unknown;
  evidence: ReturnType<typeof collectSimulationEvidence>;
}): PipelineFixture {
  return {
    kind: "simulate_result",
    skipAction: true,
    capability: stripCapabilitySkeleton(args.capability),
    simulate: {
      ...(args.evidence.halted
        ? {
            halted: {
              reason: args.evidence.haltReason ?? "halted",
            },
          }
        : {}),
      warnings: args.evidence.warnings,
      texts: args.evidence.texts,
      protocol: args.evidence.protocol,
      method: args.evidence.method,
      receiptOutcome: args.evidence.receiptOutcome as PipelineFixture["simulate"]["receiptOutcome"],
    },
  };
}

/**
 * Live action + simulate, then emit a reusable PipelineFixture.
 * Does not run align / present.
 */
export async function captureFixture(args: {
  intent: WorkbenchIntent;
}): Promise<PipelineFixture> {
  const { timeoutMs, retries } = rpcRetryConfig();
  const handles = await withRetry(
    () => createMossHandles(args.intent.rpcUrl),
    { retries, timeoutMs, label: "create Moss runtime" },
  );

  const capability = await withRetry(
    () => runAction(handles, args.intent),
    { retries, timeoutMs, label: "Moss action / market discovery" },
  );

  const simulation = await withRetry(
    () => handles.simulate(capability as CapabilityNode),
    { retries, timeoutMs, label: "Moss simulate" },
  );

  const evidence = collectSimulationEvidence(simulation);
  return evidenceToFixture({ capability, evidence });
}
