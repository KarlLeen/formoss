import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFlags } from "../src/args.js";

describe("parseFlags", () => {
  it("parses value and boolean flags", () => {
    const flags = parseFlags(
      ["--intent", "a.json", "--verbose", "--out", "x.json"],
      [
        { kind: "value", name: "intent" },
        { kind: "value", name: "out" },
        { kind: "boolean", name: "verbose" },
      ],
    );
    assert.equal(flags.values.intent, "a.json");
    assert.equal(flags.values.out, "x.json");
    assert.equal(flags.booleans.verbose, true);
  });

  it("rejects unknown flags", () => {
    assert.throws(
      () => parseFlags(["--nope"], [{ kind: "boolean", name: "verbose" }]),
      /Unknown argument/,
    );
  });

  it("requires values", () => {
    assert.throws(
      () => parseFlags(["--intent"], [{ kind: "value", name: "intent" }]),
      /Missing value/,
    );
  });
});
