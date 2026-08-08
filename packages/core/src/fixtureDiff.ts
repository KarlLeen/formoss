import { canonicalJSON } from "./envelope.js";
import type { PipelineFixture } from "./fixture.js";

export type FixtureDiff = {
  readonly ok: boolean;
  readonly textsEqual: boolean;
  readonly outcomeEqual: boolean;
  readonly warningsEqual: boolean;
  readonly metaEqual: boolean;
  readonly capabilityEqual: boolean;
  readonly addedTexts: readonly string[];
  readonly removedTexts: readonly string[];
  readonly changedIndexes: readonly number[];
  readonly detail: string;
  /** Shown when any compared field differs — Receipt/convention drift hint. */
  readonly hint: string | null;
};

const DRIFT_HINT =
  "Fixture texts/outcome/warnings/capability differ — Moss Receipt conventions or tree shape may have changed; review align matchers before replacing canned fixtures.";

/**
 * Compare capture-relevant fields between two fixtures.
 */
export function diffFixtures(
  baseline: PipelineFixture,
  next: PipelineFixture,
): FixtureDiff {
  const a = baseline.simulate.texts;
  const b = next.simulate.texts;
  const max = Math.max(a.length, b.length);
  const addedTexts: string[] = [];
  const removedTexts: string[] = [];
  const changedIndexes: number[] = [];

  for (let i = 0; i < max; i++) {
    const left = a[i];
    const right = b[i];
    if (left === undefined && right !== undefined) {
      addedTexts.push(right);
      continue;
    }
    if (right === undefined && left !== undefined) {
      removedTexts.push(left);
      continue;
    }
    if (left !== right) {
      changedIndexes.push(i);
    }
  }

  const textsEqual =
    addedTexts.length === 0 &&
    removedTexts.length === 0 &&
    changedIndexes.length === 0;

  const outcomeEqual =
    canonicalJSON(baseline.simulate.receiptOutcome ?? null) ===
    canonicalJSON(next.simulate.receiptOutcome ?? null);

  const warningsEqual =
    canonicalJSON(baseline.simulate.warnings) ===
    canonicalJSON(next.simulate.warnings);

  const metaEqual =
    baseline.simulate.protocol === next.simulate.protocol &&
    baseline.simulate.method === next.simulate.method;

  const capabilityEqual =
    canonicalJSON(baseline.capability ?? null) ===
    canonicalJSON(next.capability ?? null);

  const ok =
    textsEqual &&
    outcomeEqual &&
    warningsEqual &&
    metaEqual &&
    capabilityEqual;

  const parts: string[] = [];
  if (!textsEqual) {
    parts.push(
      `texts: +${addedTexts.length} -${removedTexts.length} ~${changedIndexes.length}`,
    );
  } else {
    parts.push(`texts: ${a.length} unchanged`);
  }
  parts.push(outcomeEqual ? "outcome: unchanged" : "outcome: changed");
  parts.push(warningsEqual ? "warnings: unchanged" : "warnings: changed");
  parts.push(
    metaEqual
      ? "protocol/method: unchanged"
      : `protocol/method: ${baseline.simulate.protocol}.${baseline.simulate.method} → ${next.simulate.protocol}.${next.simulate.method}`,
  );
  parts.push(
    capabilityEqual ? "capability: unchanged" : "capability: changed",
  );

  return {
    ok,
    textsEqual,
    outcomeEqual,
    warningsEqual,
    metaEqual,
    capabilityEqual,
    addedTexts,
    removedTexts,
    changedIndexes,
    detail: parts.join("; "),
    hint: ok ? null : DRIFT_HINT,
  };
}
