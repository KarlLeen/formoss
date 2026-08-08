import {
  parseKuruSwapOutcome,
  type KuruSwapOutcome,
} from "../../mossTypes.js";
import { lower, tokenMatches } from "../helpers.js";
import type { AddCheck } from "../types.js";
import type { KuruExpect } from "./context.js";

export function matchKuruOutcome(
  outcome: unknown,
  expect: KuruExpect,
  add: AddCheck,
): KuruSwapOutcome | null {
  const parsed = parseKuruSwapOutcome(outcome);
  add("outcome_shape", parsed !== null, "Kuru swap outcome fields");
  if (!parsed) return null;

  add(
    "token_in",
    tokenMatches(expect.tokenIn, parsed.tokenIn),
    `tokenIn want ${expect.tokenIn}, got ${parsed.tokenIn}`,
  );
  add(
    "token_out",
    tokenMatches(expect.tokenOut, parsed.tokenOut),
    `tokenOut want ${expect.tokenOut}, got ${parsed.tokenOut}`,
  );

  if (expect.expectedBase !== null) {
    add(
      "amount_in",
      parsed.amountIn === expect.expectedBase,
      `amountIn want ${expect.expectedBase}, got ${parsed.amountIn}`,
    );
  }

  add(
    "amount_out_positive",
    BigInt(parsed.amountOut) > 0n,
    `amountOut=${parsed.amountOut}`,
  );

  if (expect.floor !== null) {
    const ok = BigInt(parsed.amountOut) >= expect.floor;
    add(
      "min_amount_out",
      ok,
      `amountOut ${parsed.amountOut} ${ok ? ">=" : "<"} floor ${expect.floor.toString()}`,
    );
  }

  add(
    "recipient",
    lower(parsed.sender) === lower(expect.recipient),
    `recipient/sender want ${expect.recipient}, got ${parsed.sender}`,
  );

  return parsed;
}
