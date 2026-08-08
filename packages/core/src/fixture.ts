import { z } from "zod";

const capabilitySkeletonSchema: z.ZodType<unknown> = z.lazy(() =>
  z
    .object({
      kind: z.literal("capability"),
      protocol: z.string(),
      method: z.string(),
      params: z.record(z.unknown()),
      children: z.array(z.unknown()),
    })
    .passthrough(),
);

const kuruOutcomeSchema = z
  .object({
    operation: z.literal("swap"),
    protocol: z.literal("kuru"),
    sender: z.string(),
    tokenIn: z.string(),
    tokenOut: z.string(),
    amountIn: z.string(),
    amountOut: z.string(),
  })
  .passthrough();

const wmonOutcomeSchema = z
  .object({
    operation: z.enum(["wrap", "unwrap"]).optional(),
    account: z.string().optional(),
    sender: z.string().optional(),
    amount: z.string(),
  })
  .passthrough();

/**
 * Offline / demo simulation payload.
 * When present, pipeline skips live Moss simulate (and optionally action).
 */
export const pipelineFixtureSchema = z
  .object({
    kind: z.literal("simulate_result"),
    /** Default true for warning demos — no RPC required. */
    skipAction: z.boolean().default(true),
    /** Stub Capability when skipAction; ignored for warning path (no artifact). */
    capability: capabilitySkeletonSchema
      .or(z.record(z.unknown()))
      .or(z.null())
      .optional(),
    simulate: z
      .object({
        halted: z
          .object({
            reason: z.string(),
          })
          .optional(),
        warnings: z.array(z.string()).default([]),
        texts: z.array(z.string()).default([]),
        protocol: z.string().min(1),
        method: z.string().min(1),
        receiptOutcome: z
          .union([kuruOutcomeSchema, wmonOutcomeSchema, z.record(z.unknown())])
          .optional(),
      })
      .strict(),
  })
  .strict();

export type PipelineFixture = z.infer<typeof pipelineFixtureSchema>;

export function parsePipelineFixture(input: unknown): PipelineFixture {
  return pipelineFixtureSchema.parse(input);
}
