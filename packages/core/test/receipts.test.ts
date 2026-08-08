import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { receiptTexts } from "../dist/index.js";

describe("receiptTexts", () => {
  it("flattens nested receipts depth-first like Moss MCP", () => {
    const texts = receiptTexts({
      text: "top",
      changes: [
        { kind: "change", text: "a" },
        {
          kind: "receipt",
          text: "nested",
          changes: [
            { kind: "change", text: "b" },
            { kind: "change", text: "c" },
          ],
        },
        { kind: "change", text: "d" },
      ],
    });
    assert.deepEqual(texts, ["a", "b", "c", "d"]);
  });
});
