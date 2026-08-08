import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  buildEnvelope,
  computeEnvelopeDigest,
  formatSummary,
  parseIntent,
  parsePipelineFixture,
  present,
  runPipeline,
  verifyEnvelope,
} from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../");
const account = "0xcccccccccccccccccccccccccccccccccccccccc";
const happyIntent = {
  protocol: "kuru" as const,
  method: "swap" as const,
  account,
  params: {
    tokenIn: "native" as const,
    tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    amountIn: "0.01",
    slippage: 50,
  },
  expect: { estimatedAmountOut: "223" },
};

describe("VerificationEnvelope", () => {
  it("ok run nests capability; fail/warning omit it", async () => {
    const okFixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const ok = await runPipeline({
      intent: parseIntent(happyIntent),
      fixture: okFixture,
    });
    assert.equal(ok.status, "ok");
    assert.equal(ok.artifact.kind, "sealmoss.verification");
    assert.equal(ok.artifact.verified, true);
    assert.notEqual(ok.artifact.capability, null);
    assert.ok(ok.artifact.sealmossVersion);
    assert.equal(ok.artifact.digest.alg, "sha256");
    assert.match(ok.artifact.digest.hex, /^[a-f0-9]{64}$/);

    const warnFixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(
          join(root, "demos/fixtures/simulate-warning.json"),
          "utf8",
        ),
      ),
    );
    const warn = await runPipeline({
      intent: parseIntent(happyIntent),
      fixture: warnFixture,
    });
    assert.equal(warn.status, "warning");
    assert.equal(warn.artifact.verified, false);
    assert.equal(warn.artifact.capability, null);
  });

  it("presents once and digest verifies (no double-present drift)", async () => {
    const okFixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const ok = await runPipeline({
      intent: parseIntent(happyIntent),
      fixture: okFixture,
    });
    assert.equal(
      ok.steps.filter((s) => s.name === "present").length,
      1,
      "present step must appear exactly once",
    );
    const verified = verifyEnvelope(ok.artifact);
    assert.equal(verified.ok, true, verified.detail);
    const recheck = verifyEnvelope(ok.artifact, { recheck: true });
    assert.equal(recheck.ok, true, recheck.detail);
  });

  it("verifyEnvelope detects tampered hashed fields", async () => {
    const okFixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const ok = await runPipeline({
      intent: parseIntent(happyIntent),
      fixture: okFixture,
    });
    const tampered = {
      ...ok.artifact,
      texts: [...ok.artifact.texts, "TAMPER"],
    };
    const result = verifyEnvelope(tampered);
    assert.equal(result.ok, false);
    assert.equal(result.structural, false);
    assert.match(result.detail, /digest mismatch/);
  });

  it("verifyEnvelope rejects self-consistent forgery (verified without align.ok)", () => {
    const intent = parseIntent(happyIntent);
    const forgedCap = { kind: "forged" };
    const align = { ok: false, checks: [] };
    const digest = computeEnvelopeDigest({
      intent,
      texts: ["leaf"],
      align,
      capability: forgedCap,
      status: "ok",
      verified: true,
    });
    const forged = {
      ...buildEnvelope({
        status: "align_fail",
        intent,
        steps: [],
        texts: ["leaf"],
        warnings: [],
        align,
        capability: null,
      }),
      verified: true,
      status: "ok" as const,
      capability: forgedCap,
      align,
      digest,
    };
    const result = verifyEnvelope(forged);
    assert.equal(result.ok, false);
    assert.equal(result.structural, false);
    assert.match(result.detail, /align\.ok/);
  });

  it("default summary hides per-leaf nonempty noise; verbose lists checks", () => {
    const intent = parseIntent({
      protocol: "kuru",
      method: "swap",
      account,
      params: {
        tokenIn: "native",
        tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
        amountIn: "0.01",
        slippage: 50,
      },
    });
    const concise = present({
      status: "align_fail",
      intent,
      steps: [{ name: "align", status: "fail", detail: "1 failed" }],
      align: {
        ok: false,
        checks: [
          { id: "text_0_nonempty", ok: true, detail: "ok" },
          { id: "recipient", ok: false, detail: "want A got B" },
        ],
      },
      texts: ["leaf-a", "leaf-b"],
      capability: null,
      warnings: [],
      verbose: false,
    });
    assert.match(concise.summary, /envelope: \*\*failed\*\*/);
    assert.match(concise.summary, /recipient/);
    assert.doesNotMatch(concise.summary, /text_0_nonempty/);

    const verbose = formatSummary(
      {
        intent,
        steps: concise.artifact.steps,
        align: concise.artifact.align!,
        texts: ["leaf-a", "leaf-b"],
        warnings: [],
        envelope: concise.artifact,
      },
      { verbose: true },
    );
    assert.match(verbose, /text_0_nonempty/);
    assert.match(verbose, /leaf-a/);
  });
});
