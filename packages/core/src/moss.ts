import {
  createRuntime,
  type AddressValue,
  Registry,
  type CapabilityNode,
} from "@themoss/core";
import * as erc from "@themoss/erc";
import * as kuru from "@themoss/protocol-kuru";
import { createTraceSimulator, type SimulateOutcome } from "@themoss/simulator";
import * as system from "@themoss/system";
import type { WorkbenchIntent } from "./intent.js";
import { receiptTexts, type ReceiptLike } from "./receipts.js";

export type MossHandles = {
  registry: Registry;
  simulate: (capability: CapabilityNode) => Promise<SimulateOutcome>;
};

export async function createMossHandles(rpcUrl?: string): Promise<MossHandles> {
  const runtime = await createRuntime(rpcUrl ? { rpcUrl } : undefined);
  const registry = new Registry(runtime).use(system, erc, kuru);
  const simulator = createTraceSimulator(runtime, {
    receipt: (capability, changes) => registry.parseReceipt(capability, changes),
  });
  return {
    registry,
    simulate: (capability) => simulator.simulate(capability),
  };
}

export async function runAction(
  handles: MossHandles,
  intent: WorkbenchIntent,
): Promise<CapabilityNode> {
  const result = await handles.registry.action(
    intent.protocol,
    intent.method,
    intent.account as AddressValue,
    intent.params,
  );
  if (result.kind !== "capability") {
    throw new Error(
      `expected Capability from ${intent.protocol}.${intent.method}, got ${result.kind}`,
    );
  }
  return result as CapabilityNode;
}

export function collectSimulationEvidence(outcome: SimulateOutcome): {
  halted: boolean;
  haltReason?: string;
  warnings: string[];
  texts: string[];
  protocol: string;
  method: string;
  receiptOutcome: unknown;
  topText: string | undefined;
} {
  const warnings = outcome.results.flatMap((result) =>
    result.warnings.map((warning) =>
      typeof warning === "string" ? warning : JSON.stringify(warning),
    ),
  );
  const final = outcome.results.at(-1);
  const receipt = final?.receipt as ReceiptLike | undefined;
  const texts = receipt ? receiptTexts(receipt) : [];
  return {
    halted: outcome.halted !== undefined,
    haltReason: outcome.halted?.reason,
    warnings,
    texts,
    protocol: final?.protocol ?? "",
    method: final?.method ?? "",
    receiptOutcome: receipt?.outcome,
    topText: receipt?.text,
  };
}
