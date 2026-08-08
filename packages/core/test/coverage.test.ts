import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALIGN_RULES,
  assertAlignRulesCoverProtocols,
  REQUIRED_PROTOCOL_METHODS,
} from "../dist/index.js";

describe("align rule coverage", () => {
  it("covers required protocol methods", () => {
    assert.ok(REQUIRED_PROTOCOL_METHODS.length >= 3);
    assert.doesNotThrow(() => assertAlignRulesCoverProtocols(ALIGN_RULES));
  });

  it("fails when a protocol rule is missing", () => {
    assert.throws(
      () => assertAlignRulesCoverProtocols([]),
      /missing protocol-specific matchers/,
    );
  });
});
