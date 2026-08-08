import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NATIVE } from "@themoss/core";
import { USDC_ADDRESS } from "@themoss/system";
import { parseUnits } from "viem";
import { alignFixture, parseIntent } from "../dist/index.js";

const account = "0xcccccccccccccccccccccccccccccccccccccccc";
const amountIn = parseUnits("0.01", 18).toString();
const floorExpect = { estimatedAmountOut: "223" } as const;

function kuruTexts(opts?: { sender?: string; amountOut?: string }): string[] {
  const sender = opts?.sender ?? account;
  const amountOut = opts?.amountOut ?? "223";
  return [
    `ERC20 Transfer: ${amountIn} native from ${account} to 0xd651346d7c789536ebf06dc72ae3c8502cd695cc`,
    `Kuru Swap: ${amountIn} native to ${amountOut} ${USDC_ADDRESS} by ${sender}`,
    `ERC20 Transfer: ${amountOut} ${USDC_ADDRESS} from 0xd651346d7c789536ebf06dc72ae3c8502cd695cc to ${sender}`,
  ];
}

function kuruOutcome(opts?: { sender?: string; amountOut?: string }) {
  return {
    operation: "swap",
    protocol: "kuru",
    sender: opts?.sender ?? account,
    tokenIn: NATIVE,
    tokenOut: USDC_ADDRESS,
    amountIn,
    amountOut: opts?.amountOut ?? "223",
  };
}

describe("alignFixture", () => {
  it("passes when outcome and Receipt texts both match intent", () => {
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
      expect: floorExpect,
    });
    const result = alignFixture({
      intent,
      texts: kuruTexts(),
      outcome: kuruOutcome(),
    });
    assert.equal(result.ok, true);
    assert.ok(result.checks.some((c) => c.id === "text_kuru_swap_line" && c.ok));
    assert.ok(result.checks.some((c) => c.id === "dual_amount_in" && c.ok));
    assert.ok(
      result.checks.some((c) => c.id === "slippage_floor_missing" && c.ok),
    );
  });

  it("fails when expect.recipient does not match text/outcome sender", () => {
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
      expect: {
        ...floorExpect,
        recipient: "0x1111111111111111111111111111111111111111",
      },
    });
    const result = alignFixture({
      intent,
      texts: kuruTexts(),
      outcome: kuruOutcome(),
    });
    assert.equal(result.ok, false);
    assert.ok(result.checks.some((c) => c.id === "text_recipient" && !c.ok));
    assert.ok(result.checks.some((c) => c.id === "recipient" && !c.ok));
  });

  it("fails when Kuru Swap leaf text is missing even if outcome looks fine", () => {
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
      expect: floorExpect,
    });
    const result = alignFixture({
      intent,
      texts: [
        `ERC20 Transfer: ${amountIn} native from ${account} to 0xd651346d7c789536ebf06dc72ae3c8502cd695cc`,
        `ERC20 Transfer: 223 ${USDC_ADDRESS} from 0xd651346d7c789536ebf06dc72ae3c8502cd695cc to ${account}`,
      ],
      outcome: kuruOutcome(),
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.checks.some((c) => c.id === "text_kuru_swap_line" && !c.ok),
    );
  });

  it("fails when outcome and text disagree (dual-source)", () => {
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
      expect: floorExpect,
    });
    const result = alignFixture({
      intent,
      texts: kuruTexts({ amountOut: "223" }),
      outcome: kuruOutcome({ amountOut: "999" }),
    });
    assert.equal(result.ok, false);
    assert.ok(result.checks.some((c) => c.id === "dual_amount_out" && !c.ok));
  });

  it("fails when leaf texts are missing", () => {
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
      expect: floorExpect,
    });
    const result = alignFixture({
      intent,
      texts: [],
      outcome: kuruOutcome(),
    });
    assert.equal(result.ok, false);
  });

  it("aligns WMON wrap via WMON + Native MON Transfer leaves", () => {
    const intent = parseIntent({
      protocol: "wmon",
      method: "wrap",
      account,
      params: { amount: "0.01" },
    });
    const amount = parseUnits("0.01", 18).toString();
    const result = alignFixture({
      intent,
      texts: [
        `Native MON Transfer: ${amount} from ${account} to 0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A`,
        `WMON Deposit: ${amount} for ${account}`,
        `WMON wrap: ${amount} for ${account}`,
      ],
      outcome: {
        operation: "wrap",
        account,
        amount,
      },
    });
    assert.equal(result.ok, true);
    assert.ok(result.checks.some((c) => c.id === "text_wmon_line" && c.ok));
  });
});
