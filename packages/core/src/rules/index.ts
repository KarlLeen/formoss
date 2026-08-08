import { approvalRules } from "./approvals.js";
import { commonRules } from "./common.js";
import { assertAlignRulesCoverProtocols } from "./coverage.js";
import { kuruSwapRules } from "./kuruSwap.js";
import type { AlignRule } from "./types.js";
import { wmonRules } from "./wmon.js";

/** Ordered align rule table — extend by appending protocol rule modules. */
export const ALIGN_RULES: readonly AlignRule[] = [
  ...commonRules,
  ...approvalRules,
  ...kuruSwapRules,
  ...wmonRules,
];

assertAlignRulesCoverProtocols(ALIGN_RULES);

export type { AlignContext, AlignRule, AlignWhen, AddCheck } from "./types.js";
export { matchWhen } from "./types.js";
export {
  assertAlignRulesCoverProtocols,
  REQUIRED_PROTOCOL_METHODS,
} from "./coverage.js";
