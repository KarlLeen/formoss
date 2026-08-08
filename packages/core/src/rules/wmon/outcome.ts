import type { WorkbenchIntent } from "../../intent.js";
import { parseWmonOutcome, type WmonOutcome } from "../../mossTypes.js";
import { lower } from "../helpers.js";
import type { AddCheck } from "../types.js";

type WmonIntent = Extract<WorkbenchIntent, { protocol: "wmon" }>;

export function matchWmonOutcome(
  outcomeRaw: unknown,
  intent: WmonIntent,
  recipient: string,
  expected: string,
  add: AddCheck,
): WmonOutcome | null {
  const outcome = parseWmonOutcome(outcomeRaw);
  const opOk =
    outcome !== null &&
    (outcome.operation === intent.method || outcome.operation === undefined);
  add("outcome_shape", opOk, "WMON outcome fields");
  if (!outcome || !opOk) return null;

  add(
    "recipient",
    lower(outcome.account) === lower(recipient),
    `account want ${recipient}, got ${outcome.account}`,
  );

  if (!intent.expect?.amountIn) {
    add(
      "amount",
      outcome.amount === expected,
      `amount want ${expected}, got ${outcome.amount}`,
    );
  }

  return outcome;
}
