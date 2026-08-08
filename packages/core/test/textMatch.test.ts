import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseApprovalTexts,
  parseKuruSwapText,
  parseWmonText,
} from "../dist/index.js";

describe("textMatch", () => {
  it("parses Kuru Swap leaf", () => {
    const parsed = parseKuruSwapText([
      "noise",
      "Kuru Swap: 10000000000000000 native to 223 0x754704Bc059F8C67012fEd69BC8A327a5aafb603 by 0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    ]);
    assert.ok(parsed);
    assert.equal(parsed!.amountIn, "10000000000000000");
    assert.equal(parsed!.tokenIn, "native");
    assert.equal(parsed!.amountOut, "223");
  });

  it("parses WMON wrap / Deposit leaves", () => {
    const wrap = parseWmonText(
      ["WMON wrap: 10000000000000000 for 0xcccccccccccccccccccccccccccccccccccccccc"],
      "wrap",
    );
    assert.ok(wrap);
    assert.equal(wrap!.amount, "10000000000000000");

    const deposit = parseWmonText(
      ["WMON Deposit: 10000000000000000 for 0xcccccccccccccccccccccccccccccccccccccccc"],
      "wrap",
    );
    assert.ok(deposit);
  });

  it("parses ERC20 Approval leaves", () => {
    const rows = parseApprovalTexts([
      "ERC20 Approval: 0xcccccccccccccccccccccccccccccccccccccccc approved 0xd651346d7c789536ebf06dc72ae3c8502cd695cc for 10000000000000000 native",
    ]);
    assert.equal(rows.length, 1);
    assert.equal(
      rows[0]!.spender.toLowerCase(),
      "0xd651346d7c789536ebf06dc72ae3c8502cd695cc",
    );
  });
});
