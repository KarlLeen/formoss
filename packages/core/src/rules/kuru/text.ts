import {
  findTokenOutTransferTo,
  parseKuruSwapText,
  textsIncludeAmount,
  textsIncludeToken,
  type ParsedKuruSwapText,
} from "../../textMatch.js";
import { lower, tokenMatches } from "../helpers.js";
import type { AddCheck } from "../types.js";
import type { KuruExpect } from "./context.js";

export function matchKuruTexts(
  texts: readonly string[],
  expect: KuruExpect,
  add: AddCheck,
): ParsedKuruSwapText | null {
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
      tokenMatches(expect.tokenIn, swapLine.tokenIn),
      `text tokenIn want ${expect.tokenIn}, got ${swapLine.tokenIn}`,
    );
    add(
      "text_token_out",
      tokenMatches(expect.tokenOut, swapLine.tokenOut),
      `text tokenOut want ${expect.tokenOut}, got ${swapLine.tokenOut}`,
    );
    if (expect.expectedBase !== null) {
      add(
        "text_amount_in",
        swapLine.amountIn === expect.expectedBase,
        `text amountIn want ${expect.expectedBase}, got ${swapLine.amountIn}`,
      );
    }
    add(
      "text_amount_out_positive",
      BigInt(swapLine.amountOut) > 0n,
      `text amountOut=${swapLine.amountOut}`,
    );
    add(
      "text_recipient",
      lower(swapLine.sender) === lower(expect.recipient),
      `text by/sender want ${expect.recipient}, got ${swapLine.sender}`,
    );
    if (expect.floor !== null) {
      const ok = BigInt(swapLine.amountOut) >= expect.floor;
      add(
        "text_min_amount_out",
        ok,
        `text amountOut ${swapLine.amountOut} ${ok ? ">=" : "<"} floor ${expect.floor.toString()}`,
      );
    }
  }

  add(
    "text_mentions_token_in",
    textsIncludeToken(texts, expect.tokenIn),
    `some leaf must mention tokenIn ${expect.tokenIn}`,
  );
  add(
    "text_mentions_token_out",
    textsIncludeToken(texts, expect.tokenOut),
    `some leaf must mention tokenOut ${expect.tokenOut}`,
  );
  if (expect.expectedBase !== null) {
    add(
      "text_mentions_amount_in",
      textsIncludeAmount(texts, expect.expectedBase),
      `some leaf must mention amountIn ${expect.expectedBase}`,
    );
  }

  const credit = findTokenOutTransferTo(
    texts,
    expect.tokenOut,
    expect.recipient,
  );
  add(
    "text_token_out_credit",
    credit !== null,
    credit
      ? credit
      : `missing ERC20 Transfer of ${expect.tokenOut} to ${expect.recipient}`,
  );

  return swapLine;
}
