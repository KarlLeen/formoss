import type { AlignResult } from "./align.js";
import type { PipelineStatus } from "./codes.js";
import type { VerificationEnvelope } from "./envelope.js";
import type { WorkbenchIntent } from "./intent.js";

export type PipelineStepStatus = "ok" | "fail" | "skipped";

export type PipelineStep = {
  readonly name: "action" | "simulate" | "align" | "present";
  readonly status: PipelineStepStatus;
  readonly detail: string;
};

export type PipelineResult = {
  readonly status: PipelineStatus;
  readonly intent: WorkbenchIntent;
  readonly steps: PipelineStep[];
  readonly texts: string[];
  readonly warnings: string[];
  readonly align: AlignResult | null;
  readonly summary: string;
  /**
   * Run record envelope. `envelope.capability` is non-null only when
   * status === "ok" (verified). Failures still return an envelope for audit.
   */
  readonly artifact: VerificationEnvelope;
  readonly error?: string;
};
