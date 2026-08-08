import type { KuruSwapOutcome } from "../../mossTypes.js";
import type { ParsedKuruSwapText } from "../../textMatch.js";
import { lower, tokenMatches } from "../helpers.js";
import type { AddCheck } from "../types.js";

export function matchKuruDual(
  outcome: KuruSwapOutcome,
  swapLine: ParsedKuruSwapText,
  add: AddCheck,
): void {
  add(
    "dual_token_in",
    tokenMatches(outcome.tokenIn, swapLine.tokenIn),
    `outcome tokenIn ${outcome.tokenIn} vs text ${swapLine.tokenIn}`,
  );
  add(
    "dual_token_out",
    tokenMatches(outcome.tokenOut, swapLine.tokenOut),
    `outcome tokenOut ${outcome.tokenOut} vs text ${swapLine.tokenOut}`,
  );
  add(
    "dual_amount_in",
    outcome.amountIn === swapLine.amountIn,
    `outcome amountIn ${outcome.amountIn} vs text ${swapLine.amountIn}`,
  );
  add(
    "dual_amount_out",
    outcome.amountOut === swapLine.amountOut,
    `outcome amountOut ${outcome.amountOut} vs text ${swapLine.amountOut}`,
  );
  add(
    "dual_sender",
    lower(outcome.sender) === lower(swapLine.sender),
    `outcome sender ${outcome.sender} vs text ${swapLine.sender}`,
  );
}
