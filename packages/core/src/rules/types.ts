import type { WorkbenchIntent } from "../intent.js";

export type AlignCheck = {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
};

export type AlignContext = {
  readonly intent: WorkbenchIntent;
  readonly texts: readonly string[];
  readonly outcome: unknown;
  readonly protocol: string;
  readonly method: string;
  readonly capability: unknown;
};

export type AddCheck = (
  id: string,
  ok: boolean,
  detail: string,
) => void;

/** Declarative gate: protocol/method match (optional extras via `when`). */
export type AlignWhen = {
  readonly protocol?: WorkbenchIntent["protocol"] | readonly WorkbenchIntent["protocol"][];
  readonly method?: string | readonly string[];
  readonly when?: (ctx: AlignContext) => boolean;
};

export type AlignRule = {
  readonly id: string;
  readonly when: AlignWhen;
  readonly run: (ctx: AlignContext, add: AddCheck) => void;
};

export function matchWhen(spec: AlignWhen, ctx: AlignContext): boolean {
  if (spec.protocol !== undefined) {
    const allowed = Array.isArray(spec.protocol)
      ? spec.protocol
      : [spec.protocol];
    if (!allowed.includes(ctx.intent.protocol)) return false;
  }
  if (spec.method !== undefined) {
    const allowed = Array.isArray(spec.method) ? spec.method : [spec.method];
    if (!allowed.includes(ctx.intent.method)) return false;
  }
  if (spec.when && !spec.when(ctx)) return false;
  return true;
}
