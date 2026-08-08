import { NATIVE } from "@themoss/core";
import { isAddress, parseUnits } from "viem";
import type { WorkbenchIntent } from "../intent.js";
import {
  findTokenOutTransferTo,
  parseKuruSwapText,
  textsIncludeAmount,
  textsIncludeToken,
} from "../textMatch.js";
import { isJsonRecord, lower, tokenMatches } from "./helpers.js";
import type { AlignRule } from "./types.js";

function resolveAmountOutFloor(
  intent: Extract<WorkbenchIntent, { protocol: "kuru" }>,
): bigint | null {
  const expect = intent.expect;
  if (expect?.minAmountOut) return BigInt(expect.minAmountOut);
  if (expect?.estimatedAmountOut) {
    const estimated = BigInt(expect.estimatedAmountOut);
    const slippage = BigInt(intent.params.slippage);
    return (estimated * (10_000n - slippage)) / 10_000n;
  }
  return null;
}

export const kuruSwapRules: readonly AlignRule[] = [
  {
    id: "kuru_swap",
    when: (ctx) =>
      ctx.intent.protocol === "kuru" && ctx.intent.method === "swap",
    run: (ctx, add) => {
      const intent = ctx.intent as Extract<WorkbenchIntent, { protocol: "kuru" }>;
      const { texts, outcome } = ctx;
      const expect = intent.expect;
      const tokenIn = expect?.tokenIn ?? intent.params.tokenIn;
      const tokenOut = expect?.tokenOut ?? intent.params.tokenOut;
      const amountInHuman = expect?.amountIn ?? intent.params.amountIn;
      const recipient = expect?.recipient ?? intent.account;
      const floor = resolveAmountOutFloor(intent);

      const expectedBase =
        tokenIn === NATIVE
          ? parseUnits(amountInHuman, 18).toString()
          : amountInHuman.includes(".")
            ? null
            : amountInHuman;

      const swapLine = parseKuruSwapText(texts);
      add(
        "text_kuru_swap_line",
        swapLine !== null,
        swapLine
          ? swapLine.raw
          : "missing leaf matching `Kuru Swap: {amountIn} {tokenIn} to {amountOut} {tokenOut} by {sender}`",
      );

      if (swapLine) {
        add(
          "text_token_in",
          tokenMatches(tokenIn, swapLine.tokenIn),
          `text tokenIn want ${tokenIn}, got ${swapLine.tokenIn}`,
        );
        add(
          "text_token_out",
          tokenMatches(tokenOut, swapLine.tokenOut),
          `text tokenOut want ${tokenOut}, got ${swapLine.tokenOut}`,
        );
        if (expectedBase !== null) {
          add(
            "text_amount_in",
            swapLine.amountIn === expectedBase,
            `text amountIn want ${expectedBase}, got ${swapLine.amountIn}`,
          );
        }
        add(
          "text_amount_out_positive",
          BigInt(swapLine.amountOut) > 0n,
          `text amountOut=${swapLine.amountOut}`,
        );
        add(
          "text_recipient",
          lower(swapLine.sender) === lower(recipient),
          `text by/sender want ${recipient}, got ${swapLine.sender}`,
        );
        if (floor !== null) {
          const ok = BigInt(swapLine.amountOut) >= floor;
          add(
            "text_min_amount_out",
            ok,
            `text amountOut ${swapLine.amountOut} ${ok ? ">=" : "<"} floor ${floor.toString()}`,
          );
        }
      }

      add(
        "text_mentions_token_in",
        textsIncludeToken(texts, tokenIn),
        `some leaf must mention tokenIn ${tokenIn}`,
      );
      add(
        "text_mentions_token_out",
        textsIncludeToken(texts, tokenOut),
        `some leaf must mention tokenOut ${tokenOut}`,
      );
      if (expectedBase !== null) {
        add(
          "text_mentions_amount_in",
          textsIncludeAmount(texts, expectedBase),
          `some leaf must mention amountIn ${expectedBase}`,
        );
      }

      const credit = findTokenOutTransferTo(texts, tokenOut, recipient);
      add(
        "text_token_out_credit",
        credit !== null,
        credit
          ? credit
          : `missing ERC20 Transfer of ${tokenOut} to ${recipient}`,
      );

      if (!isJsonRecord(outcome)) {
        add("outcome_shape", false, "Kuru outcome is not an object");
        return;
      }

      const okShape =
        outcome.operation === "swap" &&
        outcome.protocol === "kuru" &&
        typeof outcome.sender === "string" &&
        isAddress(outcome.sender, { strict: false }) &&
        typeof outcome.tokenIn === "string" &&
        typeof outcome.tokenOut === "string" &&
        typeof outcome.amountIn === "string" &&
        typeof outcome.amountOut === "string";

      add("outcome_shape", okShape, "Kuru swap outcome fields");
      if (!okShape) return;

      const sender = outcome.sender as string;
      const actualTokenIn = outcome.tokenIn as string;
      const actualTokenOut = outcome.tokenOut as string;
      const actualAmountIn = outcome.amountIn as string;
      const actualAmountOut = outcome.amountOut as string;

      add(
        "token_in",
        tokenMatches(tokenIn, actualTokenIn),
        `tokenIn want ${tokenIn}, got ${actualTokenIn}`,
      );
      add(
        "token_out",
        tokenMatches(tokenOut, actualTokenOut),
        `tokenOut want ${tokenOut}, got ${actualTokenOut}`,
      );

      if (expectedBase !== null) {
        add(
          "amount_in",
          actualAmountIn === expectedBase,
          `amountIn want ${expectedBase}, got ${actualAmountIn}`,
        );
      }

      add(
        "amount_out_positive",
        BigInt(actualAmountOut) > 0n,
        `amountOut=${actualAmountOut}`,
      );

      if (floor !== null) {
        const ok = BigInt(actualAmountOut) >= floor;
        add(
          "min_amount_out",
          ok,
          `amountOut ${actualAmountOut} ${ok ? ">=" : "<"} floor ${floor.toString()}`,
        );
      }

      add(
        "recipient",
        lower(sender) === lower(recipient),
        `recipient/sender want ${recipient}, got ${sender}`,
      );

      if (swapLine) {
        add(
          "dual_token_in",
          tokenMatches(actualTokenIn, swapLine.tokenIn),
          `outcome tokenIn ${actualTokenIn} vs text ${swapLine.tokenIn}`,
        );
        add(
          "dual_token_out",
          tokenMatches(actualTokenOut, swapLine.tokenOut),
          `outcome tokenOut ${actualTokenOut} vs text ${swapLine.tokenOut}`,
        );
        add(
          "dual_amount_in",
          actualAmountIn === swapLine.amountIn,
          `outcome amountIn ${actualAmountIn} vs text ${swapLine.amountIn}`,
        );
        add(
          "dual_amount_out",
          actualAmountOut === swapLine.amountOut,
          `outcome amountOut ${actualAmountOut} vs text ${swapLine.amountOut}`,
        );
        add(
          "dual_sender",
          lower(sender) === lower(swapLine.sender),
          `outcome sender ${sender} vs text ${swapLine.sender}`,
        );
      }
    },
  },
];
