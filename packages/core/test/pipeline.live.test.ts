import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseIntent, runPipeline } from "../dist/index.js";

const skipLive = process.env.MOSS_SKIP_E2E === "1";

describe("runPipeline live Monad simulate", { skip: skipLive }, () => {
  it(
    "verifies a small Kuru swap and refuses a mismatched recipient",
    { timeout: 120_000 },
    async () => {
      const happy = await runPipeline({
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
          // Low floor so live quote variance still clears amountOut gate.
          expect: { estimatedAmountOut: "1" },
        }),
      });
      assert.equal(happy.status, "ok");
      assert.equal(happy.artifact.verified, true);
      assert.notEqual(happy.artifact.capability, null);
      assert.ok(happy.texts.length > 0);

      const bad = await runPipeline({
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
          expect: {
            estimatedAmountOut: "1",
            recipient: "0x1111111111111111111111111111111111111111",
          },
        }),
      });
      assert.equal(bad.status, "align_fail");
      assert.equal(bad.artifact.verified, false);
      assert.equal(bad.artifact.capability, null);
    },
  );
});
