import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { captureNewPath, decideCaptureWrite } from "../src/captureWrite.js";

describe("decideCaptureWrite", () => {
  it("writes --out when not comparing", () => {
    assert.deepEqual(
      decideCaptureWrite({ compared: false, drifted: false, forceWrite: false }),
      { writeOut: true, writeNew: false, exitCode: 0 },
    );
  });

  it("writes --out when compare has no drift", () => {
    assert.deepEqual(
      decideCaptureWrite({ compared: true, drifted: false, forceWrite: false }),
      { writeOut: true, writeNew: false, exitCode: 0 },
    );
  });

  it("writes .new.json only on drift without force", () => {
    assert.deepEqual(
      decideCaptureWrite({ compared: true, drifted: true, forceWrite: false }),
      { writeOut: false, writeNew: true, exitCode: 3 },
    );
  });

  it("writes both on drift with --force-write", () => {
    assert.deepEqual(
      decideCaptureWrite({ compared: true, drifted: true, forceWrite: true }),
      { writeOut: true, writeNew: true, exitCode: 3 },
    );
  });
});

describe("captureNewPath", () => {
  it("replaces .json suffix", () => {
    assert.equal(captureNewPath("fixtures/ok.json"), "fixtures/ok.new.json");
  });

  it("appends when no .json", () => {
    assert.equal(captureNewPath("fixtures/ok"), "fixtures/ok.new.json");
  });
});
