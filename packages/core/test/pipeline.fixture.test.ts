import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  parseIntent,
  parsePipelineFixture,
  runPipeline,
} from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../");

describe("runPipeline fixtures", () => {
  it("Warning fixture → status warning, no artifact, align skipped", async () => {
    const fixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(
          join(root, "demos/fixtures/simulate-warning.json"),
          "utf8",
        ),
      ),
    );
    const result = await runPipeline({
      intent: parseIntent({
        protocol: "kuru",
        method: "swap",
        account: "0xcccccccccccccccccccccccccccccccccccccccc",
        params: {
          tokenIn: "native",
          tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          amountIn: "0.01",
          slippage: 50,
        },
      }),
      fixture,
    });
    assert.equal(result.status, "warning");
    assert.equal(result.artifact.verified, false);
    assert.equal(result.artifact.capability, null);
    assert.ok(result.warnings.length > 0);
    assert.ok(result.steps.some((s) => s.name === "align" && s.status === "skipped"));
  });

  it("offline ok fixture passes text+outcome align and emits verified envelope", async () => {
    const fixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(join(root, "demos/fixtures/kuru-swap-ok.json"), "utf8"),
      ),
    );
    const result = await runPipeline({
      intent: parseIntent({
        protocol: "kuru",
        method: "swap",
        account: "0xcccccccccccccccccccccccccccccccccccccccc",
        params: {
          tokenIn: "native",
          tokenOut: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
          amountIn: "0.01",
          slippage: 50,
        },
      }),
      fixture,
    });
    assert.equal(result.status, "ok");
    assert.equal(result.artifact.verified, true);
    assert.notEqual(result.artifact.capability, null);
    assert.ok(
      result.align?.checks.some((c) => c.id === "text_kuru_swap_line" && c.ok),
    );
  });
});
