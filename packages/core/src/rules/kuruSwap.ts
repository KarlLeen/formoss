import type { AlignRule } from "./types.js";
import { kuruExpect } from "./kuru/context.js";
import { matchKuruDual } from "./kuru/dual.js";
import { matchKuruOutcome } from "./kuru/outcome.js";
import { matchKuruTexts } from "./kuru/text.js";
import { matchKuruTree } from "./kuru/tree.js";

/** Compose text → outcome → dual → tree matchers for Kuru swap. */
export const kuruSwapRules: readonly AlignRule[] = [
  {
    id: "kuru_swap",
    when: { protocol: "kuru", method: "swap" },
    run: (ctx, add) => {
      const expect = kuruExpect(ctx);
      add(
        "slippage_floor_missing",
        expect.floor !== null,
        expect.floor !== null
          ? `amountOut floor ${expect.floor.toString()} (from expect.minAmountOut or estimatedAmountOut+slippage)`
          : "params.slippage set but no expect.minAmountOut / expect.estimatedAmountOut — refuse amountOut>0-only gate",
      );
      const swapLine = matchKuruTexts(ctx.texts, expect, add);
      const outcome = matchKuruOutcome(ctx.outcome, expect, add);
      if (swapLine && outcome) {
        matchKuruDual(outcome, swapLine, add);
      }
      matchKuruTree(ctx.capability, ctx.texts, ctx.outcome, expect, add);
    },
  },
];
