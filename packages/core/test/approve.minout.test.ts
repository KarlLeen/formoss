import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { NATIVE } from "@themoss/core";
import { KURU_ROUTER_ADDRESS } from "@themoss/protocol-kuru";
import { USDC_ADDRESS } from "@themoss/system";
import { parseUnits } from "viem";
import {
  alignFixture,
  parseIntent,
  parsePipelineFixture,
  runPipeline,
  walkApproves,
} from "../dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../");
const account = "0xcccccccccccccccccccccccccccccccccccccccc";
const amountIn = parseUnits("0.01", 18).toString();

function kuruTexts(): string[] {
  return [
    `ERC20 Transfer: ${amountIn} native from ${account} to ${KURU_ROUTER_ADDRESS}`,
    `Kuru Swap: ${amountIn} native to 223 ${USDC_ADDRESS} by ${account}`,
    `ERC20 Transfer: 223 ${USDC_ADDRESS} from ${KURU_ROUTER_ADDRESS} to ${account}`,
  ];
}

function kuruOutcome() {
  return {
    operation: "swap",
    protocol: "kuru",
    sender: account,
    tokenIn: NATIVE,
    tokenOut: USDC_ADDRESS,
    amountIn,
    amountOut: "223",
  };
}

describe("approve gate", () => {
  it("walkApproves collects erc20.approve spenders", () => {
    const nodes = walkApproves({
      kind: "capability",
      protocol: "kuru",
      method: "swap",
      params: {},
      children: [
        {
          kind: "capability",
          protocol: "erc20",
          method: "approve",
          params: {
            token: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
            spender: KURU_ROUTER_ADDRESS,
            amount: "1",
          },
          children: [],
        },
      ],
    });
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0]!.spender.toLowerCase(), KURU_ROUTER_ADDRESS.toLowerCase());
  });

  it("fails when tree approve spender is not Kuru router", async () => {
    const fixture = parsePipelineFixture(
      JSON.parse(
        readFileSync(
          join(root, "demos/fixtures/approve-bad-spender.json"),
          "utf8",
        ),
      ),
    );
    const result = await runPipeline({
      intent: parseIntent(
        JSON.parse(
          readFileSync(join(root, "demos/approve-bad-spender.json"), "utf8"),
        ),
      ),
      fixture,
    });
    assert.equal(result.status, "align_fail");
    assert.equal(result.artifact.capability, null);
    assert.ok(
      result.align?.checks.some(
        (c) => c.id === "approval_kuru_router_0" && !c.ok,
      ),
    );
    assert.ok(
      result.align?.checks.some((c) => c.id === "expect_spender_text" && !c.ok),
    );
  });

  it("passes when tree approve matches router and Approval leaf", () => {
    const intent = parseIntent({
      protocol: "kuru",
      method: "swap",
      account,
      params: {
        tokenIn: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
        tokenOut: USDC_ADDRESS,
        amountIn,
        slippage: 50,
      },
      expect: { spender: KURU_ROUTER_ADDRESS },
    });
    const capability = {
      kind: "capability",
      protocol: "kuru",
      method: "swap",
      params: intent.params,
      children: [
        {
          kind: "capability",
          protocol: "erc20",
          method: "approve",
          params: {
            token: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
            spender: KURU_ROUTER_ADDRESS,
            amount: amountIn,
          },
          children: [],
        },
      ],
    };
    const result = alignFixture({
      intent,
      capability,
      texts: [
        `ERC20 Approval: ${account} approved ${KURU_ROUTER_ADDRESS} for ${amountIn} 0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A`,
        `ERC20 Transfer: ${amountIn} 0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A from ${account} to ${KURU_ROUTER_ADDRESS}`,
        `Kuru Swap: ${amountIn} 0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A to 223 ${USDC_ADDRESS} by ${account}`,
        `ERC20 Transfer: 223 ${USDC_ADDRESS} from ${KURU_ROUTER_ADDRESS} to ${account}`,
      ],
      outcome: {
        operation: "swap",
        protocol: "kuru",
        sender: account,
        tokenIn: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
        tokenOut: USDC_ADDRESS,
        amountIn,
        amountOut: "223",
      },
    });
    assert.equal(result.ok, true);
  });
});

describe("minAmountOut / slippage floor", () => {
  it("fails when amountOut below expect.minAmountOut", () => {
    const intent = parseIntent({
      protocol: "kuru",
      method: "swap",
      account,
      params: {
        tokenIn: NATIVE,
        tokenOut: USDC_ADDRESS,
        amountIn: "0.01",
        slippage: 50,
      },
      expect: { minAmountOut: "999999" },
    });
    const result = alignFixture({
      intent,
      texts: kuruTexts(),
      outcome: kuruOutcome(),
    });
    assert.equal(result.ok, false);
    assert.ok(result.checks.some((c) => c.id === "min_amount_out" && !c.ok));
    assert.ok(
      result.checks.some((c) => c.id === "text_min_amount_out" && !c.ok),
    );
  });

  it("derives floor from estimatedAmountOut + slippage bps", () => {
    // estimated 10000, slip 50 bps → floor 9950; amountOut 223 fails
    const intent = parseIntent({
      protocol: "kuru",
      method: "swap",
      account,
      params: {
        tokenIn: NATIVE,
        tokenOut: USDC_ADDRESS,
        amountIn: "0.01",
        slippage: 50,
      },
      expect: { estimatedAmountOut: "10000" },
    });
    const result = alignFixture({
      intent,
      texts: kuruTexts(),
      outcome: kuruOutcome(),
    });
    assert.equal(result.ok, false);
    assert.ok(result.checks.some((c) => c.id === "min_amount_out" && !c.ok));
  });

  it("passes when amountOut meets minAmountOut", () => {
    const intent = parseIntent({
      protocol: "kuru",
      method: "swap",
      account,
      params: {
        tokenIn: NATIVE,
        tokenOut: USDC_ADDRESS,
        amountIn: "0.01",
        slippage: 50,
      },
      expect: { minAmountOut: "200" },
    });
    const result = alignFixture({
      intent,
      texts: kuruTexts(),
      outcome: kuruOutcome(),
    });
    assert.equal(result.ok, true);
  });
});
