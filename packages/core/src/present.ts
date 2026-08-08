import type { AlignResult } from "./align.js";
import type { PipelineStatus } from "./codes.js";
import { buildEnvelope, type VerificationEnvelope } from "./envelope.js";
import type { WorkbenchIntent } from "./intent.js";
import type { PipelineStep } from "./types.js";

export type PresentInput = {
  intent: WorkbenchIntent;
  status: PipelineStatus;
  steps: readonly PipelineStep[];
  align: AlignResult | null;
  texts: readonly string[];
  capability: unknown | null;
  warnings: readonly string[];
  error?: string;
  verbose?: boolean;
};

export type PresentOutput = {
  /** Human-readable review summary (markdown). */
  summary: string;
  /** Run record envelope — capability nested only when verified. */
  artifact: VerificationEnvelope;
};

export function present(input: PresentInput): PresentOutput {
  const align = input.align ?? { ok: false, checks: [] };
  const envelope = buildEnvelope({
    status: input.status,
    intent: input.intent,
    steps: input.steps,
    texts: input.texts,
    warnings: input.warnings,
    align: input.align,
    capability: input.capability,
    error: input.error,
  });
  return {
    summary: formatSummary(
      {
        ...input,
        align,
        envelope,
      },
      { verbose: input.verbose === true },
    ),
    artifact: envelope,
  };
}

export function formatSummary(
  input: {
    intent: WorkbenchIntent;
    steps: readonly PipelineStep[];
    align: AlignResult;
    texts: readonly string[];
    warnings: readonly string[];
    envelope: VerificationEnvelope;
    error?: string;
  },
  options: { verbose: boolean },
): string {
  const lines: string[] = [];
  lines.push("# Formoss verification report");
  lines.push("");
  lines.push(
    `envelope: **${input.envelope.verified ? "verified" : "failed"}** · status \`${input.envelope.status}\``,
  );
  lines.push(
    `Intent: \`${input.intent.protocol}.${input.intent.method}\` as \`${input.intent.account}\``,
  );
  lines.push("");
  lines.push("## Pipeline");
  for (const step of input.steps) {
    const mark = step.status === "ok" ? "OK" : step.status.toUpperCase();
    lines.push(`- **${step.name}**: ${mark} — ${step.detail}`);
  }

  if (options.verbose) {
    lines.push("");
    lines.push("## Receipt leaf texts (ordered)");
    if (input.texts.length === 0) {
      lines.push("_none_");
    } else {
      for (const [i, text] of input.texts.entries()) {
        lines.push(`${i + 1}. \`${text}\``);
      }
    }
  } else if (input.texts.length > 0) {
    lines.push("");
    lines.push(`## Receipt leaf texts: ${input.texts.length} (use --verbose to list)`);
  }

  lines.push("");
  lines.push("## Alignment");
  const failed = input.align.checks.filter((c) => !c.ok);
  const passed = input.align.checks.filter((c) => c.ok);
  if (options.verbose) {
    for (const check of input.align.checks) {
      lines.push(
        `- [${check.ok ? "x" : " "}] \`${check.id}\` — ${check.detail}`,
      );
    }
    if (input.align.checks.length === 0) {
      lines.push("_none_");
    }
  } else if (failed.length > 0) {
    lines.push(`${failed.length} failed / ${passed.length} passed — failures:`);
    for (const check of failed) {
      lines.push(`- [ ] \`${check.id}\` — ${check.detail}`);
    }
  } else if (passed.length > 0) {
    lines.push(`${passed.length} checks passed`);
  } else {
    lines.push("_skipped or empty_");
  }

  if (input.warnings.length > 0) {
    lines.push("");
    lines.push("## Warnings");
    for (const warning of input.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push("");
  if (input.envelope.verified) {
    lines.push(
      `digest: \`${input.envelope.digest.alg}:${input.envelope.digest.hex.slice(0, 16)}…\``,
    );
    lines.push("");
    lines.push(
      "**Result:** verified envelope ready. Review intent, Receipt texts, and Capability before any signer sees them. Formoss never signs or broadcasts.",
    );
  } else {
    lines.push(
      "**Result:** NOT verified. Capability omitted from envelope. Do not sign.",
    );
    if (input.error) {
      lines.push(`Error: ${input.error}`);
    }
  }
  return lines.join("\n");
}
