import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertRunAllowed } from "../src/runPolicy.js";

describe("assertRunAllowed", () => {
  it("allows catalog fixture without live", () => {
    assert.deepEqual(
      assertRunAllowed({ fixture: "offline" }, { allowLive: false }),
      { mode: "fixture" },
    );
  });

  it("rejects missing fixture when live disabled", () => {
    assert.throws(
      () => assertRunAllowed({}, { allowLive: false }),
      /fixture required/,
    );
    assert.throws(
      () => assertRunAllowed({ live: true }, { allowLive: false }),
      /fixture required/,
    );
  });

  it("allows live only when env and body agree", () => {
    assert.deepEqual(
      assertRunAllowed({ live: true }, { allowLive: true }),
      { mode: "live" },
    );
  });
});
