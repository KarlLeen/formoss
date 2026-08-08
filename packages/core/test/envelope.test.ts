import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  formatSummary,
  parseIntent,
  parsePipelineFixture,
  present,
  runPipeline,
} from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../");
const account = "0xcccccccccccccccccccccccccccccccccccccccc";

describe("VerificationEnvelope", () => {
  it("ok run nests capability; fail/warning omit it", async () => {
    const okFixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const ok = await runPipeline({
      intent: parseIntent({
        protocol: "kuru",
        method: "swap",
        account,
        params: {
          tokenIn: "native",
          tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          amountIn: "0.01",
          slippage: 50,
        },
      }),
      fixture: okFixture,
    });
    assert.equal(ok.status, "ok");
    assert.equal(ok.artifact.kind, "formoss.verification");
    assert.equal(ok.artifact.verified, true);
    assert.notEqual(ok.artifact.capability, null);
    assert.ok(ok.artifact.formossVersion);
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
      intent: parseIntent({
        protocol: "kuru",
        method: "swap",
        account,
        params: {
          tokenIn: "native",
          tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          amountIn: "0.01",
          slippage: 50,
        },
      }),
      fixture: warnFixture,
    });
    assert.equal(warn.status, "warning");
    assert.equal(warn.artifact.verified, false);
    assert.equal(warn.artifact.capability, null);
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
