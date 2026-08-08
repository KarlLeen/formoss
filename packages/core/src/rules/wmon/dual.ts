import type { WmonOutcome } from "../../mossTypes.js";
import type { parseWmonText } from "../../textMatch.js";
import { lower } from "../helpers.js";
import type { AddCheck } from "../types.js";

type WmonLine = NonNullable<ReturnType<typeof parseWmonText>>;

export function matchWmonDual(
  outcome: WmonOutcome,
  wmonLine: WmonLine,
  add: AddCheck,
): void {
  add(
    "dual_wmon_amount",
    outcome.amount === wmonLine.amount,
    `outcome amount ${outcome.amount} vs text ${wmonLine.amount}`,
  );
  add(
    "dual_wmon_account",
    lower(outcome.account) === lower(wmonLine.account),
    `outcome account ${outcome.account} vs text ${wmonLine.account}`,
  );
}
