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

export type AlignRule = {
  readonly id: string;
  readonly when: (ctx: AlignContext) => boolean;
  readonly run: (ctx: AlignContext, add: AddCheck) => void;
};
