import { z } from "zod";

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
    capability: z.unknown().optional(),
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
        receiptOutcome: z.unknown().optional(),
      })
      .strict(),
  })
  .strict();

export type PipelineFixture = z.infer<typeof pipelineFixtureSchema>;

export function parsePipelineFixture(input: unknown): PipelineFixture {
  return pipelineFixtureSchema.parse(input);
}
