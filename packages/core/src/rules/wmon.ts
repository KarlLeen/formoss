import { parseUnits } from "viem";
import type { WorkbenchIntent } from "../intent.js";
import type { AlignRule } from "./types.js";
import { matchWmonDual } from "./wmon/dual.js";
import { matchWmonOutcome } from "./wmon/outcome.js";
import { matchWmonTexts } from "./wmon/text.js";

type WmonIntent = Extract<WorkbenchIntent, { protocol: "wmon" }>;

/** Compose text → outcome → dual matchers for WMON wrap/unwrap. */
export const wmonRules: readonly AlignRule[] = [
  {
    id: "wmon",
    when: { protocol: "wmon", method: ["wrap", "unwrap"] },
    run: (ctx, add) => {
      const intent = ctx.intent as WmonIntent;
      const recipient = intent.expect?.recipient ?? intent.account;
      const expected = parseUnits(intent.params.amount, 18).toString();

      const wmonLine = matchWmonTexts(
        intent,
        ctx.texts,
        recipient,
        expected,
        add,
      );
      const outcome = matchWmonOutcome(
        ctx.outcome,
        intent,
        recipient,
        expected,
        add,
      );
      if (wmonLine && outcome) {
        matchWmonDual(outcome, wmonLine, add);
      }
    },
  },
];
