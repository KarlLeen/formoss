import { NATIVE } from "@themoss/core";
import { parseUnits } from "viem";
import type { WorkbenchIntent } from "../../intent.js";
import type { AlignContext } from "../types.js";

export type KuruIntent = Extract<WorkbenchIntent, { protocol: "kuru" }>;

export type KuruExpect = {
  readonly intent: KuruIntent;
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly amountInHuman: string;
  readonly recipient: string;
  readonly expectedBase: string | null;
  readonly floor: bigint | null;
};

export function resolveAmountOutFloor(intent: KuruIntent): bigint | null {
  const expect = intent.expect;
  if (expect?.minAmountOut) return BigInt(expect.minAmountOut);
  if (expect?.estimatedAmountOut) {
    const estimated = BigInt(expect.estimatedAmountOut);
    const slippage = BigInt(intent.params.slippage);
    return (estimated * (10_000n - slippage)) / 10_000n;
  }
  return null;
}

export function kuruExpect(ctx: AlignContext): KuruExpect {
  const intent = ctx.intent as KuruIntent;
  const expect = intent.expect;
  const tokenIn = expect?.tokenIn ?? intent.params.tokenIn;
  const tokenOut = expect?.tokenOut ?? intent.params.tokenOut;
  const amountInHuman = expect?.amountIn ?? intent.params.amountIn;
  const recipient = expect?.recipient ?? intent.account;
  const expectedBase =
    tokenIn === NATIVE
      ? parseUnits(amountInHuman, 18).toString()
      : amountInHuman.includes(".")
        ? null
        : amountInHuman;
  return {
    intent,
    tokenIn,
    tokenOut,
    amountInHuman,
    recipient,
    expectedBase,
    floor: resolveAmountOutFloor(intent),
  };
}
