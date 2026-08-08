import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AlignResult } from "./align.js";
import type { PipelineStatus } from "./codes.js";
import type { WorkbenchIntent } from "./intent.js";
import type { PipelineStep } from "./types.js";

export type EnvelopeDigest = {
  readonly alg: "sha256";
  readonly hex: string;
};

export type VerificationEnvelope = {
  readonly kind: "formoss.verification";
  readonly version: 1;
  readonly verified: boolean;
  readonly status: PipelineStatus;
  readonly createdAt: string;
  readonly formossVersion: string;
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

export function resolveFormossVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(
      readFileSync(join(here, "..", "package.json"), "utf8"),
    ) as { version?: string };
    if (typeof pkg.version === "string") return pkg.version;
  } catch {
    // fall through
  }
  return readPkgVersion("@formoss/core") ?? "0.1.0";
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
  error?: string;
  createdAt?: string;
}): VerificationEnvelope {
  const verified = args.status === "ok";
  const capability = verified ? args.capability : null;
  return {
    kind: "formoss.verification",
    version: 1,
    verified,
    status: args.status,
    createdAt: args.createdAt ?? new Date().toISOString(),
    formossVersion: resolveFormossVersion(),
    moss: resolveMossVersions(),
    intent: args.intent,
    steps: args.steps,
    texts: args.texts,
    warnings: args.warnings,
    align: args.align,
    capability,
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
