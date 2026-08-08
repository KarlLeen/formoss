import type { WorkbenchIntent } from "./intent.js";
import { ALIGN_RULES } from "./rules/index.js";
import type { AlignCheck } from "./rules/types.js";

export type { AlignCheck } from "./rules/types.js";

export type AlignResult = {
  readonly ok: boolean;
  readonly checks: AlignCheck[];
};

/**
 * Align structured outcomes and ordered Receipt leaf texts with intent.
 * Fail-closed: any failed check makes the whole alignment fail.
 * Rules live in `rules/*` (table-driven).
 */
export function alignIntent(args: {
  intent: WorkbenchIntent;
  texts: readonly string[];
  outcome: unknown;
  protocol: string;
  method: string;
  capability?: unknown;
}): AlignResult {
  const checks: AlignCheck[] = [];
  const add = (id: string, ok: boolean, detail: string): void => {
    checks.push({ id, ok, detail });
  };

  const ctx = {
    intent: args.intent,
    texts: args.texts,
    outcome: args.outcome,
    protocol: args.protocol,
    method: args.method,
    capability: args.capability,
  };

  for (const rule of ALIGN_RULES) {
    if (!rule.when(ctx)) continue;
    rule.run(ctx, add);
  }

  return { ok: checks.every((check) => check.ok), checks };
}

/** Pure helper exported for unit tests with fixture texts/outcomes. */
export function alignFixture(args: {
  intent: WorkbenchIntent;
  texts: readonly string[];
  outcome: unknown;
  capability?: unknown;
}): AlignResult {
  return alignIntent({
    ...args,
    protocol: args.intent.protocol,
    method: args.intent.method,
  });
}
