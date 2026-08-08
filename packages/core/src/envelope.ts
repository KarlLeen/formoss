import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { alignIntent, type AlignResult } from "./align.js";
import type { PipelineStatus } from "./codes.js";
import { parseIntent, type WorkbenchIntent } from "./intent.js";
import type { PipelineStep } from "./types.js";

export type EnvelopeDigest = {
  readonly alg: "sha256";
  readonly hex: string;
};

export type VerificationEnvelope = {
  readonly kind: "sealmoss.verification";
  readonly version: 1;
  readonly verified: boolean;
  readonly status: PipelineStatus;
  readonly createdAt: string;
  readonly sealmossVersion: string;
  readonly moss: {
    readonly core?: string;
    readonly protocolKuru?: string;
  };
  readonly intent: WorkbenchIntent;
  readonly steps: readonly PipelineStep[];
  readonly texts: readonly string[];
  readonly warnings: readonly string[];
  readonly align: AlignResult | null;
  /** Unsigned Capability tree — only non-null when verified === true. */
  readonly capability: unknown | null;
  /**
   * Structured simulate outcome for `verify-envelope --recheck`.
   * Not included in digest (evidence binding stays intent/texts/align/capability).
   */
  readonly receiptOutcome?: unknown;
  readonly digest: EnvelopeDigest;
  readonly error?: string;
};

const require = createRequire(import.meta.url);

function readPkgVersion(specifier: string): string | undefined {
  try {
    const pkg = require(`${specifier}/package.json`) as { version?: string };
    return typeof pkg.version === "string" ? pkg.version : undefined;
  } catch {
    return undefined;
  }
}

export function resolveSealmossVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(
      readFileSync(join(here, "..", "package.json"), "utf8"),
    ) as { version?: string };
    if (typeof pkg.version === "string") return pkg.version;
  } catch {
    // fall through
  }
  return readPkgVersion("@sealmoss/core") ?? "0.1.0";
}

export function resolveMossVersions(): VerificationEnvelope["moss"] {
  return {
    core: readPkgVersion("@themoss/core"),
    protocolKuru: readPkgVersion("@themoss/protocol-kuru"),
  };
}

/** Stable JSON for hashing (sorted object keys). */
export function canonicalJSON(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortValue(obj[key]);
    }
    return out;
  }
  return value;
}

export function computeEnvelopeDigest(payload: {
  intent: WorkbenchIntent;
  texts: readonly string[];
  align: AlignResult | null;
  capability: unknown | null;
  status: PipelineStatus;
  verified: boolean;
}): EnvelopeDigest {
  const hex = createHash("sha256")
    .update(
      canonicalJSON({
        intent: payload.intent,
        texts: payload.texts,
        align: payload.align,
        capability: payload.capability,
        status: payload.status,
        verified: payload.verified,
      }),
    )
    .digest("hex");
  return { alg: "sha256", hex };
}

export function buildEnvelope(args: {
  status: PipelineStatus;
  intent: WorkbenchIntent;
  steps: readonly PipelineStep[];
  texts: readonly string[];
  warnings: readonly string[];
  align: AlignResult | null;
  /** Raw Capability tree from action/fixture; stripped unless status === ok. */
  capability: unknown | null;
  receiptOutcome?: unknown;
  error?: string;
  createdAt?: string;
}): VerificationEnvelope {
  const verified = args.status === "ok";
  const capability = verified ? args.capability : null;
  return {
    kind: "sealmoss.verification",
    version: 1,
    verified,
    status: args.status,
    createdAt: args.createdAt ?? new Date().toISOString(),
    sealmossVersion: resolveSealmossVersion(),
    moss: resolveMossVersions(),
    intent: args.intent,
    steps: args.steps,
    texts: args.texts,
    warnings: args.warnings,
    align: args.align,
    capability,
    ...(args.receiptOutcome !== undefined
      ? { receiptOutcome: args.receiptOutcome }
      : {}),
    digest: computeEnvelopeDigest({
      intent: args.intent,
      texts: args.texts,
      align: args.align,
      capability,
      status: args.status,
      verified,
    }),
    ...(args.error !== undefined ? { error: args.error } : {}),
  };
}

export type VerifyEnvelopeResult = {
  readonly ok: boolean;
  /** True when input is not a usable envelope (CLI exit 1). */
  readonly structural: boolean;
  readonly expected: string | null;
  readonly actual: string | null;
  readonly detail: string;
};

function structuralFail(detail: string): VerifyEnvelopeResult {
  return {
    ok: false,
    structural: true,
    expected: null,
    actual: null,
    detail,
  };
}

function verifyFail(
  detail: string,
  expected: string | null = null,
  actual: string | null = null,
): VerifyEnvelopeResult {
  return { ok: false, structural: false, expected, actual, detail };
}

export type VerifyEnvelopeOptions = {
  /** Re-run alignIntent against envelope evidence (verified envelopes only). */
  readonly recheck?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Recompute digest, check envelope invariants, optionally re-run align.
 */
export function verifyEnvelope(
  raw: unknown,
  options: VerifyEnvelopeOptions = {},
): VerifyEnvelopeResult {
  if (!isRecord(raw)) {
    return structuralFail("envelope must be a JSON object");
  }
  if (raw.kind !== "sealmoss.verification") {
    return structuralFail(
      `expected kind "sealmoss.verification", got ${JSON.stringify(raw.kind)}`,
    );
  }
  if (raw.version !== 1) {
    return structuralFail(
      `unsupported envelope version ${JSON.stringify(raw.version)}`,
    );
  }
  if (typeof raw.verified !== "boolean") {
    return structuralFail("envelope.verified must be boolean");
  }
  if (typeof raw.status !== "string") {
    return structuralFail("envelope.status must be a string");
  }
  if (!isRecord(raw.intent)) {
    return structuralFail("envelope.intent missing");
  }
  if (!Array.isArray(raw.texts)) {
    return structuralFail("envelope.texts must be an array");
  }
  if (!isRecord(raw.digest) || typeof raw.digest.hex !== "string") {
    return structuralFail("envelope.digest.hex missing");
  }

  const status = raw.status as PipelineStatus;
  const verified = raw.verified;
  const capability = raw.capability ?? null;
  const align = (raw.align ?? null) as AlignResult | null;

  if (verified !== (status === "ok")) {
    return verifyFail(
      `invariant: verified (${verified}) must equal status==="ok" (status=${status})`,
    );
  }
  if (!verified && capability !== null) {
    return verifyFail(
      "invariant: non-verified envelope must have capability null",
    );
  }
  if (verified && capability === null) {
    return verifyFail("invariant: verified envelope must nest a capability");
  }
  if (verified && align?.ok !== true) {
    return verifyFail("invariant: verified envelope requires align.ok === true");
  }

  let intent: WorkbenchIntent;
  try {
    intent = parseIntent(raw.intent);
  } catch (error) {
    return structuralFail(
      `invalid intent: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const expected = computeEnvelopeDigest({
    intent,
    texts: raw.texts as readonly string[],
    align,
    capability,
    status,
    verified,
  });
  const actual = raw.digest.hex.toLowerCase();
  if (expected.hex !== actual) {
    return verifyFail(
      `digest mismatch: expected sha256:${expected.hex}, got sha256:${actual}`,
      expected.hex,
      actual,
    );
  }

  if (options.recheck) {
    if (!verified) {
      return verifyFail(
        "recheck requires a verified envelope",
        expected.hex,
        actual,
      );
    }
    const re = alignIntent({
      intent,
      texts: raw.texts as readonly string[],
      outcome: raw.receiptOutcome ?? null,
      protocol: intent.protocol,
      method: intent.method,
      capability,
    });
    if (!re.ok) {
      const failed = re.checks
        .filter((c) => !c.ok)
        .map((c) => c.id)
        .slice(0, 8);
      return verifyFail(
        `recheck align failed: ${failed.join(", ") || "unknown"}`,
        expected.hex,
        actual,
      );
    }
    return {
      ok: true,
      structural: false,
      expected: expected.hex,
      actual,
      detail: `digest+invariants+recheck ok (sha256:${expected.hex.slice(0, 16)}…)`,
    };
  }

  return {
    ok: true,
    structural: false,
    expected: expected.hex,
    actual,
    detail: `digest+invariants ok (sha256:${expected.hex.slice(0, 16)}…)`,
  };
}
