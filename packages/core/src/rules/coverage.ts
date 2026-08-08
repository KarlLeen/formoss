import type { AlignRule } from "./types.js";

/** Protocol methods that must have at least one non-common align rule. */
export const REQUIRED_PROTOCOL_METHODS = [
  { protocol: "kuru", method: "swap" },
  { protocol: "wmon", method: "wrap" },
  { protocol: "wmon", method: "unwrap" },
] as const;

const COMMON_RULE_IDS = new Set(["protocol_method", "receipt_texts"]);

function ruleCovers(
  rule: AlignRule,
  protocol: string,
  method: string,
): boolean {
  if (COMMON_RULE_IDS.has(rule.id)) return false;
  const when = rule.when;
  if (when.protocol !== undefined) {
    const allowed = Array.isArray(when.protocol)
      ? when.protocol
      : [when.protocol];
    if (!allowed.includes(protocol as never)) return false;
  }
  if (when.method !== undefined) {
    const allowed = Array.isArray(when.method) ? when.method : [when.method];
    if (!allowed.includes(method)) return false;
  }
  // Empty when {} would match everything — treat as not protocol-specific.
  if (when.protocol === undefined && when.method === undefined) return false;
  return true;
}

/**
 * Ensure every required protocol.method has a dedicated align rule.
 * Call at ALIGN_RULES module load.
 */
export function assertAlignRulesCoverProtocols(
  rules: readonly AlignRule[],
): void {
  const missing: string[] = [];
  for (const req of REQUIRED_PROTOCOL_METHODS) {
    const ok = rules.some((rule) =>
      ruleCovers(rule, req.protocol, req.method),
    );
    if (!ok) missing.push(`${req.protocol}.${req.method}`);
  }
  if (missing.length > 0) {
    throw new Error(
      `ALIGN_RULES missing protocol-specific matchers for: ${missing.join(", ")}`,
    );
  }
}
