import { NATIVE } from "@themoss/core";
import { USDC_ADDRESS } from "@themoss/system";
import { isAddress } from "viem";
import { z } from "zod";

const addressSchema = z
  .string()
  .refine((value) => isAddress(value, { strict: false }), "expected a 20-byte 0x address");

const tokenRefSchema = z.union([z.literal(NATIVE), addressSchema]);

const expectSchema = z
  .object({
    tokenIn: tokenRefSchema.optional(),
    tokenOut: tokenRefSchema.optional(),
    /** Human-readable decimal amountIn to compare against the structured outcome. */
    amountIn: z.string().optional(),
    /** Compared to the swap/wrap outcome sender (or explicit recipient field if present). */
    recipient: addressSchema.optional(),
    /** Required Approval spender when set; also checked against tree approves. */
    spender: addressSchema.optional(),
    /** Absolute min amountOut in base units (preferred floor). */
    minAmountOut: z.string().regex(/^\d+$/).optional(),
    /**
     * Quote estimate in base units; with params.slippage derives a floor when
     * minAmountOut unset. Required for Kuru align (with minAmountOut as alt).
     */
    estimatedAmountOut: z.string().regex(/^\d+$/).optional(),
  })
  .strict()
  .optional();

const kuruSwapParamsSchema = z
  .object({
    tokenIn: tokenRefSchema,
    tokenOut: tokenRefSchema,
    amountIn: z.string().min(1),
    slippage: z.number().int().min(0).max(5000).default(50),
  })
  .strict();

const wmonWrapParamsSchema = z
  .object({
    amount: z.string().min(1),
  })
  .strict();

export const workbenchIntentSchema = z.discriminatedUnion("protocol", [
  z
    .object({
      protocol: z.literal("kuru"),
      method: z.literal("swap"),
      account: addressSchema,
      params: kuruSwapParamsSchema,
      expect: expectSchema,
      rpcUrl: z.string().url().optional(),
    })
    .strict(),
  z
    .object({
      protocol: z.literal("wmon"),
      method: z.enum(["wrap", "unwrap"]),
      account: addressSchema,
      params: wmonWrapParamsSchema,
      expect: expectSchema,
      rpcUrl: z.string().url().optional(),
    })
    .strict(),
]);

export type WorkbenchIntent = z.infer<typeof workbenchIntentSchema>;

export function parseIntent(input: unknown): WorkbenchIntent {
  return workbenchIntentSchema.parse(input);
}

/** Tiny prompt parser for demos — not a general NLU. */
export function parsePromptIntent(
  prompt: string,
  account: string,
): WorkbenchIntent {
  const normalized = prompt.trim().toLowerCase();
  const amountMatch = normalized.match(
    /(?:swap|wrap)\s+(\d+(?:\.\d+)?)\s*(?:mon|wmon|native)?/,
  );
  const amount = amountMatch?.[1] ?? "0.01";

  if (/\bwrap\b/.test(normalized)) {
    return parseIntent({
      protocol: "wmon",
      method: "wrap",
      account,
      params: { amount },
    });
  }

  if (/\bunwrap\b/.test(normalized)) {
    return parseIntent({
      protocol: "wmon",
      method: "unwrap",
      account,
      params: { amount },
    });
  }

  // Default demo path: Kuru native MON → USDC
  return parseIntent({
    protocol: "kuru",
    method: "swap",
    account,
    params: {
      tokenIn: NATIVE,
      tokenOut: USDC_ADDRESS,
      amountIn: amount,
      slippage: 50,
    },
    // Floor source required by align; low estimate for demo prompts / live variance.
    expect: { estimatedAmountOut: "1" },
  });
}

export { NATIVE, USDC_ADDRESS };
