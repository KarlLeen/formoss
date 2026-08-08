import { approvalRules } from "./approvals.js";
import { commonRules } from "./common.js";
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

export type { AlignContext, AlignRule, AddCheck } from "./types.js";
